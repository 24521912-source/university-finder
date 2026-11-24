// Tài liệu apidoc: các API quản trị. Code thật: src/modules/admin/, accounts/, history/

// ================= Dữ liệu trường =================

/**
 * @api {get} /admin/universities 🛡️ Danh sách trường (quản trị)
 * @apiName AdminListUniversities
 * @apiGroup AdminUniversities
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiUse AdminHeader
 * @apiQuery {String} [q] Tìm theo tên / tên viết tắt / slug.
 * @apiQuery {Number} [page=1] Trang (20 trường / trang).
 * @apiSuccess {Object[]} items Danh sách trường.
 * @apiSuccess {Number} page Trang hiện tại.
 * @apiSuccess {Number} pageSize Số dòng mỗi trang.
 * @apiSuccess {Number} total Tổng số trường khớp.
 * @apiUse Error401
 * @apiUse Error403
 */

/**
 * @api {get} /admin/universities/:slug 🛡️ Toàn bộ dữ liệu một trường
 * @apiName AdminGetUniversity
 * @apiGroup AdminUniversities
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiUse AdminHeader
 * @apiParam {String} slug Đường dẫn trường.
 * @apiUse Error404
 */

/**
 * @api {post} /admin/universities 🛡️ Thêm trường
 * @apiName AdminCreateUniversity
 * @apiGroup AdminUniversities
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiDescription Chỉ ghi các field cho phép (`EDITABLE` trong admin.service.js). Thao tác được ghi vào lịch sử thay đổi.
 * @apiUse AdminHeader
 * @apiBody {String} slug Đường dẫn (chữ thường, số, gạch nối; không trùng).
 * @apiBody {String} name Tên trường.
 * @apiBody {String="public","private","international","other"} institutionType Loại trường.
 * @apiBody {Object[]} [majors] Ngành `{ code, name }` — mã phải có trong danh mục ngành.
 * @apiBody {Object[]} [tuition] Học phí `{ academicYear, program, majorCode, amountMin, amountMax, unit, sourceUrl }`.
 * @apiBody {Object[]} [admissions] Điểm chuẩn `{ year, method, majorCode, combinations, score, scale, sourceUrl, verifiedForAI }`.
 * @apiSuccess (201) {Object} body Document trường vừa tạo.
 * @apiUse Error400
 * @apiUse Error409
 */

/**
 * @api {put} /admin/universities/:slug 🛡️ Sửa trường
 * @apiName AdminUpdateUniversity
 * @apiGroup AdminUniversities
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiDescription Field gửi lên được ghi đè, field không gửi giữ nguyên. Ghi lịch sử `before` / `after`.
 * @apiUse AdminHeader
 * @apiParam {String} slug Đường dẫn trường.
 * @apiUse Error400
 * @apiUse Error404
 */

/**
 * @api {delete} /admin/universities/:slug 🛡️ Xóa trường
 * @apiName AdminDeleteUniversity
 * @apiGroup AdminUniversities
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiDescription Khôi phục được từ lịch sử thay đổi.
 * @apiUse AdminHeader
 * @apiParam {String} slug Đường dẫn trường.
 * @apiSuccessExample {json} 200:
 *   HTTP/1.1 200 OK
 *   { "slug": "demo-school" }
 * @apiUse Error404
 */

/**
 * @api {get} /admin/majors 🛡️ Danh mục ngành (gợi ý mã)
 * @apiName AdminMajors
 * @apiGroup AdminUniversities
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiUse AdminHeader
 * @apiSuccess {Object[]} body Mảng ngành, mỗi phần tử gồm mã ngành (code) và tên ngành (name).
 */

// ================= Tài khoản =================

/**
 * @api {get} /admin/users 🛡️ Danh sách tài khoản
 * @apiName AdminListUsers
 * @apiGroup AdminUsers
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiDescription Không gồm tài khoản đã xóa; không bao giờ trả `passwordHash`.
 * @apiUse AdminHeader
 * @apiQuery {String} [q] Tìm theo họ tên / email.
 * @apiQuery {String="user","admin","superadmin"} [role] Lọc vai trò.
 * @apiQuery {String="active","locked"} [status] Lọc trạng thái.
 * @apiQuery {Number} [page=1] Trang (20 tài khoản / trang).
 * @apiSuccess {Object[]} items `{ _id, fullName, email, role, canManageAdmins, status, deleted, mustChangePassword, createdAt }`.
 * @apiSuccess {Number} total Tổng số tài khoản khớp.
 */

/**
 * @api {post} /admin/users 🛡️ Tạo hộ tài khoản
 * @apiName AdminCreateUser
 * @apiGroup AdminUsers
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiDescription Tài khoản mới luôn là `user`, `mustChangePassword: true` (người dùng được nhắc đổi mật khẩu).
 * @apiUse AdminHeader
 * @apiBody {String} fullName Họ tên.
 * @apiBody {String} email Email.
 * @apiBody {String} password Mật khẩu tạm.
 * @apiUse Error400
 * @apiUse Error409
 */

