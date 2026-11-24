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

```
npm install -g pm2                                        # cài global 1 lần
pm2 start process.json --only unimatch-api --env production   # chạy tại thư mục gốc repo
pm2 status | pm2 monit | pm2 logs unimatch-api
pm2 save && pm2 startup                                   # tự chạy lại khi khởi động máy (Linux)
```

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
