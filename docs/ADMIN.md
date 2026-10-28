# Admin UniMatch HCMC — phiên bản chỉ đọc

Đăng ký luôn tạo user. Không có form, endpoint công khai hoặc tính năng Dashboard tự cấp admin. User/Admin dùng chung /login (alias /dang-nhap); /signup và /dang-ky chỉ đăng ký user.

Dashboard /admin có 7 mục. API /api/admin/* chỉ GET, luôn dùng requireAdmin và kiểm tra role MongoDB sau xác minh JWT. Danh sách phân trang, tìm kiếm literal, giới hạn tối đa 100 dòng/request. Người dùng trả về chỉ _id/fullName/email/role/createdAt. Không có chức năng sửa/xóa trường, dữ liệu AI hoặc tài khoản.

## Quy trình cấp quyền riêng

Chỉ người vận hành có quyền truy cập cấu hình kết nối backend mới chạy script. Không dùng giao diện đăng ký để đặt role.

1. Người dùng đăng ký tài khoản thông thường hoặc dùng tài khoản hiện có.
2. Chủ hệ thống phê duyệt chính xác tài khoản được cấp quyền.
3. Trong backend, chạy `npm run make-admin -- <email>`: mặc định dry-run, hiển thị ID/email/role trước/sau, không ghi.
4. Đối chiếu ID và email trong kết quả. Chỉ sau phê duyệt ghi riêng mới chạy `npm run make-admin -- <email> --apply --confirm-email <email> --expect-id <id-tu-dry-run>`.
5. Script bắt buộc đúng database unimatch_hcmc, đúng ID/email và role user; cập nhật một document với điều kiện role/updatedAt hiện tại, không upsert, không tự retry. Nếu bản ghi thay đổi đồng thời, dừng. Tài khoản không tồn tại sẽ không được tạo mới; tài khoản đã admin không bị cập nhật lại.
6. Đăng xuất/đăng nhập lại để frontend nhận vai trò. Backend vẫn kiểm tra role MongoDB cho mỗi request, không dùng claim role làm quyết định cuối cùng.

Không chạy lệnh apply để chỉ kiểm thử triển khai. Không truyền mật khẩu, token hoặc URI vào lệnh. Không chạy seed và không cần sửa .env hay schema.

## Dữ liệu AI

GET /api/admin/ai-data chỉ đọc backend/src/modules/admin/aiSources.js. File này trích đúng ACADEMIC_YEAR, SOURCES, ADMISSION_SOURCES và UNCERTAIN_MAJORS từ cấu hình AI đã khảo sát; SHA256 nguồn được ghi trong header để đối chiếu. Không đưa WEIGHTS, LABELS, PRIORITIES, ADMISSION_SLOPE, trang AI hoặc hàm recommend vào PR Admin. Vì metadata đi cùng backend, endpoint không phụ thuộc việc merge hoặc đóng gói frontend AI.

Cấu hình nguồn không đồng nghĩa mọi dữ liệu đã xác minh, cũng không khẳng định trang AI đã được triển khai trong bản build này. Giữ nguyên năm/phương thức/ngoại lệ nguồn, không mở policy HCMUT. Khi cập nhật cấu hình AI ở PR riêng cần đối chiếu snapshot metadata này để tránh lệch nguồn; không tự đồng bộ qua thao tác ghi database.

## Tách PR

Branch Admin xuất phát trực tiếp từ develop đã có Auth #5. Trang Profile và University Detail chưa nằm trong PR này: các liên kết giữ đúng route hiện có nhưng giao diện có thể còn placeholder cho đến khi merge PR tương ứng. Admin và Profile đều khai báo cùng lucide-react 1.62.0 để mỗi PR build độc lập; không branch từ PR Profile và không tự merge Profile.

## Kiểm thử không ghi Atlas

- Backend: `node --test tests/admin.test.cjs`.
- Frontend: `node --test src/features/auth/loginDestination.test.js`, `npm run lint`, `npm run build`.
- Browser: chạy Vite tại 127.0.0.1:5176 rồi `node tests/admin.browser.cjs` trong frontend. ADMIN_TEST_URL đổi URL kiểm thử; CHROME_BIN chỉ đường dẫn Chrome/Chromium nếu cần. Dữ liệu/account fixture chỉ được trả trong trình duyệt kiểm thử, không đưa vào ứng dụng hoặc gọi Atlas. Report/ảnh nằm trong thư mục tạm hệ điều hành. Kiểm tra đủ 7 mục, tìm kiếm/phân trang, lỗi/retry/empty/loading, logout, alias và responsive ở 320/375/768/1024/1440 px.
- Không tạo admin thật để chạy test. Mock ở unit test và Admin fixture trong RAM của máy chủ kiểm thử nằm ngoài ứng dụng; dữ liệu Dashboard được kiểm tra qua dịch vụ đọc Atlas thật. Không đưa máy chủ fixture vào production.
