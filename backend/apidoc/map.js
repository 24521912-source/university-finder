// Tài liệu apidoc: bản đồ trường (WBS 5.7).
// Code thật: src/modules/map/

/** @apiDefine Map Bản đồ */

/**
 * @api {get} /map/universities Dữ liệu bản đồ trường
 * @apiName MapUniversities
 * @apiGroup Map
 * @apiVersion 1.0.0
 * @apiPermission public
 * @apiDescription Trường có tọa độ trụ sở hợp lệ nằm trong `items` (kèm cơ sở phụ có tọa độ); trường chưa có tọa độ nằm trong `missing`.
 * Database lưu GeoJSON `[kinh độ, vĩ độ]`, API trả `lat` / `lng`.
 * @apiExample {curl} Ví dụ:
 *   curl "http://localhost:5000/api/map/universities"
 * @apiSuccess {Object[]} items Trường hiện trên bản đồ, sắp theo tên.
 * @apiSuccess {String} items.slug Đường dẫn trường.
 * @apiSuccess {String} items.name Tên trường.
 * @apiSuccess {String} items.shortName Tên viết tắt (có thể `null`).
 * @apiSuccess {String} items.district Quận (có thể `null`).
 * @apiSuccess {Number} items.lat Vĩ độ trụ sở.
 * @apiSuccess {Number} items.lng Kinh độ trụ sở.
 * @apiSuccess {String="public","private","international","other"} items.institutionType Loại trường.
 * @apiSuccess {Boolean} items.belongsToUniversitySystem Thuộc ĐHQG-HCM.
 * @apiSuccess {String} items.address Địa chỉ đầy đủ (có thể `null`).
 * @apiSuccess {String} items.logoUrl Logo (có thể `null`).
 * @apiSuccess {Object[]} items.campuses Cơ sở phụ có tọa độ `{ name, address, lat, lng }`.
 * @apiSuccess {Object[]} missing Trường chưa có tọa độ `{ slug, name, shortName, district }`.
 * @apiSuccessExample {json} 200:
 *   HTTP/1.1 200 OK
 *   { "items": [{ "slug": "bach-khoa-tphcm", "name": "Trường Đại học Bách khoa, ĐHQG-HCM", "lat": 10.7733495, "lng": 106.6596319,
 *                 "institutionType": "public", "campuses": [] }],
 *     "missing": [{ "slug": "kinh-te-tphcm", "name": "Trường Đại học Kinh tế TP.HCM", "district": "Quận 3" }] }
 */
