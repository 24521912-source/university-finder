const express = require('express')
const controller = require('./auth.controller')
const { requireAuth } = require('../../middlewares/auth')

const router = express.Router()

router.post('/register', controller.register)
router.post('/login', controller.login)
router.get('/me', requireAuth, controller.me)
router.put('/me', requireAuth, controller.updateMe)
router.put('/password', requireAuth, controller.changePassword)

module.exports = router
