# MongoDB schema cho UniMatch HCMC

Database: `unimatch_hcmc` trên MongoDB Atlas. Định nghĩa chính thức (kiểu dữ liệu, ràng buộc) nằm trong
`backend/src/models/` — file này mô tả để đọc nhanh và đưa vào báo cáo. Sửa model thì cập nhật file này.

Thông tin hiển thị cùng nhau (ngành, học phí, điểm chuẩn, cơ sở vật chất...) được **nhúng** trong document
`universities` để trang chi tiết chỉ cần 1 truy vấn. Quy mô ~70 trường nên mảng nhúng không phình quá lớn.

## Collections

### `majors` — danh mục ngành dùng chung

```js
{ code: "7480201", name: "Công nghệ thông tin", fieldGroup: "Máy tính và Công nghệ thông tin" }
```

Mã ngành theo danh mục Bộ GD&ĐT, `code` duy nhất. Dùng cho dropdown chọn ngành, bộ lọc và AI tư vấn.
Mọi ngành trong `universities.majors` phải tham chiếu `code` có ở đây — không tự gõ tên ngành.

### `universities`

```js
{
  slug: "bach-khoa-tphcm",              // duy nhất, dùng cho URL /truong/:slug
  name: "Đại học Bách Khoa TP.HCM",
  shortName: "HCMUT",
  aliases: [],
  institutionType: "public",            // public | private | international | other
  belongsToUniversitySystem: true,
  universitySystem: "Đại học Quốc gia TP.HCM",
  foundedYear: 1957,
  description: "...",
  dataLevel: 3,                         // 1 cơ bản | 2 có ngành/học phí/điểm | 3 đầy đủ để demo AI
  tags: ["ky-tuc-xa", "hoc-bong"],      // ưu tiên cá nhân cho AI tư vấn
  sourceDomains: ["hcmut.edu.vn"],      // tên miền nguồn chính thức: ngành / học phí có link thuộc đây mới được coi là đã xác minh
  favoriteCount: 0,
  overview: { studentCount, facultyCount, campusCount },
  contact: { website, admissionsUrl, email, phone, admissionsEmail, admissionsPhone },
  address: {
    full, street, ward, district, city,
    location: { type: "Point", coordinates: [106.657, 10.772] }   // [longitude, latitude] cho Leaflet
  },
  campuses: [{ name, address, location }],
  media: { logoUrl, coverImageUrl, gallery: [] },
  majors: [{ code: "7480201", name: "Công nghệ thông tin", durationYears: 4, description }],
  tuition: [{
    academicYear: "2025-2026", program: "Đại trà", majorCode: null,   // null = áp dụng cả trường
    amountMin: 20000000, amountMax: 30000000, unit: "year",            // year | semester | credit | program
    note, sourceUrl
  }],
  admissions: [{
    year: 2025,
    method: "high_school_exam",         // high_school_exam | competency_assessment | transcript | direct | other
    majorCode: "7480201",
    program: "Chất lượng cao",          // null = chương trình chuẩn
    combinations: ["A00", "A01"],
    score: 27.5, scale: 30,             // scale: 30 (THPT, học bạ), 40 (nhân hệ số) hoặc 1200 (ĐGNL)
    quota, sourceUrl,
    verifiedForAI: false,               // true = đã kiểm tra đúng phương thức/năm/thang/chương trình chuẩn -> AI tư vấn dùng để so điểm
    aiNote                              // lưu ý hiện kèm khi AI dùng dòng này
  }],
  facilities: [{ name, description, imageUrl }],
  scholarships: [{ name, description, eligibility, value }],
  dormitory: { available: true, description },
  studentLife: [{ category, name, description }],
  careerOpportunities: [{ field, description }],
  detailEvidence: { ... },              // (chỉ Bách khoa) danh sách bản ghi đã duyệt theo _id, nhóm mã xét tuyển, link nguồn cho trang chi tiết
  createdAt, updatedAt                  // Mongoose tự tạo
}
```

### `users`

```js
{
  fullName: "Nguyễn Văn A",
  email: "a@example.com",               // duy nhất, lowercase
  passwordHash: "...",                  // bcrypt, không bao giờ lưu mật khẩu rõ
  role: "user",                         // user | admin | superadmin (quản trị cấp cao, tối đa 2)
  canManageAdmins: false,               // admin được superadmin trao quyền nâng/hạ/khóa/xóa admin thường
  status: "active",                     // active | locked (khóa: không đăng nhập / gọi API được)
  deletedAt: null,                      // xóa mềm: có giá trị = đã xóa, khôi phục được
  mustChangePassword: false,            // true khi admin tạo hộ với mật khẩu tạm
  createdBy: ObjectId("..."),           // admin tạo hộ (null nếu tự đăng ký)
  favorites: [ObjectId("...")],         // ref universities; tối đa ~70 nên nhúng thẳng
  createdAt, updatedAt
}
```

### `admin_logs` — lịch sử thay đổi của quản trị viên

```js
{
  actor: { _id, email, fullName, role },  // người thực hiện
  action: "update",                       // create | update | delete | status | role | permissions | restore
  entity: "university",                   // university | user
  entityId: ObjectId("..."),
  entityLabel: "Trường Đại học ...",      // tên trường / email
  before: { ... },                        // bản trước khi đổi (null = tạo mới). Không bao giờ chứa passwordHash
  after: { ... },                         // bản sau khi đổi (null = đã xóa hẳn)
  changedFields: ["name", "tuition"],
  restoredFrom: ObjectId("..."),          // với action restore: dòng lịch sử được khôi phục
  createdAt
}
```

Trang /admin, tab Lịch sử đọc collection này; nút Khôi phục đưa đối tượng về `before`.

### `consultations` — lịch sử AI tư vấn

```js
{
  user: ObjectId("..."),                // ref users
  criteria: { majorCode, method, combination, score, maxTuition, district, institutionType, tags: [] },
  results: [{ university: ObjectId("..."), matchScore: 87, reasons: ["Điểm của bạn cao hơn điểm chuẩn 1.5"] }],
  createdAt, updatedAt
}
```

## Indexes

Mongoose tự tạo khi backend khởi động:

- `majors.code` unique, `universities.slug` unique, `users.email` unique
- `consultations`: `{ user: 1, createdAt: -1 }`
- `admin_logs`: `{ createdAt: -1 }`, `{ entity: 1, entityId: 1, createdAt: -1 }`
- `universities`: `{ "majors.code": 1 }`, `{ institutionType: 1, "address.district": 1 }`, text index trên `name`, `shortName`, `aliases`

## Quy ước dữ liệu

- Không tự suy đoán giá trị không có trên nguồn: dùng `null`/mảng rỗng hoặc bỏ field.
- Tiền lưu số nguyên VND, không lưu chuỗi "20 triệu/năm".
- Điểm chuẩn gắn với năm + phương thức + ngành + thang điểm để không nhập nhằng.
- Ghi `sourceUrl` cho học phí và điểm chuẩn để kiểm chứng.

**Atlas là dữ liệu gốc**: sửa qua trang /admin (có lịch sử + khôi phục). `database/seeds/*.json` chỉ để nạp lần đầu (`npm run seed`); sao lưu toàn bộ bằng `npm run backup` (xem `database/README.md`).
