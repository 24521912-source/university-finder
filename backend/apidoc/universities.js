// Tài liệu apidoc: trường đại học, ngành, yêu thích.
// Code thật: src/modules/universities/, src/modules/majors/, src/modules/favorites/

/**
 * @api {get} /universities Danh sách trường
 * @apiName ListUniversities
 * @apiGroup Universities
 * @apiVersion 1.0.0
 * @apiPermission public
 * @apiDescription Toàn bộ trường dạng **card** (dữ liệu cho thẻ trường ở frontend), trường có dữ liệu đầy đủ xếp trước.
 * @apiUse UniversityCard
 * @apiSuccessExample {json} 200:
 *   HTTP/1.1 200 OK
 *   [{ "slug": "cong-nghe-thong-tin-dhqg", "name": "Trường Đại học Công nghệ Thông tin, ĐHQG-HCM", "shortName": "UIT",
 *      "institutionType": "public", "belongsToUniversitySystem": true, "district": "TP. Thủ Đức",
 *      "tuitionFrom": { "amount": 20900000, "unit": "semester" }, "scoreFrom": 22.8, "majors": ["Khoa học dữ liệu"] }]
 */

/**
 * @api {get} /universities/search Tìm kiếm & lọc trường
 * @apiName SearchUniversities
 * @apiGroup Universities
 * @apiVersion 1.0.0
 * @apiPermission public
 * @apiDescription Mọi tham số đều không bắt buộc. Tìm theo tên không phân biệt dấu / hoa thường; trùng tên viết tắt xếp đầu.
 * Có từ nhánh `feature/universities` (WBS 5.4).
 * @apiQuery {String{..100}} [q] Tên hoặc tên viết tắt, vd. `uit`, `bach khoa`.
 * @apiQuery {String="public","private","international","other"} [type] Loại trường.
 * @apiQuery {String="1"} [vnu] Chỉ trường thuộc ĐHQG-HCM.
 * @apiQuery {String} [group] Nhóm ngành, vd. `Máy tính và công nghệ thông tin`.
 * @apiQuery {String} [major] Mã ngành, vd. `7480201`. Có `major` thì bỏ qua `group`.
 * @apiQuery {String} [district] Quận của trụ sở, vd. `TP. Thủ Đức`.
 * @apiQuery {Number} [maxTuition] Học phí tối đa (đồng/năm). Học phí học kỳ được ước tính × 2.
 * @apiExample {curl} Ví dụ:
 *   curl "http://localhost:5000/api/universities/search?major=7480201&maxTuition=50000000"
 * @apiSuccess {Number} total Số trường khớp.
 * @apiSuccess {Object[]} items Danh sách trường dạng card (xem `GET /universities`).
 * @apiUse Error400
 */

/**
 * @api {get} /universities/filter-options Dữ liệu cho bộ lọc
 * @apiName FilterOptions
 * @apiGroup Universities
 * @apiVersion 1.0.0
 * @apiPermission public
 * @apiDescription Khu vực và ngành mà ít nhất một trường đang có (WBS 5.4).
 * @apiSuccess {String[]} districts Danh sách quận.
 * @apiSuccess {Object[]} majorGroups Nhóm ngành `{ name, majors: [{ code, name }] }`.
 */

/**
 * @api {get} /universities/compare So sánh 2–3 trường
 * @apiName CompareUniversities
 * @apiGroup Universities
 * @apiVersion 1.0.0
 * @apiPermission public
 * @apiDescription Trả về mảng theo đúng thứ tự slug gửi lên. Field chưa có dữ liệu là `null` (WBS 5.6).
 * @apiQuery {String} slugs 2–3 slug cách nhau bằng dấu phẩy.
 * @apiExample {curl} Ví dụ:
 *   curl "http://localhost:5000/api/universities/compare?slugs=cong-nghe-thong-tin-dhqg,bach-khoa-tphcm"
 * @apiSuccess {Object[]} body Mỗi phần tử là một trường.
 * @apiSuccess {Object[]} body.tuition Khoảng học phí cho từng đơn vị `{ unit, min, max }`.
 * @apiSuccess {Number} body.annualTuitionFrom Học phí thấp nhất quy về năm.
 * @apiSuccess {Object} body.examScore Điểm chuẩn THPT năm gần nhất `{ year, scale, min, max }`.
 * @apiSuccess {Object} body.competencyScore Điểm chuẩn ĐGNL năm gần nhất.
 * @apiSuccess {Number} body.majorCount Số ngành.
 * @apiSuccess {String[]} body.majors Tên các ngành.
 * @apiUse Error400
 * @apiError (404) NotFound `{ "message": "Không tìm thấy trường: <slug>" }`.
 */

/**
 * @api {get} /universities/recommendation-data Dữ liệu cho AI tư vấn
 * @apiName RecommendationData
 * @apiGroup Universities
 * @apiVersion 1.0.0
 * @apiPermission public
 * @apiDescription Dữ liệu trang AI tư vấn dùng để chấm điểm: ngành, học phí, điểm chuẩn, quận, tên miền nguồn chính thức. Chỉ đọc.
 * @apiSuccess {Object[]} body Mảng trường gồm `slug, name, shortName, institutionType, belongsToUniversitySystem, dataLevel, sourceDomains, address.district, majors, tuition, admissions`.
 */

/**
 * @api {get} /universities/:slug Chi tiết trường
 * @apiName UniversityDetail
 * @apiGroup Universities
 * @apiVersion 1.0.0
 * @apiPermission public
 * @apiParam {String} slug Đường dẫn trường.
 * @apiSuccess {Object} body Hồ sơ công khai: thông tin cơ bản, liên hệ, cơ sở, ngành, học phí, điểm chuẩn, học bổng, ký túc xá...
 * @apiError (404) NotFound `{ "message": "Không tìm thấy trường đại học" }`.
 */

/**
 * @api {get} /majors Danh mục ngành
 * @apiName ListMajors
 * @apiGroup Majors
 * @apiVersion 1.0.0
 * @apiPermission public
 * @apiSuccess {Object[]} body Mảng ngành sắp theo mã, mỗi phần tử gồm code, name, fieldGroup.
 * @apiSuccessExample {json} 200:
 *   HTTP/1.1 200 OK
 *   [{ "code": "7480201", "name": "Công nghệ thông tin", "fieldGroup": "Máy tính và công nghệ thông tin" }]
 */

/**
 * @api {post} /favorites/:slug 🔒 Thêm trường yêu thích
 * @apiName AddFavorite
 * @apiGroup Favorites
 * @apiVersion 1.0.0
 * @apiPermission user
 * @apiDescription Đã có thì không thêm lần nữa. `favoriteCount` của trường chỉ tăng khi danh sách thực sự thay đổi.
 * @apiUse AuthHeader
 * @apiParam {String} slug Đường dẫn trường.
 * @apiSuccess {String[]} favorites ID các trường yêu thích sau khi thêm.
 * @apiUse Error400
 * @apiUse Error401
 * @apiUse Error404
 */

/**
 * @api {delete} /favorites/:slug 🔒 Bỏ trường yêu thích
 * @apiName RemoveFavorite
 * @apiGroup Favorites
 * @apiVersion 1.0.0
 * @apiPermission user
 * @apiUse AuthHeader
 * @apiParam {String} slug Đường dẫn trường.
 * @apiSuccess {String[]} favorites ID các trường yêu thích sau khi bỏ.
 * @apiUse Error401
 * @apiUse Error404
 */
