// Khối dùng chung cho tài liệu apidoc (không phải code chạy). Dùng bằng @apiUse <tên>.

// ---------- Tên hiển thị của các nhóm API ----------
/** @apiDefine Health Kiểm tra hệ thống */
/** @apiDefine Auth Xác thực & tài khoản */
/** @apiDefine Universities Trường đại học */
/** @apiDefine Majors Danh mục ngành */
/** @apiDefine Favorites Trường yêu thích */
/** @apiDefine AdminUniversities Quản trị — Dữ liệu trường */
/** @apiDefine AdminUsers Quản trị — Tài khoản */
/** @apiDefine AdminHistory Quản trị — Lịch sử thay đổi */

// ---------- Quyền truy cập (@apiPermission) ----------
/**
 * @apiDefine public Mọi người
 * Không cần đăng nhập.
 */
/**
 * @apiDefine user Người dùng đã đăng nhập
 * Cần header `Authorization: Bearer <token>`. Tài khoản bị khóa nhận 403.
 */
/**
 * @apiDefine admin Quản trị viên
 * Vai trò `admin` hoặc `superadmin` (middleware `requireAdmin`).
 */
/**
 * @apiDefine superadmin Quản trị viên cấp cao
 * Chỉ vai trò `superadmin`.
 */

/**
 * @apiDefine AuthHeader
 * @apiHeader {String} Authorization `Bearer <token>` lấy từ đăng nhập / đăng ký.
 * @apiHeaderExample {json} Header:
 *   { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 */

/**
 * @apiDefine AdminHeader
 * @apiHeader {String} Authorization `Bearer <token>` của quản trị viên (`admin` hoặc `superadmin`).
 */

/**
 * @apiDefine PublicUser
 * @apiSuccess {String} user.id ID tài khoản.
 * @apiSuccess {String} user.fullName Họ tên.
 * @apiSuccess {String} user.email Email.
 * @apiSuccess {String="user","admin","superadmin"} user.role Vai trò.
 * @apiSuccess {Boolean} user.canManageAdmins Được quản lý quản trị viên khác.
 * @apiSuccess {Boolean} user.mustChangePassword Đang dùng mật khẩu tạm, cần đổi.
 * @apiSuccess {String[]} user.favorites ID các trường yêu thích.
 */

/**
 * @apiDefine UniversityCard
 * @apiSuccess {String} _id ID trường.
 * @apiSuccess {String} slug Đường dẫn, vd. `cong-nghe-thong-tin-dhqg`.
 * @apiSuccess {String} name Tên trường.
 * @apiSuccess {String} shortName Tên viết tắt.
 * @apiSuccess {String="public","private","international","other"} institutionType Loại trường.
 * @apiSuccess {Boolean} belongsToUniversitySystem Thuộc ĐHQG-HCM.
 * @apiSuccess {String} district Quận của trụ sở (có thể `null`).
 * @apiSuccess {String} logoUrl Logo (có thể `null`).
 * @apiSuccess {Number} favoriteCount Số lượt yêu thích.
 * @apiSuccess {Number=1,2,3} dataLevel Mức đầy đủ dữ liệu.
 * @apiSuccess {Object} tuitionFrom Học phí thấp nhất `{ amount, unit }` (có thể `null`).
 * @apiSuccess {Number} scoreFrom Điểm chuẩn thấp nhất thang 30 năm gần nhất (có thể `null`).
 * @apiSuccess {String[]} majors Tối đa 3 tên ngành tiêu biểu.
 */

/**
 * @apiDefine Error400
 * @apiError (400) BadRequest Dữ liệu gửi lên sai.
 * @apiErrorExample {json} 400:
 *   HTTP/1.1 400 Bad Request
 *   { "message": "Email không hợp lệ" }
 */

/**
 * @apiDefine Error401
 * @apiError (401) Unauthorized Chưa đăng nhập, token sai / hết hạn, hoặc tài khoản bị khóa / xóa.
 * @apiErrorExample {json} 401:
 *   HTTP/1.1 401 Unauthorized
 *   { "message": "Bạn cần đăng nhập" }
 */

/**
 * @apiDefine Error403
 * @apiError (403) Forbidden Không đủ quyền.
 * @apiErrorExample {json} 403:
 *   HTTP/1.1 403 Forbidden
 *   { "message": "Chỉ quản trị viên được thực hiện" }
 */

/**
 * @apiDefine Error404
 * @apiError (404) NotFound Không tìm thấy.
 */

/**
 * @apiDefine Error409
 * @apiError (409) Conflict Trùng dữ liệu hoặc dữ liệu vừa bị người khác thay đổi.
 */
