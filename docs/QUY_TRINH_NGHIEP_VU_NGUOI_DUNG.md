# Quy trình nghiệp vụ người dùng (WBS 2.1)

- **Phụ trách:** Tú · **Ưu tiên:** P0
- **Đi kèm:** `Quy trình nghiệp vụ Admin.docx` (WBS 2.2, Hương), `docs/LUONG_AI_TU_VAN.md` (WBS 2.4).

## 1. Đối tượng người dùng

| Đối tượng | Mô tả | Cách xác định |
|---|---|---|
| **Khách** | Học sinh, phụ huynh truy cập web, chưa đăng nhập | Không có token |
| **Người dùng** | Đã đăng ký tài khoản và đăng nhập | `role = user` |

Khách dùng được mọi chức năng **tra cứu**. Các chức năng **cá nhân hóa** (yêu thích, checklist hồ sơ, trang cá nhân) cần đăng nhập.

## 2. Danh sách chức năng

| # | Chức năng | Khách | Người dùng | Trang |
|---|---|:---:|:---:|---|
| 1 | Xem trang chủ | ✔ | ✔ | `/` |
| 2 | Tìm kiếm và lọc trường (tên, ngành, học phí, khu vực, loại trường, ĐHQG) | ✔ | ✔ | `/truong` |
| 3 | Xem chi tiết trường (tổng quan, ngành, điểm chuẩn, học phí, tuyển sinh, cơ sở, liên hệ) | ✔ | ✔ | `/truong/:slug` |
| 4 | So sánh 2–3 trường | ✔ | ✔ | `/so-sanh` |
| 5 | AI tư vấn chọn trường | ✔ | ✔ | `/ai-tu-van` |
| 6 | Đăng ký tài khoản | ✔ | — | `/dang-ky` |
| 7 | Đăng nhập / đăng xuất | ✔ | ✔ | `/dang-nhap` |
| 8 | Lưu / bỏ trường yêu thích | → yêu cầu đăng nhập | ✔ | thẻ trường, trang chi tiết |
| 9 | Checklist hồ sơ tuyển sinh | → yêu cầu đăng nhập | ✔ | `/truong/:slug/tuyen-sinh` |
| 10 | Quản lý tài khoản: sửa họ tên, đổi mật khẩu, xem trường yêu thích | → yêu cầu đăng nhập | ✔ | `/ca-nhan` |

> Người dùng tự đăng ký, tài khoản mới luôn có vai trò `user`. Vai trò quản trị chỉ do quản trị viên cấp.

---

## 3. Mô tả từng quy trình

### 3.1. Tìm kiếm và lọc trường

**Mục tiêu:** thu hẹp danh sách 66 trường còn những trường phù hợp nhu cầu.

1. Người dùng mở **Trường** trên thanh điều hướng.
2. Hệ thống tải danh sách trường (`GET /api/universities/search`) và các lựa chọn bộ lọc (`GET /api/universities/filter-options`).
3. Người dùng nhập / chọn một hoặc nhiều điều kiện:
   - Ô tìm kiếm: tên hoặc tên viết tắt, có dấu hay không dấu đều được (vd. `uit`, `bach khoa`).
   - Nhóm ngành → Ngành cụ thể.
   - Học phí tối đa theo năm.
   - Khu vực (quận của trụ sở).
   - Loại trường: công lập / tư thục / quốc tế; chỉ trường thuộc ĐHQG-HCM.
4. Hệ thống gọi lại API và hiện số trường tìm thấy, 12 trường mỗi trang. Bộ lọc được lưu trên URL nên có thể chia sẻ link hoặc quay lại.
5. Không có kết quả → hệ thống báo "Không tìm thấy trường phù hợp" và có nút **Xóa bộ lọc**.

**Quy tắc:** học phí theo học kỳ được ước tính × 2 khi lọc theo năm. Trường chỉ có học phí theo tín chỉ / trọn khóa hoặc chưa có dữ liệu học phí sẽ bị ẩn khi bật lọc học phí (giao diện có ghi chú).

### 3.2. Xem chi tiết trường

1. Từ thẻ trường, người dùng bấm **Xem chi tiết**.
2. Hệ thống tải hồ sơ công khai (`GET /api/universities/:slug`) và hiện các mục: tổng quan, ngành đào tạo, điểm chuẩn, tuyển sinh, học phí, cơ sở – vị trí, liên hệ.
3. Slug sai hoặc trường không tồn tại → trang báo "Không tìm thấy trường đại học".

### 3.3. So sánh trường

**Cách 1: từ danh sách trường**

1. Trên thẻ trường, bấm **+ So sánh** (tối đa 3 trường; đủ 3 thì các nút còn lại bị khóa).
2. Thanh so sánh hiện ở cuối màn hình với các trường đã chọn. Bấm **×** để bỏ một trường, **Xóa hết** để bỏ tất cả.
3. Chọn đủ 2 trường trở lên → bấm **So sánh ngay**. Hệ thống mở `/so-sanh?truong=a,b,c` và gọi `GET /api/universities/compare`.
4. Bảng so sánh hiện: loại trường, ĐHQG, khu vực, năm thành lập, học phí theo từng đơn vị, học phí thấp nhất / năm (đánh dấu trường rẻ nhất), điểm chuẩn THPT và ĐGNL năm gần nhất, số ngành, danh sách ngành, ký túc xá, học bổng, lượt yêu thích, website. Ô thiếu dữ liệu ghi "Chưa có dữ liệu".
5. Bấm **Bỏ** ở đầu cột để bỏ một trường. Còn dưới 2 trường thì quay về danh sách.

