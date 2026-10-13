const jwt = require('jsonwebtoken')
const User = require('../models/User')
const httpError = require('../utils/httpError')

// Bắt buộc đăng nhập: đọc header "Authorization: Bearer <token>", gắn người dùng vào req.user
async function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ')
  if (scheme !== 'Bearer' || !token) throw httpError(401, 'Bạn cần đăng nhập')

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw httpError(401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn')
  }

  const user = await User.findById(payload.sub)
  if (!user) throw httpError(401, 'Tài khoản không tồn tại')
  req.user = user
  next()
}

// Bắt buộc là admin. Dùng: router.use(requireAdmin) hoặc router.get('/x', requireAdmin, handler)
const requireAdmin = [
  requireAuth,
  (req, res, next) => next(req.user.role === 'admin' ? undefined : httpError(403, 'Chỉ quản trị viên được thực hiện')),
]

module.exports = { requireAuth, requireAdmin }
