const jwt = require('jsonwebtoken')
const User = require('../models/User')
const httpError = require('../utils/httpError')
const { isAdmin, isSuperadmin } = require('../utils/roles')

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
  if (!user || user.deletedAt) throw httpError(401, 'Tài khoản không tồn tại')
  // Khóa có hiệu lực ngay ở request kế tiếp, không chờ token hết hạn.
  if (user.status === 'locked') throw httpError(401, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên')
  req.user = user
  next()
}

// Bắt buộc là quản trị viên (admin hoặc superadmin). Dùng: router.use(requireAdmin) hoặc router.get('/x', requireAdmin, handler)
const requireAdmin = [
  requireAuth,
  (req, res, next) => next(isAdmin(req.user) ? undefined : httpError(403, 'Chỉ quản trị viên được thực hiện')),
]

// Chỉ quản trị viên cấp cao.
const requireSuperadmin = [
  requireAuth,
  (req, res, next) => next(isSuperadmin(req.user) ? undefined : httpError(403, 'Chỉ quản trị viên cấp cao được thực hiện')),
]

module.exports = { requireAuth, requireAdmin, requireSuperadmin }
