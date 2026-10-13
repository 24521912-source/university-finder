# Database

Project dùng **MongoDB Atlas** (cloud): cả nhóm dùng chung một database, **không cần cài MongoDB trên máy**.
Backend kết nối qua thư viện `mongoose` (đã có trong `backend/package.json`, `npm install` là đủ).

## Cấu trúc thư mục

```text
database/
├─ mongodb/schema.md   # Mô tả collections, field, quy ước dữ liệu
├─ seeds/              # Dữ liệu gốc (JSON) — nguồn chuẩn, lưu trong git
│  ├─ majors.json
│  └─ universities.json
└─ diagrams/           # Sơ đồ dữ liệu cho báo cáo
```

Model Mongoose (định nghĩa kiểu dữ liệu thật) nằm ở `backend/src/models/`.

## Thiết lập cho thành viên mới

1. Nhờ người quản lý Atlas: tạo database user cho bạn (quyền `readWrite` trên `unimatch_hcmc`) và thêm IP của bạn vào **Network Access**.
2. Copy `backend/.env.example` thành `backend/.env`, dán connection string nhận được (gửi riêng, **không commit `.env`**).
3. `cd backend && npm install && npm run dev`

## Seed dữ liệu

```bash
cd backend
npm run seed
```

- Đọc `database/seeds/*.json` rồi upsert lên Atlas theo `Major.code` và `University.slug`; chạy lại nhiều lần không tạo bản trùng.
- File JSON trong git là **bản gốc**: thêm/sửa dữ liệu thì sửa JSON rồi chạy seed. Nếu ai lỡ xóa dữ liệu trên Atlas, chạy lại seed để khôi phục.
- Seed ghi đè các field có trong JSON — sửa trực tiếp trên Atlas mà không cập nhật JSON sẽ bị mất ở lần seed sau.

## Quy ước dữ liệu

- Tiền lưu số nguyên VND (`20000000`), không lưu chuỗi "20 triệu/năm".
- Ngành của trường tham chiếu mã trong `majors.json` — thêm ngành mới vào `majors.json` trước.
- Điểm chuẩn luôn có `year`, `method`, `majorCode`, `scale` (30 hoặc 1200).
- Không có dữ liệu thì bỏ trống/`null`, không tự đoán.
