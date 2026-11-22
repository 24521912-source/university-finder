# API Contract

Ghi API vào file này **trước khi code** để người làm frontend và người làm chức năng khác dùng chung.

## Quy ước chung

- Base URL: `http://localhost:5000/api` (frontend đổi được bằng biến `VITE_API_URL`).
- Gửi/nhận JSON.
- API cần đăng nhập: gửi header `Authorization: Bearer <token>`. Frontend dùng `services/api.js` thì token được gắn tự động.
- Lỗi luôn có dạng `{ "message": "Câu báo lỗi tiếng Việt" }` kèm mã HTTP:

| Mã | Ý nghĩa |
|---|---|
| 400 | Dữ liệu gửi lên sai |
| 401 | Chưa đăng nhập / token sai hoặc hết hạn / tài khoản đã bị khóa hoặc xóa |
| 403 | Không đủ quyền (vd. không phải quản trị viên, hoặc thao tác vượt quyền — xem mục Quản lý tài khoản) |
| 404 | Không tìm thấy |
| 409 | Trùng dữ liệu (vd. email đã đăng ký) |
| 500 | Lỗi máy chủ |

## Health Check

`GET /health` → `{ "message": "Backend is running", "status": "OK" }`

## Auth

### `POST /auth/register`

Body: `{ "fullName": "Nguyễn Văn A", "email": "a@gmail.com", "password": "matkhau123" }` (mật khẩu ≥ 6 ký tự)

Response `201`:

```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": "6710...", "fullName": "Nguyễn Văn A", "email": "a@gmail.com", "role": "user", "favorites": [] }
}
```

Lỗi: `400` thiếu/sai dữ liệu, `409` email đã đăng ký.

### `POST /auth/login`

Body: `{ "email": "a@gmail.com", "password": "matkhau123" }` → Response `200` giống register. Lỗi: `401` sai email hoặc mật khẩu.

### `GET /auth/me` 🔒

Response: `{ "user": { ...giống trên } }`

Token có hạn 7 ngày. Tài khoản mới luôn là `user`; cấp quyền admin bằng `npm run make-admin -- email` trong `backend`.

### `PUT /auth/me` 🔒

Sửa họ tên của người đang đăng nhập. Body: `{ "fullName": "Nguyễn Văn A" }` (bắt buộc, tối đa 100 ký tự). Email, vai trò, yêu thích gửi kèm đều bị bỏ qua.

Response: `{ "user": { ...giống trên } }`. Lỗi `400` khi họ tên trống / quá dài.

### `PUT /auth/password` 🔒

Body: `{ "currentPassword": "...", "newPassword": "..." }`. Mật khẩu mới tối thiểu 6 ký tự và khác mật khẩu hiện tại.

Response: `{ "message": "Đã đổi mật khẩu" }`. Lỗi `400` khi thiếu dữ liệu, mật khẩu mới không hợp lệ hoặc **mật khẩu hiện tại không đúng** (dùng 400, không dùng 401, vì phiên đăng nhập vẫn hợp lệ). Token cũ vẫn dùng được đến khi hết hạn.

## Universities

### `GET /universities`

Danh sách 66 trường dạng **card** (dữ liệu cho component `UniversityCard`), trường có dữ liệu đầy đủ xếp trước.

```json
[
  {
    "_id": "6710...",
    "slug": "cong-nghe-thong-tin-dhqg",
    "name": "Trường Đại học Công nghệ Thông tin, ĐHQG-HCM",
    "shortName": "UIT",
    "institutionType": "public",
    "belongsToUniversitySystem": true,
    "district": "TP. Thủ Đức",
    "logoUrl": null,
    "favoriteCount": 0,
    "dataLevel": 3,
    "tuitionFrom": { "amount": 20900000, "unit": "semester" },
    "scoreFrom": 22.8,
    "majors": ["Truyền thông đa phương tiện", "Thương mại điện tử", "Khoa học dữ liệu"]
  }
]
```

- `tuitionFrom`: học phí thấp nhất; `unit` = `year` | `semester` | `credit` | `program`; `null` nếu chưa có dữ liệu.
- `scoreFrom`: điểm chuẩn thấp nhất **thang 30** năm gần nhất; `null` nếu trường không có điểm thang 30.
- Backend tạo dữ liệu card bằng hàm `toCard()` trong `backend/src/modules/universities/universities.service.js` — API khác cần trả danh sách trường (kết quả AI, yêu thích, so sánh) nên dùng lại hàm này.

### `GET /universities/search` (WBS 5.4)

Tìm kiếm và lọc trường. Mọi tham số đều không bắt buộc; bỏ trống = không lọc theo tham số đó. Dùng cho trang `/truong`.

