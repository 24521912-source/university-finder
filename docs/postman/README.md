# Thử API bằng Postman

File `UniMatch.postman_collection.json` chứa 63 request, phủ đủ 38/38 endpoint có trong tài liệu apidoc, chia 6 thư mục:

| Thư mục | Nội dung | Cần đăng nhập |
|---|---|---|
| 0. Hệ thống | Health check | Không |
| 1. Trường đại học (công khai) | Danh sách, tìm kiếm, lọc, chi tiết, so sánh, bản đồ, ngành | Không |
| 2. Tài khoản người dùng | Đăng ký, đăng nhập, xem/sửa hồ sơ, đổi mật khẩu, quên/đặt lại mật khẩu | Tự lấy token |
| 3. Yêu thích và lịch sử tư vấn | Thêm/bỏ yêu thích, lưu/xem/xóa kết quả tư vấn | Token từ thư mục 2 |
| 4. Quản trị (admin) | Dashboard, xem trường, tìm/khóa/mở/xóa tài khoản, xem lịch sử | Tài khoản admin |
| 5. Quản trị: thêm, sửa, xóa | Tạo/sửa/xóa trường, khôi phục từ lịch sử, tạo tài khoản hộ, đổi vai trò, trao quyền, xóa lịch sử | Token admin từ thư mục 4 |

Thư mục 5 chỉ ghi lên **một trường và một tài khoản do chính nó tạo**, chạy xong thì xóa đi. Đổi vai trò, trao quyền và
xóa lịch sử cần quyền cao hơn admin thường; kết quả mong đợi (200 hay 403) tự đổi theo tài khoản đăng nhập ở thư mục 4.

`POST /auth/reset-password` chỉ có ca lỗi (mã sai), vì mã đúng nằm trong email. Muốn thử ca thành công, chạy
**Quên mật khẩu**, mở email, lấy đoạn mã 64 ký tự trong link rồi dán vào `token`.

Mỗi request có script kiểm tra mã trạng thái (kể cả các ca lỗi 400/401/403/404/409).
Token sau khi đăng nhập được tự lưu vào biến `token` / `adminToken`, không cần copy tay.

## Cách chạy

1. Chạy backend: `cd backend && npm run dev` (mặc định `http://localhost:5000`).
2. Mở Postman → **Import** → chọn file `UniMatch.postman_collection.json`.
3. Nếu backend ở địa chỉ khác, sửa biến `baseUrl` (bấm vào collection → tab **Variables**).
4. Muốn chạy thư mục 4: điền `adminEmail`, `adminPassword` trong tab **Variables**.
   Chưa có admin thì tạo bằng `node src/makeAdmin.js` trong thư mục `backend`.
5. Chạy từng request, hoặc bấm **Run collection** để chạy hết và xem bảng kết quả Pass/Fail.

Lưu ý: thư mục 2 tạo một tài khoản test (`postman<số>@example.com`) mỗi lần chạy.
Request cuối của thư mục 4 xóa tài khoản đó. Nếu không chạy thư mục 4, tài khoản test sẽ còn trong DB.
Tài khoản bị xóa là xóa mềm, và các dòng lịch sử thay đổi của dữ liệu test vẫn còn trong tab Lịch sử.
