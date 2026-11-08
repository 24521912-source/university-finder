# Database

Project dùng **MongoDB Atlas** (cloud): cả nhóm dùng chung một database, **không cần cài MongoDB trên máy**.
Backend kết nối qua thư viện `mongoose` (đã có trong `backend/package.json`, `npm install` là đủ).

## Cấu trúc thư mục

```text
database/
├─ mongodb/schema.md   # Mô tả collections, field, quy ước dữ liệu
├─ seeds/              # Dữ liệu nạp ban đầu (JSON), lưu trong git
│  ├─ majors.json
│  └─ universities.json
└─ diagrams/           # Sơ đồ dữ liệu cho báo cáo
```

Model Mongoose (định nghĩa kiểu dữ liệu thật) nằm ở `backend/src/models/`.

## Thiết lập cho thành viên mới

1. Nhờ người quản lý Atlas: tạo database user cho bạn (quyền `readWrite` trên `unimatch_hcmc`) và thêm IP của bạn vào **Network Access**.
2. Copy `backend/.env.example` thành `backend/.env`, dán connection string nhận được (gửi riêng, **không commit `.env`**).
3. `cd backend && npm install && npm run dev`

## Dữ liệu gốc là MongoDB Atlas

- **Atlas là bản gốc.** Mọi trang web đọc dữ liệu từ Atlas qua API; frontend không đọc file JSON.
- Sửa dữ liệu trường (ngành, học phí, điểm chuẩn, liên hệ…) bằng trang **/admin** trên web (tài khoản admin), hoặc bằng MongoDB Compass. Sửa xong cả nhóm thấy ngay.
- File `seeds/*.json` chỉ để **nạp lần đầu** hoặc khôi phục khi database trống.

## Seed dữ liệu

```bash
cd backend
npm run seed -- --dry-run     # xem trước sẽ thêm/sửa gì, KHÔNG ghi
npm run seed -- --overwrite   # ghi thật (bắt buộc khi database đã có dữ liệu)
```

- Upsert theo `Major.code` và `University.slug`; chỉ ghi field có nội dung khác database, field giống hệt giữ nguyên (kể cả `_id` từng dòng).
- ⚠️ Field nào khác giữa JSON và database sẽ bị **thay bằng bản JSON**, kể cả bản admin vừa sửa trên web. Luôn chạy `--dry-run` trước và báo cả nhóm trước khi ghi.
- Database trống (lần đầu): `npm run seed` là đủ.

## Quy ước dữ liệu

- Tiền lưu số nguyên VND (`20000000`), không lưu chuỗi "20 triệu/năm".
- Ngành của trường tham chiếu mã trong danh mục ngành (collection `majors`) — trang admin từ chối mã ngành chưa có trong danh mục.
- Điểm chuẩn luôn có `year`, `method`, `majorCode`, `scale` (30 hoặc 1200).
- Không có dữ liệu thì bỏ trống/`null`, không tự đoán.
