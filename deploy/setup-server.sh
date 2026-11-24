#!/usr/bin/env bash
# Cài đặt UniMatch HCMC lên VPS Ubuntu 22.04/24.04: Node.js, PM2, Nginx, HTTPS.
#
# Chạy TRONG thư mục repo đã clone, bằng user thường (không phải root):
#   bash deploy/setup-server.sh unimatch.tech email-nhan-thong-bao@example.com
#
# Chạy lại nhiều lần được: bước nào đã làm thì bỏ qua (hoặc chỉ build + reload lại).
set -euo pipefail

DOMAIN="${1:-unimatch.tech}"
EMAIL="${2:-}"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

step() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m[!] %s\033[0m\n' "$*"; }

if [ "$(id -u)" -eq 0 ]; then
  echo "Hãy chạy bằng user thường (vd: azureuser), script tự gọi sudo khi cần."
  exit 1
fi

# ---------- 1. Biến môi trường backend ----------
if [ ! -f "$APP_DIR/backend/.env" ]; then
  cp "$APP_DIR/backend/.env.example" "$APP_DIR/backend/.env"
  sed -i "s#^APP_URL=.*#APP_URL=https://$DOMAIN#" "$APP_DIR/backend/.env"
  warn "Đã tạo backend/.env. Mở file điền MONGODB_URI, JWT_SECRET, SMTP_USER, SMTP_PASS:"
  warn "  nano $APP_DIR/backend/.env"
  warn "rồi chạy lại script này."
  exit 1
fi
if grep -qE '<user>|<chuoi-ngau-nhien' "$APP_DIR/backend/.env"; then
  warn "backend/.env vẫn còn giá trị mẫu (<user>, <chuoi-ngau-nhien...>). Điền xong rồi chạy lại."
  exit 1
fi

# ---------- 2. Gói hệ thống ----------
step "Cài git, nginx, certbot"
sudo apt-get update -y
sudo apt-get install -y git nginx certbot python3-certbot-nginx curl

if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  step "Cài Node.js 24 LTS"
  curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null; then
  step "Cài PM2 (global)"
  sudo npm install -g pm2
fi

# Máy 1 GB RAM dễ bị kill khi build frontend -> thêm 2 GB swap
if [ "$(free -m | awk '/^Swap:/ {print $2}')" -eq 0 ] && [ "$(free -m | awk '/^Mem:/ {print $2}')" -lt 2000 ]; then
  step "Tạo swap 2 GB"
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

# ---------- 3. Tường lửa ----------
step "Mở cổng SSH, HTTP, HTTPS"
sudo ufw allow OpenSSH >/dev/null
sudo ufw allow 'Nginx Full' >/dev/null
sudo ufw --force enable

# ---------- 4. Build ----------
step "Cài thư viện + tạo tài liệu API (backend)"
cd "$APP_DIR/backend"
npm ci
npm run docs

step "Build frontend"
cd "$APP_DIR/frontend"
npm ci
VITE_API_URL=/api npm run build

# ---------- 5. PM2 ----------
step "Chạy API bằng PM2"
cd "$APP_DIR"
if pm2 describe unimatch-api >/dev/null 2>&1; then
  pm2 reload unimatch-api
else
  pm2 start process.json --only unimatch-api --env production
fi
pm2 save
sudo env PATH="$PATH:/usr/bin" "$(command -v pm2)" startup systemd -u "$USER" --hp "$HOME" >/dev/null

# ---------- 6. Nginx ----------
step "Cấu hình Nginx cho $DOMAIN"
# Ubuntu mới đặt quyền thư mục home 750 -> Nginx (www-data) không đọc được frontend/dist
chmod o+x "$HOME"

SITE=/etc/nginx/sites-available/unimatch
if [ -f "$SITE" ] && grep -q ssl_certificate "$SITE"; then
  echo "Đã có cấu hình HTTPS từ certbot, giữ nguyên $SITE"
else
  sed -e "s/unimatch\.tech/$DOMAIN/g" \
      -e "s#/home/azureuser/university-finder#$APP_DIR#g" \
      "$APP_DIR/deploy/nginx/unimatch.conf" | sudo tee "$SITE" >/dev/null
fi
sudo ln -sf "$SITE" /etc/nginx/sites-enabled/unimatch
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# ---------- 7. HTTPS ----------
SERVER_IP="$(curl -fsS https://api.ipify.org || true)"
DNS_IP="$(getent ahostsv4 "$DOMAIN" | awk 'NR==1 {print $1}' || true)"
if [ -n "$SERVER_IP" ] && [ "$SERVER_IP" = "$DNS_IP" ]; then
  if ! sudo test -d "/etc/letsencrypt/live/$DOMAIN"; then
    step "Xin chứng chỉ HTTPS (Let's Encrypt)"
    if [ -n "$EMAIL" ]; then MAIL_OPT=(-m "$EMAIL"); else MAIL_OPT=(--register-unsafely-without-email); fi
    sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
      --non-interactive --agree-tos --redirect "${MAIL_OPT[@]}"
  fi
else
  warn "DNS của $DOMAIN đang trỏ về '${DNS_IP:-chưa có}', còn IP máy này là '${SERVER_IP:-?}'."
  warn "Tạo bản ghi A (@ và www) trỏ về $SERVER_IP, đợi vài phút rồi chạy lại script để bật HTTPS."
fi

# ---------- 8. Kiểm tra ----------
step "Kiểm tra"
sleep 2
curl -fsS http://127.0.0.1:5000/api/health && echo
pm2 status
echo
echo "Xong. Mở https://$DOMAIN  |  API: https://$DOMAIN/api/health  |  Tài liệu: https://$DOMAIN/api-docs/"
