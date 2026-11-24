// Tài liệu apidoc: kiểm tra hệ thống + xác thực. Code thật: src/routes/index.js, src/modules/auth/

/**
 * @api {get} /health Kiểm tra backend
 * @apiName Health
 * @apiGroup Health
 * @apiVersion 1.0.0
 * @apiDescription Dùng cho giám sát (uptime check, PM2, load balancer).
 * @apiSuccessExample {json} 200:
 *   HTTP/1.1 200 OK
 *   { "message": "Backend is running", "status": "OK" }
 */

/**
 * @api {post} /auth/register Đăng ký
 * @apiName Register
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiDescription Tạo tài khoản mới, luôn có vai trò `user`, rồi trả token để đăng nhập ngay.
 * @apiBody {String} fullName Họ tên.
 * @apiBody {String} email Email (chưa được đăng ký).
 * @apiBody {String} password Mật khẩu, tối thiểu 6 ký tự.
 * @apiParamExample {json} Body:
 *   { "fullName": "Nguyễn Văn A", "email": "a@gmail.com", "password": "matkhau123" }
 * @apiSuccess (201) {String} token JWT, hạn 7 ngày.
 * @apiSuccess (201) {Object} user Thông tin tài khoản.
 * @apiUse PublicUser
 * @apiSuccessExample {json} 201:
 *   HTTP/1.1 201 Created
 *   { "token": "eyJhbGciOi...", "user": { "id": "6710...", "fullName": "Nguyễn Văn A", "email": "a@gmail.com", "role": "user", "favorites": [] } }
 * @apiUse Error400
 * @apiUse Error409
 */

/**
 * @api {post} /auth/login Đăng nhập
 * @apiName Login
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiBody {String} email Email.
 * @apiBody {String} password Mật khẩu.
 * @apiSuccess {String} token JWT, hạn 7 ngày.
 * @apiSuccess {Object} user Thông tin tài khoản.
 * @apiUse PublicUser
 * @apiError (401) WrongCredentials Sai email / mật khẩu, hoặc tài khoản đã xóa.
 * @apiError (403) Locked Tài khoản bị khóa.
 * @apiUse Error400
 */

/**
 * @api {get} /auth/me 🔒 Thông tin người đang đăng nhập
 * @apiName Me
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiUse AuthHeader
 * @apiSuccess {Object} user Thông tin tài khoản.
 * @apiUse PublicUser
 * @apiUse Error401
 */

/**
 * @api {put} /auth/me 🔒 Sửa họ tên
 * @apiName UpdateMe
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiDescription Chỉ sửa được họ tên; email, vai trò, yêu thích gửi kèm đều bị bỏ qua.
 * @apiUse AuthHeader
 * @apiBody {String{1..100}} fullName Họ tên mới.
 * @apiSuccess {Object} user Thông tin tài khoản sau khi sửa.
 * @apiUse Error400
 * @apiUse Error401
 */

/**
 * @api {put} /auth/password 🔒 Đổi mật khẩu
 * @apiName ChangePassword
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiUse AuthHeader
 * @apiBody {String} currentPassword Mật khẩu hiện tại.
 * @apiBody {String} newPassword Mật khẩu mới, tối thiểu 6 ký tự, khác mật khẩu hiện tại.
 * @apiSuccessExample {json} 200:
 *   HTTP/1.1 200 OK
 *   { "message": "Đã đổi mật khẩu" }
 * @apiError (400) WrongPassword Mật khẩu hiện tại không đúng (dùng 400 vì phiên đăng nhập vẫn hợp lệ).
 * @apiUse Error401
 */
