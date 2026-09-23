# university Finder

University Finder là hệ thống hỗ trợ người dùng tìm kiếm, so sánh và nhận gợi ý trường đại học/ngành học dựa trên điểm số, khu vực, sở thích và thông tin tuyển sinh.

## Công nghệ sử dụng

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: 
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

--CHẠY BACKEND
cd backend
npm install 
npm run dev


## Quy ước làm việc nhóm
Không commit node_modules
Không commit file .env
Khi thêm thư mục mới, cần cập nhất 
    docs/PROJECT_STRUCTURE.md
Code frontend đặt trong frontend/src
Code backend đặt trong backend/src