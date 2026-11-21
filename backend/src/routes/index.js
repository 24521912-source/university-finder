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
router.use('/universities', require('../modules/universities/universities.routes'))
router.use('/map', require('../modules/map/map.routes'))
router.use('/majors', require('../modules/majors/majors.routes'))
router.use('/favorites', require('../modules/favorites/favorites.routes'))
router.use('/admin/users', require('../modules/accounts/accounts.routes'))
router.use('/admin/history', require('../modules/history/history.routes'))
router.use('/admin', require('../modules/admin/admin.routes'))

module.exports = router
