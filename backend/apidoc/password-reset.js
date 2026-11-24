// Tài liệu apidoc: quên mật khẩu qua email.
// Code thật: src/modules/auth/passwordReset.service.js, src/utils/mailer.js

/**
 * @api {post} /auth/forgot-password Quên mật khẩu — gửi link qua email
 * @apiName ForgotPassword
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiPermission public
 * @apiDescription Gửi link `{APP_URL}/dat-lai-mat-khau?token=...` (hết hạn sau 30 phút, dùng một lần).
 * Luôn trả cùng một câu dù email có tài khoản hay không. Gửi lại trong vòng 1 phút thì bỏ qua.
 * @apiBody {String} email Email đã đăng ký.
 * @apiSuccess {String} message Câu thông báo chung.
 * @apiError (400) BadRequest Email sai định dạng.
 * @apiError (502) BadGateway Máy chủ email lỗi, thử lại sau.
 * @apiError (503) ServiceUnavailable Server chưa cấu hình SMTP_USER / SMTP_PASS.
 */

/**
 * @api {post} /auth/reset-password Quên mật khẩu — đặt mật khẩu mới
 * @apiName ResetPassword
 * @apiGroup Auth
 * @apiVersion 1.0.0
 * @apiPermission public
 * @apiDescription Đặt mật khẩu mới bằng mã trong email rồi đăng nhập luôn. Các token đăng nhập cũ của tài khoản bị vô hiệu.
 * @apiBody {String} token Mã 64 ký tự hex lấy từ link trong email.
 * @apiBody {String} password Mật khẩu mới, tối thiểu 6 ký tự.
 * @apiSuccess {String} token JWT mới (hạn 7 ngày).
 * @apiSuccess {Object} user Thông tin tài khoản (giống /auth/login).
 * @apiError (400) BadRequest Mã sai, hết hạn, đã dùng hoặc mật khẩu quá ngắn.
 * @apiError (403) Forbidden Tài khoản bị khóa.
 */
