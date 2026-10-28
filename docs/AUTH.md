# Authentication và điều hướng theo quyền

Phần đăng ký/đăng nhập, User model, JWT, requireAuth/requireAdmin, AuthContext và Header đã có trong foundation trên develop. PR Auth này chỉ bổ sung phần còn thiếu, không tạo lại các thành phần dùng chung.

- /login và /dang-nhap dùng chung form đăng nhập.
- /signup và /dang-ky dùng chung form đăng ký.
- Đăng ký công khai chỉ nhận role bỏ trống hoặc user. Validation và service đều từ chối role khác; User.create chỉ nhận các field được phép và luôn gán role user.
- AuthProvider trả thông tin tài khoản sau khi lưu phiên. Login mặc định đưa user tới /profile, admin tới /admin. state.from chỉ được dùng nếu pathname nội bộ đã biết và tài khoản có quyền. Không nhận URL bên ngoài hoặc cho user vào route admin.
- Giữ nguyên middleware backend: xác minh JWT rồi lấy tài khoản MongoDB; requireAdmin quyết định theo role hiện tại trong database, không chỉ dựa vào claim role trong JWT.
- Không tạo tài khoản hoặc thay đổi role qua PR này; script cấp quyền và Dashboard thuộc PR Admin riêng.

## Phạm vi độc lập

/profile dùng cùng placeholder ComingSoon đã có cho /ca-nhan. /admin/* giữ nguyên placeholder được bảo vệ adminOnly trên develop. Đây là điểm đến để kiểm thử Auth chạy độc lập; chưa bao gồm giao diện Profile hoặc Admin Dashboard. Những giao diện đó sẽ được thay trong các PR riêng.

Không thay đổi Home, AI, Compare, University Detail, dependencies, Header, schema hoặc cấu hình môi trường.

## Kiểm thử

Backend: `node --test tests/auth.test.cjs`.

Frontend: `node --test src/features/auth/loginDestination.test.js`; `npm run lint`; `npm run build`.

Test backend dùng model giả trong RAM và JWT với khóa ngẫu nhiên chỉ dành cho tiến trình kiểm thử, không kết nối Atlas, không chạy seed hoặc tạo tài khoản thật. Kiểm tra role injection, whitelist field, login, JWT sai/hết hạn và requireAdmin theo role từ model. Test frontend kiểm tra điều hướng mặc định và state.from đúng quyền.
