# Trang quản trị (/admin)

Chỉ quản trị viên (`admin`, `superadmin`) vào được. Mọi thay đổi ghi thẳng vào MongoDB Atlas và hiện ngay trên các trang công khai. API chi tiết: `docs/API_CONTRACT.md`; vai trò: `docs/AUTH.md`.

## Tab Dữ liệu trường

- Tìm, phân trang, thêm / sửa / xóa trường.
- Form sửa: thông tin cơ bản, tên miền nguồn chính thức (`sourceDomains`), địa chỉ / liên hệ, bảng Ngành, Học phí, Điểm chuẩn (thêm / xóa dòng, lọc dòng), riêng Bách khoa có ô JSON "Dữ liệu duyệt riêng".
- Cột **Xác minh cho AI** ở bảng Điểm chuẩn: chỉ bật khi đã kiểm tra đúng phương thức, năm, thang điểm và là chương trình chuẩn. AI tư vấn chỉ so điểm với các dòng này. Tick nhầm thì bỏ tick và lưu lại.
- Backend từ chối mã ngành chưa có trong danh mục, học phí / điểm chuẩn trỏ tới ngành không thuộc trường.

## Tab Tài khoản

- Tìm, lọc theo vai trò / trạng thái.
- **Tạo tài khoản hộ** (vd người dùng gọi điện nhờ): nhập họ tên, email, mật khẩu tạm (web tạo sẵn, tránh ký tự dễ nhầm). Tài khoản luôn là user; mật khẩu tạm chỉ hiện một lần; người dùng được nhắc đổi khi đăng nhập.
- Khóa / mở khóa (ưu tiên dùng thay cho xóa), nâng / hạ quyền, trao quyền "Quản lý quản trị viên" (chỉ superadmin), xóa (xóa mềm, khôi phục được). Mỗi người chỉ thấy nút mình được phép bấm.

## Tab Lịch sử

- Mọi thao tác ghi của quản trị viên được lưu vào `admin_logs`: ai, lúc nào, làm gì, bản trước / sau, các mục thay đổi. Không lưu mật khẩu.
- **Xem**: bảng so sánh trước / sau. **Khôi phục**: đưa đối tượng về bản trước thay đổi đó (dòng "tạo mới" thì xóa đối tượng); việc khôi phục cũng được ghi lại nên hoàn tác được. Khôi phục tài khoản vẫn theo đúng quyền.
- **Xóa** dòng lịch sử: chỉ superadmin.

## Lệnh trong backend (người có `backend/.env`)

```bash
npm run make-admin -- email@example.com           # cấp quyền quản trị viên
npm run make-admin -- email@example.com --super   # quản trị viên cấp cao (tối đa 2)
npm run backup                                    # sao lưu toàn bộ database -> backups/<ngày-giờ>/
npm run restore-backup -- <thư-mục> <collection> [--overwrite]   # khôi phục từ bản sao lưu (mặc định chạy thử)
npm run seed -- --dry-run                         # xem seed sẽ đổi gì (không dùng seed khi Atlas đã là dữ liệu gốc)
```

Gói Atlas miễn phí không tự sao lưu: nên `npm run backup` định kỳ và trước mỗi lần chạy lệnh ghi hàng loạt. Thư mục `backups/` chứa mật khẩu đã mã hóa, không commit, không gửi ra ngoài nhóm.
