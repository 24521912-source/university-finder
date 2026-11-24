// Tài liệu apidoc: lịch sử AI tư vấn (WBS 5.10, 6.7).
// Code thật: src/modules/consultations/

/** @apiDefine Consultations Lịch sử tư vấn */

/**
 * @apiDefine ConsultationItem
 * @apiSuccess {String} id ID lần tư vấn.
 * @apiSuccess {String} createdAt Thời điểm lưu (ISO 8601).
 * @apiSuccess {Object} criteria Tiêu chí đã chọn (giống body khi lưu, đã chuẩn hóa).
 * @apiSuccess {Object[]} results Top trường, đúng thứ tự xếp hạng. Trường đã bị xóa khỏi hệ thống thì không có ở đây.
 * @apiSuccess {String} results.slug Đường dẫn trường.
 * @apiSuccess {String} results.name Tên trường.
 * @apiSuccess {String} results.shortName Tên viết tắt.
 * @apiSuccess {String} results.major Ngành đại diện được chấm.
 * @apiSuccess {Number} results.matchScore Điểm phù hợp 0–100.
 * @apiSuccess {Number} results.coverage Độ phủ dữ liệu 0–100.
 * @apiSuccess {String[]} results.reasons Lý do đề xuất.
 */

/**
 * @api {get} /consultations Lịch sử tư vấn của tôi
 * @apiName ListConsultations
 * @apiGroup Consultations
 * @apiVersion 1.0.0
 * @apiPermission user
 * @apiDescription Tối đa 30 lần gần nhất, mới nhất trước.
 * @apiUse AuthHeader
 * @apiUse ConsultationItem
 * @apiUse Error401
 */

/**
 * @api {post} /consultations Lưu kết quả tư vấn
 * @apiName CreateConsultation
 * @apiGroup Consultations
 * @apiVersion 1.0.0
 * @apiPermission user
 * @apiDescription Thuật toán chấm điểm chạy ở trình duyệt; backend kiểm tra kiểu dữ liệu, đổi slug thành ID trường rồi lưu.
 * Mỗi tài khoản giữ tối đa 30 lần, lưu thêm thì tự xóa lần cũ nhất.
 * @apiUse AuthHeader
 * @apiBody {Object} criteria Tiêu chí.
 * @apiBody {String} criteria.majorCode Mã ngành, vd. `7480201`.
 * @apiBody {String{..150}} [criteria.majorLabel] Tên ngành / nhóm ngành đã chọn.
 * @apiBody {String="high_school_exam","competency_assessment"} criteria.method Phương thức.
 * @apiBody {String} [criteria.combination] Tổ hợp, vd. `A00` (chỉ với điểm THPT).
 * @apiBody {Number} criteria.score Điểm: 0–30 (THPT) hoặc 0–1200 (ĐGNL).
 * @apiBody {Number} [criteria.maxTuition] Học phí tối đa đồng/năm; `null` = không quan trọng.
 * @apiBody {String} [criteria.district] Quận mong muốn; `any` = không quan trọng.
 * @apiBody {String="public","private","international","other","any"} [criteria.institutionType] Loại trường.
 * @apiBody {String="only","exclude","any"} [criteria.vnuhcm] Thuộc ĐHQG-HCM.
 * @apiBody {Object[]} results 1–10 trường.
 * @apiBody {String} results.slug Slug trường (phải có trong database).
 * @apiBody {String} [results.major] Ngành đại diện.
 * @apiBody {Number} results.matchScore Điểm phù hợp 0–100.
 * @apiBody {Number} [results.coverage] Độ phủ 0–100.
 * @apiBody {String[]} [results.reasons] Tối đa 6 lý do.
 * @apiSuccess (201) {Object} body Lần tư vấn vừa lưu (cùng dạng một phần tử của `GET /consultations`).
 * @apiUse Error400
 * @apiUse Error401
 */

/**
 * @api {delete} /consultations/:id Xóa một lần tư vấn
 * @apiName DeleteConsultation
 * @apiGroup Consultations
 * @apiVersion 1.0.0
 * @apiPermission user
 * @apiDescription Chỉ xóa được lần tư vấn của chính mình.
 * @apiUse AuthHeader
 * @apiParam {String} id ID lần tư vấn.
 * @apiSuccess {String} id ID đã xóa.
 * @apiUse Error400
 * @apiUse Error401
 * @apiUse Error404
 */
