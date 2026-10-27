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

module.exports = { validateRegister, validateLogin }
