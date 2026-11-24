// Tài liệu apidoc: tổng quan trang quản trị (WBS 7.2).
// Code thật: src/modules/dashboard/

/** @apiDefine AdminDashboard Quản trị — Tổng quan */

/**
 * @api {get} /admin/dashboard Số liệu tổng quan
 * @apiName AdminDashboard
 * @apiGroup AdminDashboard
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiDescription Chỉ đọc, tính trực tiếp từ MongoDB mỗi lần gọi. Tài khoản đã xóa mềm không được tính.
 * @apiHeader {String} Authorization `Bearer <token>` của quản trị viên (`admin` hoặc `superadmin`).
 * @apiSuccess {Object} universities `{ total, byType: { public, private, international, other }, byDataLevel: { 1, 2, 3 }, vnuhcm }`.
 * @apiSuccess {Object} coverage Số trường đã có từng loại dữ liệu `{ majors, admissions, verifiedForAI, tuition, coordinates, logo }`.
 * @apiSuccess {Number} majorCount Số ngành trong danh mục.
 * @apiSuccess {Object} users `{ total, byRole: { user, admin, superadmin }, locked, newLast30Days }`.
 * @apiSuccess {Object} consultations `{ total, last7Days, trend: [{ date: "YYYY-MM-DD", count }] }` — 14 ngày gần nhất theo giờ Việt Nam.
 * @apiSuccess {Object[]} topFavorites Tối đa 5 trường được yêu thích nhiều nhất `{ slug, name, shortName, favoriteCount }`.
 * @apiSuccess {Object[]} recentChanges 5 thay đổi mới nhất `{ id, action, entity, entityLabel, actor, createdAt }`.
 * @apiSuccess {String} generatedAt Thời điểm tính (ISO 8601).
 * @apiError (401) Unauthorized Chưa đăng nhập hoặc token sai.
 * @apiError (403) Forbidden Không phải quản trị viên.
 */
