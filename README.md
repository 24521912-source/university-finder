# university Finder

University Finder là hệ thống hỗ trợ người dùng tìm kiếm, so sánh và nhận gợi ý trường đại học/ngành học dựa trên điểm số, khu vực, sở thích và thông tin tuyển sinh.

## Công nghệ sử dụng

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MongoDB Atlas (cloud, dùng chung cả nhóm, không cần cài MongoDB trên máy) — xem `database/README.md`
- ODM: Mongoose (`backend/src/models/`)
- Package manager: npm

## Cấu trúc project

```text
university-finder/
├─ frontend/        # Giao diện người dùng
├─ backend/         # API server và xử lý nghiệp vụ
│  └─ apidoc/       # Nguồn tài liệu API (apidoc) -> npm run docs
├─ database/        # Script, schema, dữ liệu mẫu
├─ deploy/nginx/    # Cấu hình Nginx khi deploy lên VPS
├─ docs/            # Tài liệu dự án (DEPLOYMENT.md: hướng dẫn deploy)
├─ tools/github-project/  # Script tạo bảng Kanban GitHub Project
├─ .github/         # CI, AI review (Gemini), mẫu issue / PR
├─ process.json     # Cấu hình PM2 (nhiều app, cluster)
└─ README.md
```

## Cách chạy project
-- CHẠY FRONTEND
cd frontend
npm install
npm run dev

--CHẠY BACKEND (cần backend/.env có MONGODB_URI, xem database/README.md)
cd backend
npm install 
npm run seed   # chỉ khi database trống; database đã có dữ liệu thì xem database/README.md
npm run dev

## Tài liệu API (apidoc)

```
cd backend
npm run docs        # tạo tài liệu vào backend/public/api-docs
npm run dev         # mở http://localhost:5000/api-docs
```

Sửa tài liệu trong `backend/apidoc/*.js` khi thêm / đổi API.

## Chạy bằng PM2 (production)

Cài PM2 global một lần, dùng chung cho mọi dự án Node.js trên máy: `npm install -g pm2`

Chạy các lệnh dưới đây tại thư mục gốc repo (nơi có `process.json`):

```
pm2 start process.json --only unimatch-api --env development   # chạy API với biến env_development
pm2 start process.json --only unimatch-api --env production    # trên server: biến env_production
pm2 ps                    # danh sách tiến trình: id, trạng thái, số lần restart, CPU, RAM (= pm2 status)
pm2 monit                 # theo dõi CPU / RAM / log theo thời gian thực
pm2 logs unimatch-api     # xem log (ghi vào backend/logs/api-out.log và api-error.log)
pm2 restart all           # restart mọi tiến trình
pm2 reload unimatch-api   # restart lần lượt từng instance, không gián đoạn
pm2 stop <id>             # dừng tiến trình có id tương ứng
pm2 delete <id>           # xoá tiến trình khỏi danh sách PM2
pm2 save && pm2 startup   # lưu danh sách và tự chạy lại API khi server khởi động lại (Linux)
```

Các tùy chọn trong `process.json` (app `unimatch-api`):

| Tùy chọn | Ý nghĩa |
|---|---|
| `exec_mode: cluster`, `instances: 2` | Chạy 2 tiến trình API trên một server, dùng 2 nhân CPU để xử lý request song song. Đổi thành `"max"` để dùng hết số nhân |
| `env_development`, `env_production` | Biến môi trường theo từng môi trường, chọn bằng `--env`. Mật khẩu (MONGODB_URI, JWT_SECRET, SMTP_PASS) vẫn để trong `backend/.env` để không đưa lên git |
| `error_file`, `out_file`, `merge_logs` | Ghi log của cả 2 instance vào chung 2 file trong `backend/logs/` |
| `wait_ready`, `listen_timeout` | PM2 chờ API nối xong database và gửi tín hiệu `ready` mới coi là online (tối đa 15 giây) |
| `kill_timeout` | Khi stop / reload, API được 5 giây để trả lời nốt request đang chạy rồi mới bị buộc dừng |
| `max_memory_restart`, `autorestart` | Tự restart khi API vượt 300 MB RAM hoặc bị lỗi dừng đột ngột |
| `watch: false`, `ignore_watch` | Không tự restart khi file thay đổi (production). Nếu bật watch thì bỏ qua `node_modules`, `public`, `logs` |

Mở rộng: `instances` giúp tận dụng nhiều CPU trên một server. Khi cần nhiều server hơn, chạy cùng `process.json` này trên server A, B, C rồi để Nginx chia request giữa các server (load balancing).

Deploy đầy đủ (domain, DNS, Nginx, HTTPS, cloud): `docs/DEPLOYMENT.md`.

## Quản lý dự án trên GitHub

- **Kanban:** `gh auth refresh -s project` rồi `node tools/github-project/setup-project.mjs` (xem trước: thêm `--dry-run`).
- **CI:** mỗi Pull Request tự chạy test, lint, build (`.github/workflows/ci.yml`).
- **AI review:** Gemini tự review mỗi commit trong PR (`.github/workflows/gemini-review.yml`, cần secret `GEMINI_API_KEY`).
- Báo lỗi bằng mẫu **🐞 Báo lỗi** khi tạo issue. Bật *Project → Workflows → Auto-add to project* để issue mới tự vào bảng Kanban.

## Quy ước làm việc nhóm
Không commit node_modules
Không commit file .env
Khi thêm thư mục mới, cần cập nhất 
    docs/PROJECT_STRUCTURE.md
Code frontend đặt trong frontend/src
Code backend đặt trong backend/src

## Quản trị

Website không cho tự đăng ký làm quản trị. Người có `backend/.env` chạy trong `backend`:

```
npm run make-admin -- email@example.com           # quản trị viên
npm run make-admin -- email@example.com --super   # quản trị viên cấp cao (tối đa 2)
```

Sau đó quản trị cấp cao phân quyền tiếp trên trang /admin, tab Tài khoản. Hướng dẫn trang quản trị, lịch sử và sao lưu: docs/ADMIN.md; vai trò: docs/AUTH.md.
