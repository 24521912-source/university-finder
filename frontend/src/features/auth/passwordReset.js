// Kiểm tra phía trình duyệt cho chức năng quên mật khẩu. Backend vẫn kiểm tra lại.
export const MIN_PASSWORD = 6

// Mã trong link email: 64 ký tự hex (backend tạo bằng 32 byte ngẫu nhiên).
export const isResetToken = (token) => typeof token === 'string' && /^[0-9a-f]{64}$/.test(token)

// Câu báo lỗi cho ô mật khẩu mới, hoặc '' nếu hợp lệ.
export function passwordProblem(password, confirm) {
  if (password.length < MIN_PASSWORD) return `Mật khẩu mới tối thiểu ${MIN_PASSWORD} ký tự`
  if (password !== confirm) return 'Mật khẩu nhập lại không khớp'
  return ''
}
