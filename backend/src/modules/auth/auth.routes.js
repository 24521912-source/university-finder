const express = require('express')
const controller = require('./auth.controller')
const { requireAuth } = require('../../middlewares/auth')
const { rateLimit } = require('../../middlewares/rateLimit')

const router = express.Router()

const MINUTE = 60 * 1000
// Đăng nhập: chỉ đếm lần sai, người dùng thật đăng nhập đúng không bị ảnh hưởng
const loginLimit = rateLimit({ windowMs: 15 * MINUTE, max: 10, skipSuccessful: true })
const registerLimit = rateLimit({ windowMs: 60 * MINUTE, max: 10 })
// Mỗi lần gọi có thể gửi một email -> chặt hơn để không bị dùng spam hộp thư người khác
const forgotLimit = rateLimit({ windowMs: 15 * MINUTE, max: 5 })
const resetLimit = rateLimit({ windowMs: 15 * MINUTE, max: 10 })

router.post('/register', registerLimit, controller.register)
router.post('/login', loginLimit, controller.login)
router.post('/forgot-password', forgotLimit, controller.forgotPassword)
router.post('/reset-password', resetLimit, controller.resetPassword)
router.get('/me', requireAuth, controller.me)
router.put('/me', requireAuth, controller.updateMe)
router.put('/password', requireAuth, controller.changePassword)

module.exports = router
