// Kiểm tra dữ liệu quản trị tài khoản. Trả về câu báo lỗi, hoặc null nếu hợp lệ.
const { passwordError } = require('../../utils/passwordPolicy')

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OBJECT_ID = /^[a-f0-9]{24}$/i
const isText = (value) => typeof value === 'string' && value.trim() !== ''

function validateId(id) {
  return typeof id === 'string' && OBJECT_ID.test(id) ? null : 'ID tài khoản không hợp lệ'
}

// Admin tạo tài khoản hộ: luôn là user, mật khẩu tạm (người dùng được nhắc đổi khi đăng nhập).
function validateCreate({ fullName, email, password } = {}) {
  if (!isText(fullName)) return 'Vui lòng nhập họ tên'
  if (fullName.trim().length > 100) return 'Họ tên tối đa 100 ký tự'
  if (typeof email !== 'string' || !EMAIL.test(email.trim())) return 'Email không hợp lệ'
  return passwordError(password, { label: 'Mật khẩu tạm', email })
}

function validateStatus({ status } = {}) {
  return ['active', 'locked'].includes(status) ? null : 'Trạng thái không hợp lệ'
}

function validateRole({ role } = {}) {
  return ['user', 'admin'].includes(role) ? null : 'Vai trò không hợp lệ'
}

function validatePermissions({ canManageAdmins } = {}) {
  return typeof canManageAdmins === 'boolean' ? null : 'Giá trị quyền không hợp lệ'
}

module.exports = { validateId, validateCreate, validateStatus, validateRole, validatePermissions }
