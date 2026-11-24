// Quên mật khẩu: gửi link có mã dùng một lần qua email, người dùng mở link để đặt mật khẩu mới.
const crypto = require('node:crypto')
const bcrypt = require('bcryptjs')
const User = require('../../models/User')
const httpError = require('../../utils/httpError')
const mailer = require('../../utils/mailer')
const { createSession } = require('./auth.service')
const { INVALID_LINK } = require('./auth.validation')

const TOKEN_TTL_MINUTES = 30
// Chặn bấm gửi liên tục làm đầy hộp thư người khác.
const RESEND_COOLDOWN_MS = 60 * 1000

const SENT_MESSAGE = 'Nếu email này đã đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu trong vài phút. Hãy kiểm tra cả thư mục Spam.'

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

function resetLink(token) {
  const base = (process.env.APP_URL || 'http://localhost:5173').replace(/\/+$/, '')
  return `${base}/dat-lai-mat-khau?token=${token}`
}

function resetEmail(user, link) {
  const name = user.fullName || 'bạn'
  const text = [
    `Chào ${name},`,
    '',
    'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản UniMatch HCMC của bạn.',
    `Mở liên kết sau để đặt mật khẩu mới (hết hạn sau ${TOKEN_TTL_MINUTES} phút, chỉ dùng được một lần):`,
    '',
    link,
    '',
    'Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu hiện tại vẫn giữ nguyên.',
  ].join('\n')
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1f2937;max-width:520px">
  <p>Chào ${escapeHtml(name)},</p>
  <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <b>UniMatch HCMC</b> của bạn.</p>
  <p><a href="${link}" style="display:inline-block;background:#1976d2;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Đặt lại mật khẩu</a></p>
  <p>Liên kết hết hạn sau ${TOKEN_TTL_MINUTES} phút và chỉ dùng được một lần. Nếu nút không bấm được, dán đường dẫn này vào trình duyệt:<br>
  <a href="${link}" style="color:#1976d2;word-break:break-all">${link}</a></p>
  <p style="color:#6b7280">Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu hiện tại vẫn giữ nguyên.</p>
</div>`
  return { to: user.email, subject: 'Đặt lại mật khẩu UniMatch HCMC', text, html }
}

// Không cho biết email có tài khoản hay không: trường hợp nào cũng trả về bình thường.
async function requestReset({ email }, now = new Date()) {
  if (!mailer.canSend()) throw httpError(503, 'Chức năng gửi email chưa được cấu hình. Vui lòng liên hệ quản trị viên')

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+resetRequestedAt')
  if (!user || user.deletedAt || user.status === 'locked') return
  if (user.resetRequestedAt && now - user.resetRequestedAt < RESEND_COOLDOWN_MS) return

  // Mã mới thay mã cũ: link trong email trước đó hết dùng được.
  const token = crypto.randomBytes(32).toString('hex')
  user.resetTokenHash = hashToken(token)
  user.resetTokenExpiresAt = new Date(now.getTime() + TOKEN_TTL_MINUTES * 60 * 1000)
  user.resetRequestedAt = now
  await user.save()

  try {
    await mailer.sendMail(resetEmail(user, resetLink(token)))
  } catch (error) {
    console.error('[mail] Gửi thư đặt lại mật khẩu thất bại:', error.message)
    user.resetTokenHash = user.resetTokenExpiresAt = user.resetRequestedAt = undefined
    await user.save()
    throw httpError(502, 'Không gửi được email lúc này, vui lòng thử lại sau')
  }
}

async function resetPassword({ token, password }, now = new Date()) {
  const user = await User.findOne({ resetTokenHash: hashToken(token), resetTokenExpiresAt: { $gt: now } })
    .select('+passwordHash +resetTokenHash +resetTokenExpiresAt +resetRequestedAt')
  if (!user || user.deletedAt) throw httpError(400, INVALID_LINK)
  if (user.status === 'locked') throw httpError(403, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên')

  user.passwordHash = await bcrypt.hash(password, 10)
  user.mustChangePassword = false
  user.passwordChangedAt = now // đăng xuất các phiên đăng nhập cũ (xem middlewares/auth.js)
  user.resetTokenHash = user.resetTokenExpiresAt = user.resetRequestedAt = undefined
  await user.save()
  return createSession(user)
}

module.exports = { requestReset, resetPassword, hashToken, SENT_MESSAGE, TOKEN_TTL_MINUTES, RESEND_COOLDOWN_MS }
