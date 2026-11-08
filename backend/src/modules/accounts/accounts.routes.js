const express = require('express')
const { requireAdmin } = require('../../middlewares/auth')
const controller = require('./accounts.controller')

const router = express.Router()

// Quản lý tài khoản, gắn tại /api/admin/users. Ai được làm gì với ai: xem utils/roles.js (denyReason).
router.use(requireAdmin)
router.get('/', controller.list)
router.post('/', controller.create)
router.patch('/:id/status', controller.setStatus)
router.patch('/:id/role', controller.setRole)
router.patch('/:id/permissions', controller.setPermissions)
router.delete('/:id', controller.remove)

module.exports = router
