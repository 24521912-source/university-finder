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
├─ frontend/    # Giao diện người dùng
├─ backend/     # API server và xử lý nghiệp vụ
├─ database/    # Script, schema, dữ liệu mẫu
├─ docs/        # Tài liệu dự án
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

Sau đó quản trị cấp cao phân quyền tiếp trên trang /admin, tab Tài khoản (xem docs/API_CONTRACT.md).
