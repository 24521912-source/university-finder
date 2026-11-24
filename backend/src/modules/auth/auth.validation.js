const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isText = (value) => typeof value === 'string' && value.trim() !== ''

// Trả về câu báo lỗi, hoặc null nếu hợp lệ. Kiểm tra kiểu string để chặn NoSQL injection ({ "$gt": "" }).
function validateRegister({ fullName, email, password, role } = {}) {
  if (role !== undefined && role !== 'user') return 'Đăng ký công khai chỉ cho phép vai trò user'
  if (!isText(fullName)) return 'Vui lòng nhập họ tên'
  if (typeof email !== 'string' || !EMAIL.test(email.trim())) return 'Email không hợp lệ'
  if (typeof password !== 'string' || password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự'
  return null
}

function validateLogin({ email, password } = {}) {
  if (!isText(email) || !isText(password)) return 'Vui lòng nhập email và mật khẩu'
  return null
}

const MAX_NAME = 100

// Chỉ cho sửa họ tên. Email và vai trò không đổi qua API này.
function validateProfile({ fullName } = {}) {
  if (!isText(fullName)) return 'Vui lòng nhập họ tên'
  if (fullName.trim().length > MAX_NAME) return `Họ tên tối đa ${MAX_NAME} ký tự`
  return null
}

function validatePasswordChange({ currentPassword, newPassword } = {}) {
  if (typeof currentPassword !== 'string' || !currentPassword) return 'Vui lòng nhập mật khẩu hiện tại'
  if (typeof newPassword !== 'string' || newPassword.length < 6) return 'Mật khẩu mới tối thiểu 6 ký tự'
  if (newPassword === currentPassword) return 'Mật khẩu mới phải khác mật khẩu hiện tại'
  return null
}

// Mã đặt lại mật khẩu: 32 byte ngẫu nhiên dạng hex (xem passwordReset.service.js).
const RESET_TOKEN = /^[0-9a-f]{64}$/
const INVALID_LINK = 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'

function validateForgotPassword({ email } = {}) {
  if (typeof email !== 'string' || !EMAIL.test(email.trim())) return 'Email không hợp lệ'
  return null
}

function validateResetPassword({ token, password } = {}) {
  if (typeof token !== 'string' || !RESET_TOKEN.test(token)) return INVALID_LINK
  if (typeof password !== 'string' || password.length < 6) return 'Mật khẩu mới tối thiểu 6 ký tự'
  return null
}

module.exports = {
  validateRegister, validateLogin, validateProfile, validatePasswordChange,
  validateForgotPassword, validateResetPassword, INVALID_LINK,
}
