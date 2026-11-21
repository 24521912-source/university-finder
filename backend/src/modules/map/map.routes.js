const express = require('express')
const controller = require('./map.controller')

const router = express.Router()

// Dữ liệu tọa độ cho trang bản đồ (WBS 5.7). Công khai, chỉ đọc.
router.get('/universities', controller.universities)

module.exports = router