/**
 * @api {patch} /admin/users/:id/status 🛡️ Khóa / mở khóa
 * @apiName AdminSetUserStatus
 * @apiGroup AdminUsers
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiDescription Có hiệu lực ngay ở request kế tiếp của người bị khóa. Quyền theo `denyReason()` trong utils/roles.js.
 * @apiUse AdminHeader
 * @apiParam {String} id ID tài khoản.
 * @apiBody {String="active","locked"} status Trạng thái mới.
 * @apiUse Error400
 * @apiUse Error403
 * @apiUse Error404
 * @apiUse Error409
 */

/**
 * @api {patch} /admin/users/:id/role 🛡️ Nâng / hạ quyền
 * @apiName AdminSetUserRole
 * @apiGroup AdminUsers
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiDescription Hạ về `user` thì thu luôn `canManageAdmins`. Không ai đổi được chính mình hoặc `superadmin` qua web.
 * @apiUse AdminHeader
 * @apiParam {String} id ID tài khoản.
 * @apiBody {String="user","admin"} role Vai trò mới.
 * @apiUse Error403
 */

/**
 * @api {patch} /admin/users/:id/permissions 🛡️ Trao / thu quyền quản lý admin
 * @apiName AdminSetUserPermissions
 * @apiGroup AdminUsers
 * @apiVersion 1.0.0
 * @apiPermission superadmin
 * @apiDescription Chỉ `superadmin`.
 * @apiUse AdminHeader
 * @apiParam {String} id ID tài khoản.
 * @apiBody {Boolean} canManageAdmins Có / không.
 * @apiUse Error403
 */

/**
 * @api {delete} /admin/users/:id 🛡️ Xóa tài khoản
 * @apiName AdminDeleteUser
 * @apiGroup AdminUsers
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiDescription Xóa mềm (`deletedAt`), khôi phục được từ lịch sử thay đổi.
 * @apiUse AdminHeader
 * @apiParam {String} id ID tài khoản.
 * @apiUse Error403
 * @apiUse Error404
 */

// ================= Lịch sử thay đổi =================

/**
 * @api {get} /admin/history 🛡️ Lịch sử thay đổi
 * @apiName AdminListHistory
 * @apiGroup AdminHistory
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiDescription Mọi thao tác ghi của quản trị viên. Danh sách không kèm `before` / `after`.
 * @apiUse AdminHeader
 * @apiQuery {String} [entity] Loại đối tượng (trường / tài khoản).
 * @apiQuery {String} [action] Loại thao tác.
 * @apiQuery {String} [q] Từ khóa.
 * @apiQuery {Number} [page=1] Trang (30 dòng / trang).
 * @apiSuccess {Object[]} items Các dòng lịch sử.
 * @apiSuccess {Number} total Tổng số dòng.
 */

/**
 * @api {get} /admin/history/:id 🛡️ Chi tiết một dòng lịch sử
 * @apiName AdminGetHistory
 * @apiGroup AdminHistory
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiUse AdminHeader
 * @apiParam {String} id ID dòng lịch sử.
 * @apiSuccess {Object} before Dữ liệu trước khi đổi.
 * @apiSuccess {Object} after Dữ liệu sau khi đổi.
 * @apiSuccess {String[]} changedFields Các field đã đổi.
 * @apiUse Error404
 */

/**
 * @api {post} /admin/history/:id/restore 🛡️ Khôi phục
 * @apiName AdminRestoreHistory
 * @apiGroup AdminHistory
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiDescription Đưa đối tượng về `before` của dòng đó (dòng "tạo mới" thì xóa đối tượng đã tạo). Việc khôi phục cũng được ghi lịch sử.
 * @apiUse AdminHeader
 * @apiParam {String} id ID dòng lịch sử.
 * @apiSuccessExample {json} 200:
 *   HTTP/1.1 200 OK
 *   { "restored": true, "logId": "6731..." }
 * @apiUse Error403
 * @apiUse Error404
 * @apiUse Error409
 */

/**
 * @api {delete} /admin/history/:id 🛡️ Xóa dòng lịch sử
 * @apiName AdminDeleteHistory
 * @apiGroup AdminHistory
 * @apiVersion 1.0.0
 * @apiPermission superadmin
 * @apiDescription Chỉ `superadmin` (tránh xóa dấu vết).
 * @apiUse AdminHeader
 * @apiParam {String} id ID dòng lịch sử.
 * @apiSuccessExample {json} 200:
 *   HTTP/1.1 200 OK
 *   { "deleted": true }
 * @apiUse Error403
 */
