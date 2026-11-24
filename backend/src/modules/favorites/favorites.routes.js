const express = require('express')
const controller = require('./favorites.controller')
const { requireAuth } = require('../../middlewares/auth')

const router = express.Router()

// Yêu thích của người đang đăng nhập. Trả về { favorites: [id trường] }.
router.use(requireAuth)
router.post('/:slug', controller.add)
router.delete('/:slug', controller.remove)

module.exports = router
