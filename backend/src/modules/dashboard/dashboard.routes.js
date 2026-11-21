const express = require('express')
const { requireAdmin } = require('../../middlewares/auth')
const service = require('./dashboard.service')

const router = express.Router()

// Số liệu tổng quan cho tab Tổng quan của trang quản trị (WBS 7.2). Chỉ đọc.
router.get('/', requireAdmin, async (req, res) => res.json(await service.overview()))

module.exports = router
