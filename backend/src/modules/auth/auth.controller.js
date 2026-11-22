const authService = require('./auth.service')
const passwordReset = require('./passwordReset.service')
const {
  validateRegister, validateLogin, validateProfile, validatePasswordChange,
  validateForgotPassword, validateResetPassword,
} = require('./auth.validation')
const httpError = require('../../utils/httpError')

async function register(req, res) {
  const error = validateRegister(req.body)
  if (error) throw httpError(400, error)
  res.status(201).json(await authService.register(req.body))
}

async function login(req, res) {
  const error = validateLogin(req.body)
  if (error) throw httpError(400, error)
  res.json(await authService.login(req.body))
}

function me(req, res) {
  res.json({ user: authService.toPublicUser(req.user) })
}

async function updateMe(req, res) {
  const error = validateProfile(req.body)
  if (error) throw httpError(400, error)
  res.json({ user: await authService.updateProfile(req.user.id, req.body) })
}

async function changePassword(req, res) {
  const error = validatePasswordChange(req.body)
  if (error) throw httpError(400, error)
  await authService.changePassword(req.user.id, req.body)
  res.json({ message: 'Đã đổi mật khẩu' })
}

// Luôn trả cùng một câu, dù email có tài khoản hay không.
async function forgotPassword(req, res) {
  const error = validateForgotPassword(req.body)
  if (error) throw httpError(400, error)
  await passwordReset.requestReset(req.body)
  res.json({ message: passwordReset.SENT_MESSAGE })
}

// Đặt mật khẩu mới bằng mã trong email, xong thì đăng nhập luôn (trả { token, user } như /login).
async function resetPassword(req, res) {
  const error = validateResetPassword(req.body)
  if (error) throw httpError(400, error)
  res.json(await passwordReset.resetPassword(req.body))
}

module.exports = { register, login, me, updateMe, changePassword, forgotPassword, resetPassword }
