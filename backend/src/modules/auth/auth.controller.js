const authService = require('./auth.service')
const { validateRegister, validateLogin } = require('./auth.validation')
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

module.exports = { register, login, me }