| Tham số | Ví dụ | Ý nghĩa |
|---|---|---|
| `q` | `uit`, `bach khoa` | Tên / tên viết tắt, không phân biệt dấu và hoa thường (≤ 100 ký tự). Trùng tên viết tắt xếp đầu |
| `type` | `public` | `public` \| `private` \| `international` \| `other` |
| `vnu` | `1` | Chỉ trường thuộc ĐHQG-HCM |
| `group` | `Máy tính và công nghệ thông tin` | Nhóm ngành (`fieldGroup` của danh mục ngành) |
| `major` | `7480201` | Mã ngành. Có `major` thì bỏ qua `group` |
| `district` | `TP. Thủ Đức` | Quận của địa chỉ trụ sở |
| `maxTuition` | `40000000` | Học phí thấp nhất ≤ mức này (đồng/năm). Học phí học kỳ ước tính × 2; trường chỉ có học phí tín chỉ / trọn khóa hoặc chưa có học phí bị loại |

Response `200`: `{ "total": 11, "items": [ /* dữ liệu card, giống GET /universities */ ] }`. Sắp xếp giống `GET /universities`.

Lỗi `400` khi tham số sai kiểu / sai giá trị, vd. `{ "message": "Loại trường không hợp lệ" }`.

### `GET /universities/filter-options` (WBS 5.4)

Dữ liệu cho các ô chọn của bộ lọc. Chỉ gồm khu vực / ngành mà ít nhất một trường đang có.

```json
{
  "districts": ["Quận 10", "TP. Thủ Đức"],
  "majorGroups": [
    { "name": "Máy tính và công nghệ thông tin", "majors": [{ "code": "7480201", "name": "Công nghệ thông tin" }] }
  ]
}
```

### `GET /universities/compare?slugs=a,b,c` (WBS 5.6)

So sánh 2–3 trường (slug cách nhau bằng dấu phẩy, trùng thì bỏ). Trả về mảng theo **đúng thứ tự** slug gửi lên:

```json
[
  {
    "slug": "cong-nghe-thong-tin-dhqg", "name": "Trường Đại học Công nghệ Thông tin, ĐHQG-HCM", "shortName": "UIT",
    "logoUrl": null, "institutionType": "public", "belongsToUniversitySystem": true,
    "district": "TP. Thủ Đức", "foundedYear": 2006, "website": "https://www.uit.edu.vn",
    "studentCount": null, "favoriteCount": 0,
    "majorCount": 12, "majors": ["Khoa học máy tính", "..."],
    "tuition": [{ "unit": "year", "min": 84000000, "max": 140000000 }, { "unit": "semester", "min": 20900000, "max": 42500000 }],
    "annualTuitionFrom": 41800000,
    "examScore": { "year": 2026, "scale": 30, "min": 22.8, "max": 30 },
    "competencyScore": null,
    "dormitory": null,
    "scholarshipCount": 0
  }
]
```

- `tuition`: khoảng học phí cho **từng đơn vị** (không gộp đơn vị khác nhau); `[]` nếu chưa có.
- `annualTuitionFrom`: học phí thấp nhất quy về năm (học kỳ × 2), `null` nếu không quy đổi được.
- `examScore` / `competencyScore`: điểm chuẩn thấp nhất – cao nhất năm gần nhất của phương thức THPT (thang 30) / ĐGNL (thang 1200); `null` nếu chưa có.
- Field nào chưa có dữ liệu trả `null`.
- Lỗi: `400` khi ít hơn 2 / nhiều hơn 3 slug hoặc slug sai định dạng; `404` `{ "message": "Không tìm thấy trường: <slug>" }`.

### `GET /universities/:slug`

Trả hồ sơ công khai của một trường theo slug để hiển thị trang chi tiết: thông tin cơ bản, liên hệ, cơ sở, ngành, học phí, điểm chuẩn và các mục giới thiệu đã có dữ liệu. Không trả tài khoản người dùng hoặc trường nội bộ khác.

- `200`: một object trường có `slug`, `name` và các trường thông tin công khai; không bọc trong mảng.
- `404`: `{ "message": "Không tìm thấy trường đại học" }` nếu slug sai định dạng hoặc trường không tồn tại.
- API này chỉ đọc, không thay đổi dữ liệu trường.

Trang tuyển sinh hiện là bản demo frontend có nhãn dữ liệu minh họa. Checklist cá nhân chỉ dành cho người đã đăng nhập và lưu trong trình duyệt theo tài khoản, trường, năm; chưa có API ghi checklist hoặc dữ liệu tuyển sinh mẫu vào database.

### `GET /universities/recommendation-data`

