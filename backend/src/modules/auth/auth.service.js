const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const httpError = require('../../utils/httpError')

// Thông tin người dùng được phép trả về cho frontend (không bao giờ có passwordHash)
const toPublicUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  canManageAdmins: user.canManageAdmins === true,
  mustChangePassword: user.mustChangePassword === true,
  favorites: user.favorites,
})

function createSession(user) {
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
  return { token, user: toPublicUser(user) }
}

async function register({ fullName, email, password, role }) {
  if (role !== undefined && role !== 'user') throw httpError(400, 'Đăng ký công khai chỉ cho phép vai trò user')
  email = email.trim().toLowerCase()
  if (await User.exists({ email })) throw httpError(409, 'Email đã được đăng ký')

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ fullName: fullName.trim(), email, passwordHash, role: 'user' })
  return createSession(user)
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw httpError(401, 'Email hoặc mật khẩu không đúng')
  }
  if (user.deletedAt) throw httpError(401, 'Email hoặc mật khẩu không đúng')
  if (user.status === 'locked') throw httpError(403, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên')
  return createSession(user)
}

// Chỉ ghi fullName (đã kiểm tra ở validation); không nhận email / role / favorites từ client.
async function updateProfile(userId, { fullName }) {
  const user = await User.findByIdAndUpdate(userId, { fullName: fullName.trim() }, { returnDocument: 'after', runValidators: true })
  if (!user) throw httpError(404, 'Tài khoản không tồn tại')
  return toPublicUser(user)
}

// Bắt nhập đúng mật khẩu hiện tại. Sai -> 400 (không dùng 401 để không bị hiểu là hết phiên đăng nhập).
async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+passwordHash')
  if (!user) throw httpError(404, 'Tài khoản không tồn tại')
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) throw httpError(400, 'Mật khẩu hiện tại không đúng')
  user.passwordHash = await bcrypt.hash(newPassword, 10)
  user.mustChangePassword = false
  await user.save()
}

module.exports = { register, login, toPublicUser, updateProfile, changePassword }
