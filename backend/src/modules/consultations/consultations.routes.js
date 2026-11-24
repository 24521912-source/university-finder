const express = require('express')
const controller = require('./consultations.controller')
const { requireAuth } = require('../../middlewares/auth')

const router = express.Router()

// Lịch sử AI tư vấn của người đang đăng nhập (WBS 5.10, 6.7).
router.use(requireAuth)
router.get('/', controller.list)
router.post('/', controller.create)
router.delete('/:id', controller.remove)

module.exports = router
