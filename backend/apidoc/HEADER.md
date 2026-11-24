Tài liệu được tạo tự động bằng [apidoc](https://apidocjs.com) từ các file `backend/apidoc/*.js`.
Tạo lại: `cd backend && npm run docs`. Khi chạy backend, tài liệu có tại `<địa chỉ backend>/api-docs`.

### Quy ước chung

- **Base URL:** `http://localhost:5000/api` khi chạy local; khi deploy là `https://<tên miền API>/api`.
- Gửi và nhận **JSON**.
- **API cần đăng nhập** (🔒): gửi header `Authorization: Bearer <token>`. Token lấy từ `POST /auth/login` hoặc `POST /auth/register`, có hạn 7 ngày.
- **API quản trị** (🛡️): token của tài khoản có `role` là `admin` hoặc `superadmin`.
- **Lỗi** luôn có dạng `{ "message": "Câu báo lỗi tiếng Việt" }`:

| Mã | Ý nghĩa |
|---|---|
| 400 | Dữ liệu gửi lên sai |
| 401 | Chưa đăng nhập, token sai / hết hạn, tài khoản bị khóa hoặc đã xóa |
| 403 | Không đủ quyền |
| 404 | Không tìm thấy |
| 409 | Trùng dữ liệu |
| 500 | Lỗi máy chủ |
