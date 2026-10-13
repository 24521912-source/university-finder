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
  favorites: user.favorites,
})

function createSession(user) {
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
  return { token, user: toPublicUser(user) }
}

async function register({ fullName, email, password }) {
  email = email.trim().toLowerCase()
  if (await User.exists({ email })) throw httpError(409, 'Email đã được đăng ký')

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ fullName: fullName.trim(), email, passwordHash })
  return createSession(user)
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw httpError(401, 'Email hoặc mật khẩu không đúng')
  }
  return createSession(user)
}

module.exports = { register, login, toPublicUser }
