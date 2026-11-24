# Gửi email (quên mật khẩu)

Backend gửi thư qua SMTP bằng `nodemailer` (code: `backend/src/utils/mailer.js`). Hiện chỉ dùng cho chức năng **Quên mật khẩu**.

## Luồng

1. Trang đăng nhập → **Quên mật khẩu?** → `/quen-mat-khau`, nhập email.
2. Backend tạo mã ngẫu nhiên, lưu **hash** của mã vào tài khoản, gửi link `/dat-lai-mat-khau?token=...` (hạn 30 phút).
3. Người dùng mở link, nhập mật khẩu mới → được đăng nhập luôn, các thiết bị khác bị đăng xuất.

Chi tiết API: [API_CONTRACT.md](API_CONTRACT.md#post-authforgot-password).

## Chạy local (không cần cấu hình)

Để trống `SMTP_USER` / `SMTP_PASS` trong `backend/.env`. Khi bấm gửi, nội dung thư (kèm link) được **in ra terminal đang chạy backend**: copy link mở trên trình duyệt là thử được.

## Gửi thật bằng Gmail

1. Dùng một tài khoản Gmail riêng cho dự án (không dùng Gmail cá nhân).
2. Bật **Xác minh 2 bước**: https://myaccount.google.com/security
3. Tạo **Mật khẩu ứng dụng**: https://myaccount.google.com/apppasswords → đặt tên (vd. `unimatch`) → Google hiện mã 16 ký tự.
4. Thêm vào `backend/.env` (trên server thì thêm vào biến môi trường của Vercel / PM2):

   ```env
   APP_URL=http://localhost:5173        # trên server: địa chỉ web thật, vd. https://unimatch.example
   SMTP_USER=ten.du.an@gmail.com
   SMTP_PASS=abcdefghijklmnop            # mật khẩu ứng dụng, viết liền không dấu cách
   ```

5. Khởi động lại backend.

- Không commit file `.env`, không gửi mật khẩu ứng dụng cho người khác. Lộ thì vào trang App passwords xóa rồi tạo mã mới.
- Gmail giới hạn khoảng 500 thư/ngày, đủ cho đồ án.
- Dùng dịch vụ khác (Outlook, Brevo, Mailtrap…): đặt thêm `SMTP_HOST`, `SMTP_PORT` (465 hoặc 587) và `MAIL_FROM` nếu cần.
- Trên server (`NODE_ENV=production`) mà chưa cấu hình thì API trả `503` để báo lỗi rõ ràng, không im lặng nuốt thư.
