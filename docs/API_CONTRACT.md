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
| 401 | Chưa đăng nhập / token sai hoặc hết hạn |
| 403 | Không đủ quyền (không phải admin) |
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

Token có hạn 7 ngày. Tài khoản mới luôn là `user`; `npm run make-admin -- email` trong `backend` chỉ dry-run. Apply riêng yêu cầu xác nhận email và User ID theo [ADMIN.md](ADMIN.md).

## Admin — chỉ GET, bắt buộc requireAdmin

Tất cả `/api/admin/*` xác minh JWT rồi kiểm tra role hiện tại từ MongoDB: guest/token sai trả 401, tài khoản khác admin trả 403. Không có POST/PUT/PATCH/DELETE quản trị.

| GET | Nội dung |
|---|---|
| `/admin/overview` | Số document universities/majors/users và số bản ghi học phí/điểm nhúng |
| `/admin/universities` | Tên, slug, loại trường, địa chỉ, dataLevel |
| `/admin/majors` | code, name, fieldGroup trong danh mục ngành chung |
| `/admin/tuition` | Bản ghi học phí, trường, chương trình, năm, đơn vị, ghi chú và nguồn |
| `/admin/admissions` | Bản ghi điểm, phương thức, năm, thang điểm, tổ hợp và nguồn |
| `/admin/users` | Chỉ _id, fullName, email, role, createdAt; không passwordHash/token/favorites |
| `/admin/ai-data` | Bốn phần metadata nguồn cần thiết được trích từ cấu hình đã khảo sát, không gồm thuật toán/UI |

Danh sách nhận q (tối đa 100 ký tự, tìm literal), page (1..100000), limit (1..100, mặc định 20), trả `{items,total,page,limit,totalPages}`. Sai query trả 400. ai-data có academicYear và provenance, không coi URL là bằng chứng mọi bản ghi đã xác minh. Thống kê ngành là số document catalog, không tổng số ngành nhúng của các trường.

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

<!-- Thêm API mới bên dưới theo cùng mẫu: phương thức + đường dẫn, body, response, lỗi. Đánh dấu 🔒 nếu cần đăng nhập, 🛡️ nếu chỉ admin. -->