Dữ liệu trang AI tư vấn dùng để chấm điểm, đọc trực tiếp MongoDB: mảng các trường với `slug`, `name`, `shortName`, `institutionType`, `belongsToUniversitySystem`, `dataLevel`, `address.district`, `majors`, `tuition`, `admissions`. Chỉ đọc.

## Admin 🛡️

Mọi API dưới đây cần header `Authorization: Bearer <token>` của quản trị viên (`role` là `admin` hoặc `superadmin` trong database). Thiếu/sai token → `401`; không phải admin → `403`. Dữ liệu ghi thẳng vào MongoDB và hiện ngay trên các trang công khai.

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/admin/universities?q=&page=` | Danh sách trường (20/trang), tìm theo tên / tên viết tắt / slug. Trả `{ items, page, pageSize, total }` |
| GET | `/admin/universities/:slug` | Toàn bộ document một trường |
| POST | `/admin/universities` | Thêm trường. `201` + document |
| PUT | `/admin/universities/:slug` | Sửa trường: field gửi lên được ghi đè, field không gửi giữ nguyên |
| DELETE | `/admin/universities/:slug` | Xóa trường. `{ slug }` |
| GET | `/admin/majors` | Danh mục ngành `[{ code, name }]` để gợi ý mã ngành |

- Chỉ ghi các field có trong `EDITABLE` (`backend/src/modules/admin/admin.service.js`); `_id`, `favoriteCount`, timestamps và field lạ bị bỏ qua.
- `400` khi: slug sai định dạng, mã ngành không có trong danh mục, học phí / điểm chuẩn trỏ tới mã ngành không thuộc trường, hoặc vi phạm schema. `409` khi slug trùng. `404` khi không có trường.

### `GET /admin/dashboard` 🛡️

Số liệu tab **Tổng quan** (WBS 7.2). Chỉ đọc, tính trực tiếp từ MongoDB mỗi lần gọi.

```json
{
  "universities": { "total": 66, "byType": { "public": 41, "private": 23, "international": 2, "other": 0 }, "byDataLevel": { "1": 30, "2": 24, "3": 12 }, "vnuhcm": 9 },
  "coverage": { "majors": 58, "admissions": 34, "verifiedForAI": 21, "tuition": 29, "coordinates": 15, "logo": 62 },
  "majorCount": 187,
  "users": { "total": 48, "byRole": { "user": 44, "admin": 3, "superadmin": 1 }, "locked": 2, "newLast30Days": 17 },
  "consultations": { "total": 93, "last7Days": 31, "trend": [{ "date": "2026-11-21", "count": 8 }] },
  "topFavorites": [{ "slug": "cong-nghe-thong-tin-dhqg", "name": "...", "shortName": "UIT", "favoriteCount": 14 }],
  "recentChanges": [{ "id": "...", "action": "update", "entity": "university", "entityLabel": "...", "actor": "Nguyễn Văn A", "createdAt": "..." }],
  "generatedAt": "2026-11-21T15:48:00.000Z"
}
```

- `coverage`: số trường đã có từng loại dữ liệu (ngành, điểm chuẩn, điểm đã xác minh cho AI, học phí, tọa độ, logo).
- `users` không tính tài khoản đã xóa mềm. `consultations.trend`: 14 ngày gần nhất theo giờ Việt Nam, ngày không có lượt nào vẫn có mặt với `count: 0`.
- `topFavorites`: tối đa 5 trường có `favoriteCount > 0`. `recentChanges`: 5 thay đổi mới nhất trong lịch sử admin.

## Quản lý tài khoản 🛡️

Gắn tại `/admin/users`, cần quản trị viên (`admin` hoặc `superadmin`). Quy tắc ai được làm gì với ai nằm ở `backend/src/utils/roles.js` (`denyReason`):

| Vai trò | Được làm |
|---|---|
| `superadmin` (quản trị cấp cao, tối đa 2, chỉ tạo bằng `npm run make-admin -- email --super`) | Nâng/hạ/khóa/xóa quản trị viên; trao/thu quyền `canManageAdmins` |
| `admin` có `canManageAdmins` | Nâng user lên admin; hạ/khóa/xóa admin **không** có quyền này |
| `admin` | Tạo hộ / khóa / xóa user thường |

Không ai thao tác lên chính mình hoặc lên `superadmin` qua web. Khóa / xóa có hiệu lực ngay ở request kế tiếp.

| Phương thức | Đường dẫn | Body | Mô tả |
|---|---|---|---|
| GET | `/admin/users?q=&role=&status=&page=` | | Danh sách (20/trang), không gồm tài khoản đã xóa. Không trả `passwordHash` |
| POST | `/admin/users` | `{ fullName, email, password }` | Tạo hộ: luôn `role: user`, `mustChangePassword: true` |
| PATCH | `/admin/users/:id/status` | `{ status: "active" \| "locked" }` | Khóa / mở khóa |
| PATCH | `/admin/users/:id/role` | `{ role: "user" \| "admin" }` | Nâng / hạ quyền (hạ thì thu luôn `canManageAdmins`) |
| PATCH | `/admin/users/:id/permissions` | `{ canManageAdmins: true \| false }` | Chỉ `superadmin` |
| DELETE | `/admin/users/:id` | | Xóa mềm (`deletedAt`), khôi phục được |

Lỗi: `400` dữ liệu sai, `403` không đủ quyền, `404` không có tài khoản, `409` email trùng hoặc tài khoản vừa bị người khác đổi.

Đăng nhập: tài khoản bị khóa trả `403`, đã xóa trả `401`. `GET /auth/me` có thêm `canManageAdmins`, `mustChangePassword`; đổi mật khẩu xong `mustChangePassword` về `false`.

## Lịch sử thay đổi 🛡️

Mọi thao tác ghi của quản trị viên (thêm / sửa / xóa trường; tạo hộ, khóa, đổi vai trò, đổi quyền, xóa tài khoản; khôi phục) được lưu vào collection `admin_logs`: người thực hiện, thời gian, `before`, `after`, `changedFields`. Không bao giờ lưu `passwordHash`.

| Phương thức | Đường dẫn | Ai | Mô tả |
|---|---|---|---|
| GET | `/admin/history?entity=&action=&q=&page=` | admin | Danh sách (30/trang), không kèm `before`/`after` |
| GET | `/admin/history/:id` | admin | Một dòng, đủ `before`/`after` |
| POST | `/admin/history/:id/restore` | admin | Đưa đối tượng về `before` của dòng đó (dòng "tạo mới" thì xóa đối tượng đã tạo). Bản thân việc khôi phục được ghi thành 1 dòng `restore` |
| DELETE | `/admin/history/:id` | **superadmin** | Xóa dòng lịch sử |

- Trường: khôi phục cả document, giữ nguyên `_id` của trường và từng dòng ngành / học phí / điểm chuẩn.
- Tài khoản: chỉ khôi phục `fullName`, `role`, `canManageAdmins`, `status`, `deletedAt` (không đụng email, mật khẩu) và vẫn theo đúng quyền ở `utils/roles.js`; không khôi phục thành `superadmin`.
- Lỗi: `403` không đủ quyền, `404` không có dòng / tài khoản, `409` đối tượng không còn hoặc đã giống hệt bản cần khôi phục.

## Favorites 🔒

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| POST | `/favorites/:slug` | Thêm trường vào yêu thích. Đã có thì không thêm lần nữa |
| DELETE | `/favorites/:slug` | Bỏ yêu thích. Chưa có thì không làm gì |

Response: `{ "favorites": ["<id trường>", ...] }` (danh sách sau khi đổi). `favoriteCount` của trường tăng/giảm 1 chỉ khi danh sách thực sự thay đổi, không bao giờ âm. Lỗi: `401` chưa đăng nhập, `400` slug sai định dạng, `404` không có trường.

## Majors

### `GET /majors`

Danh mục ngành từ MongoDB: `[{ code, name, fieldGroup }]`, sắp theo mã. Dùng cho ô gợi ý ngành ở trang AI tư vấn.

## Dữ liệu và seed

MongoDB Atlas là nguồn dữ liệu duy nhất: frontend không đọc file `database/seeds/*.json`. File seed chỉ dùng để nạp dữ liệu ban đầu.

- `npm run seed -- --dry-run`: chỉ in ra trường / ngành sẽ thêm hoặc sửa, không ghi.
- `npm run seed -- --overwrite`: ghi thật. Chỉ ghi field có nội dung khác database (giữ `_id` của các dòng không đổi). Không có `--overwrite` thì seed dừng nếu database đã có dữ liệu.
- ⚠️ Field nào khác giữa seed và database sẽ bị **thay bằng bản seed**, kể cả bản admin vừa sửa trên web. Luôn chạy `--dry-run` trước.
- Trường Bách khoa có `detailEvidence` (danh sách bản ghi đã duyệt theo `_id`, nhóm mã xét tuyển, link nguồn). Dòng điểm chuẩn / học phí mới chỉ hiện trên trang chi tiết Bách khoa khi được thêm vào đây (admin sửa được ở mục "Dữ liệu duyệt riêng").

<!-- Thêm API mới bên dưới theo cùng mẫu: phương thức + đường dẫn, body, response, lỗi. Đánh dấu 🔒 nếu cần đăng nhập, 🛡️ nếu chỉ quản trị viên. -->
