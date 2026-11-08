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

## Sao lưu và khôi phục

Gói Atlas miễn phí (M0) không tự sao lưu. Ngoài lịch sử thay đổi trên trang /admin (khôi phục từng trường / tài khoản), nên sao lưu toàn bộ định kỳ và trước mỗi lần chạy seed:

```bash
cd backend
npm run backup                                                     # -> backups/<ngày-giờ>/<collection>.json
npm run restore-backup -- ../backups/<ngày-giờ> universities       # chạy thử: in số bản ghi sẽ ghi
npm run restore-backup -- ../backups/<ngày-giờ> universities --overwrite   # ghi thật
```

- File sao lưu dạng Extended JSON (giữ đúng ObjectId / Date); mở được bằng MongoDB Compass (Import).
- Khôi phục từng collection một, ghi đè theo `_id`; bản ghi chỉ có trong database giữ nguyên.
- ⚠️ `backups/` chứa mật khẩu đã mã hóa của người dùng: đã nằm trong `.gitignore`, không gửi ra ngoài nhóm.

## Quy ước dữ liệu

- Tiền lưu số nguyên VND (`20000000`), không lưu chuỗi "20 triệu/năm".
- Ngành của trường tham chiếu mã trong danh mục ngành (collection `majors`) — trang admin từ chối mã ngành chưa có trong danh mục.
- Điểm chuẩn luôn có `year`, `method`, `majorCode`, `scale` (30 hoặc 1200).
- `admissions[].verifiedForAI = true`: dòng đã kiểm tra đúng phương thức, năm, thang điểm và là chương trình chuẩn → AI tư vấn được dùng để so điểm (`aiNote` là lưu ý hiện kèm). Mặc định `false`; bật/tắt trên trang /admin.
- `sourceDomains` của trường (vd `["uit.edu.vn"]`): ngành / học phí có link nguồn thuộc các tên miền này mới được AI và trang chi tiết coi là đã xác minh.
- Không có dữ liệu thì bỏ trống/`null`, không tự đoán.
