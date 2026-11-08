const express = require('express')
const { requireAdmin, requireSuperadmin } = require('../../middlewares/auth')
const controller = require('./history.controller')

const router = express.Router()

// Lịch sử thay đổi, gắn tại /api/admin/history.
// Xem + khôi phục: quản trị viên (khôi phục tài khoản vẫn theo quyền ở utils/roles.js).
// Xóa dòng lịch sử: chỉ quản trị cấp cao (tránh xóa dấu vết).
router.get('/', requireAdmin, controller.list)
router.get('/:id', requireAdmin, controller.get)
router.post('/:id/restore', requireAdmin, controller.restore)
router.delete('/:id', requireSuperadmin, controller.remove)

module.exports = router
