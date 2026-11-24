# User Profile

/profile và /ca-nhan cùng dùng ProtectedRoute và trang Profile. Giữ Header/Footer, Auth và toàn bộ các route khác đã có trên develop.

Trang đọc GET /auth/me, cập nhật AuthContext bằng setUser và đối chiếu mảng ID User.favorites với GET /universities. Số lượng phản ánh ID tài khoản, không âm thầm bỏ ID chưa có trong danh sách trường công khai. Card có logo/fallback, tên, loại hình, quận nếu có và liên kết /truong/:slug. Giao diện University Detail nằm trong PR riêng; liên kết đã trỏ đúng route có sẵn trên develop nhưng route đó còn placeholder cho đến khi merge PR Detail.

Sửa họ tên (`PUT /auth/me`) và đổi mật khẩu (`PUT /auth/password`, cần mật khẩu hiện tại) làm ngay trên trang bằng form; lưu xong cập nhật AuthContext và hiện thông báo. Yêu thích: nút ♥ trên thẻ trường (Trang chủ, Danh sách trường), nút trên trang chi tiết và nút "Bỏ yêu thích" trong tab này, cùng dùng hook `features/favorites/useFavorites.js` (`POST`/`DELETE /favorites/:slug`). Chưa đăng nhập bấm ♥ thì chuyển sang trang đăng nhập rồi quay lại. Tải lại đọc dữ liệu mới và đồng bộ số lượng/danh sách. Lỗi đọc giữ dữ liệu phiên kèm thông báo rõ; có retry, loading skeleton và empty state. Tab hỗ trợ bàn phím, focus-visible, responsive và reduced motion.

Tab **Lịch sử tư vấn** (`pages/Profile/ConsultationHistory.jsx`): chỉ tải `GET /consultations` khi mở tab lần đầu; mỗi lần hiện thời gian, tiêu chí đã chọn và top trường kèm điểm phù hợp, có nút xóa (`DELETE /consultations/:id`). Mở thẳng tab bằng `/ca-nhan?tab=lich-su-tu-van` (link "Xem lịch sử tư vấn" sau khi bấm Lưu ở trang AI).

Dependency mới duy nhất: lucide-react cho icon. Không đổi backend, model, dữ liệu, AI, Header, Footer hoặc Home.

## Kiểm thử cách ly

1. Cài dependency frontend và chạy Vite ở 127.0.0.1:5175 (`npm run dev -- --host 127.0.0.1 --port 5175 --strictPort`).
2. Chạy `node tests/profile.browser.cjs`. Có thể đặt PROFILE_TEST_URL nếu dùng cổng khác; CHROME_BIN chỉ đường dẫn Chrome/Chromium nếu không ở vị trí mặc định.
3. API account và trường được chặn bằng Chrome DevTools rồi trả fixture chỉ trong kiểm thử. Không tạo tài khoản, không truy cập MongoDB. Ảnh/report được lưu dưới thư mục tạm của hệ điều hành, không ghi vào source.

Kiểm tra guest/token sai, tài khoản user/admin, hai alias, favorites rỗng/có/mất tham chiếu, logo fallback, tìm link chi tiết, tab bàn phím, tải chậm, lỗi/retry và số lượng thay đổi. Responsive ở 320/375/768/1024/1440 px. Chạy thêm `npm run lint`, `npm run build` và các test Auth có sẵn.