Danh sách đã chọn được giữ trong phiên làm việc (sessionStorage) khi chuyển trang, đóng tab thì mất.

**Cách 2: từ kết quả AI tư vấn:** xem mục 3.4, bước 6.

### 3.4. AI tư vấn chọn trường

1. Người dùng mở **AI tư vấn**. Hệ thống tải dữ liệu trường và danh mục ngành.
2. Người dùng điền form 6 bước: ngành muốn học, điểm dự kiến (THPT theo tổ hợp hoặc ĐGNL), học phí mong muốn, khu vực, loại trường, ĐHQG. Mỗi tiêu chí chọn mức ưu tiên 1–5.
3. Bấm **Tư vấn cho tôi**. Dữ liệu sai → báo lỗi ngay dưới ô nhập.
4. Hệ thống chấm điểm theo quy tắc (chi tiết: `docs/LUONG_AI_TU_VAN.md`) và hiện:
   - Top 5 trường phù hợp: điểm phù hợp, độ phủ dữ liệu, lý do từng tiêu chí kèm link nguồn.
   - Nhóm "Cần bổ sung dữ liệu" (khớp ngành nhưng thiếu dữ liệu để xếp hạng).
   - Nhóm trường xét tuyển tổng hợp (thang 100), có máy tính điểm chi tiết.
5. Người dùng bấm **Xem chi tiết trường** để tìm hiểu thêm.
6. Người dùng chọn 2–3 trường → **So sánh** các tiêu chí AI cạnh nhau.

### 3.5. Đăng ký

1. Người dùng bấm **Đăng ký**, nhập họ tên, email, mật khẩu (≥ 6 ký tự), nhập lại mật khẩu.
2. Mật khẩu nhập lại không khớp → báo lỗi, không gửi lên máy chủ.
3. Hệ thống gửi `POST /api/auth/register`:
   - Email đã đăng ký → báo lỗi (409).
   - Thành công → tài khoản vai trò `user`, tự đăng nhập và chuyển tới trang cá nhân.

### 3.6. Đăng nhập / đăng xuất

1. Người dùng bấm **Đăng nhập**, nhập email và mật khẩu, hệ thống gửi `POST /api/auth/login`.
2. Sai thông tin hoặc tài khoản đã xóa → "Email hoặc mật khẩu không đúng". Tài khoản bị khóa → "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên".
3. Thành công → lưu token (hạn 7 ngày), quay lại đúng trang người dùng đang xem trước khi bị yêu cầu đăng nhập (vd. đang bấm yêu thích ở trang chi tiết).
4. Tài khoản do quản trị viên tạo hộ (mật khẩu tạm) → hiện banner nhắc **Đổi mật khẩu ngay**.
5. Bấm **Đăng xuất** → xóa token, về trang chủ.

### 3.7. Lưu trường yêu thích

1. Người dùng bấm biểu tượng ♥ trên thẻ trường hoặc trang chi tiết.
2. Chưa đăng nhập → chuyển sang trang đăng nhập, đăng nhập xong quay lại đúng trang.
3. Đã đăng nhập → `POST /api/favorites/:slug` (lưu) hoặc `DELETE /api/favorites/:slug` (bỏ). Số lượt yêu thích cập nhật ngay.
4. Danh sách trường yêu thích xem ở trang **Cá nhân**.

### 3.8. Quản lý tài khoản (trang Cá nhân)

1. Người dùng mở **Cá nhân** (chưa đăng nhập → chuyển sang đăng nhập).
2. **Sửa họ tên:** nhập tên mới (≤ 100 ký tự) → `PUT /api/auth/me`.
3. **Đổi mật khẩu:** nhập mật khẩu hiện tại + mật khẩu mới (≥ 6 ký tự, khác mật khẩu cũ) → `PUT /api/auth/password`.
4. Xem và bỏ các trường đã lưu yêu thích.

### 3.9. Checklist hồ sơ tuyển sinh

1. Ở mục **Tuyển sinh** của trang chi tiết, người dùng đã đăng nhập đánh dấu các giấy tờ đã chuẩn bị.
2. Checklist lưu trong trình duyệt theo tài khoản + trường + năm (chưa lưu lên máy chủ). Nội dung tuyển sinh hiện là **dữ liệu minh họa** (có nhãn trên giao diện).

---

## 4. Ràng buộc chung

- Mọi dữ liệu trường đọc từ MongoDB Atlas. Quản trị viên sửa ở `/admin` thì người dùng thấy ngay.
- Học phí, điểm chuẩn chỉ để tham khảo; luôn có ghi chú đối chiếu thông báo tuyển sinh chính thức.
- Giao diện dùng được bằng bàn phím, đọc tốt ở màn hình 375px trở lên.

## 5. Chức năng chưa làm (theo WBS)

| WBS | Chức năng | Ghi chú |
|---|---|---|
| 4.9, 5.7, 8.3 | Bản đồ trường (Leaflet) | Model đã có `address.location`, một số trường đã có tọa độ; chưa có API / giao diện |
| 5.10, 6.7 | Lưu và xem lịch sử tư vấn | Model `Consultation` đã có, chưa có API / giao diện |
