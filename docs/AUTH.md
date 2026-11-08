# Tài khoản, đăng nhập và phân quyền

## Đăng ký / đăng nhập

- /login và /dang-nhap dùng chung form đăng nhập; /signup và /dang-ky dùng chung form đăng ký.
- Đăng ký công khai luôn tạo `role: user` (validation và service đều từ chối role khác). Mật khẩu tối thiểu 6 ký tự; email kiểm tra định dạng, chưa gửi mail xác nhận.
- Đăng nhập xong: người dùng tới /profile, quản trị viên (admin / superadmin) tới /admin. `state.from` chỉ dùng khi là đường dẫn nội bộ đã biết và tài khoản có quyền.
- Tài khoản bị khóa: đăng nhập trả 403. Tài khoản đã xóa (xóa mềm): báo sai email / mật khẩu.
- Backend xác minh JWT rồi đọc tài khoản trong MongoDB ở **mỗi request**: quyền, khóa, xóa có hiệu lực ngay, không chờ token hết hạn.

## Trang Cá nhân

- Sửa họ tên (`PUT /auth/me`), đổi mật khẩu (`PUT /auth/password`, cần mật khẩu hiện tại).
- Tài khoản do quản trị viên tạo hộ có `mustChangePassword`: đầu mỗi trang hiện dòng nhắc đổi mật khẩu cho tới khi đổi.

## Vai trò

| Vai trò | Tạo bằng | Được làm |
|---|---|---|
| `user` | Tự đăng ký, hoặc admin tạo hộ | Dùng web, yêu thích, sửa hồ sơ |
| `admin` | `npm run make-admin -- email`, hoặc được nâng trên /admin | Sửa dữ liệu trường; tạo hộ / khóa / xóa user thường |
| `admin` + `canManageAdmins` | Superadmin trao quyền trên /admin | Thêm: nâng user lên admin; hạ / khóa / xóa admin thường |
| `superadmin` | Chỉ `npm run make-admin -- email --super` (tối đa 2) | Mọi việc trên; trao / thu `canManageAdmins`; xóa dòng lịch sử |

Không ai thao tác lên chính mình hoặc lên superadmin qua web. Quy tắc nằm ở `backend/src/utils/roles.js` (`denyReason`); frontend `utils/roles.js` chỉ để ẩn / hiện nút.

Middleware: `requireAuth`, `requireAdmin` (admin hoặc superadmin), `requireSuperadmin` trong `backend/src/middlewares/auth.js`. Frontend: `isAdmin(user)` trong `utils/roles.js` (Header, ProtectedRoute, điều hướng sau đăng nhập).

## Kiểm thử

Backend: `node --test tests/*.cjs` — model giả trong RAM, JWT khóa ngẫu nhiên, không kết nối Atlas. Có test: role injection khi đăng ký, khóa / xóa mềm chặn đăng nhập và token cũ, ma trận phân quyền, tạo hộ, lịch sử không chứa passwordHash.

Frontend: `node --test` các file `*.test.js`, `npm run lint`, `npm run build`.
