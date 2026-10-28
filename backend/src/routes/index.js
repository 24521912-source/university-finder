const express = require('express')

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({
    message: 'Backend is running',
    status: 'OK',
  })
})

// Mỗi chức năng là một module trong src/modules/<tên>/ — thêm một dòng ở đây khi tạo module mới
router.use('/auth', require('../modules/auth/auth.routes'))
router.use('/admin', require('../modules/admin/admin.routes'))
router.use('/universities', require('../modules/universities/universities.routes'))

module.exports = router
