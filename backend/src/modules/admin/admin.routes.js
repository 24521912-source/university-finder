const express = require('express')
const { requireAdmin } = require('../../middlewares/auth')
const controller = require('./admin.controller')

const router = express.Router()

// Mọi route admin: phải đăng nhập và có role admin trong database.
router.use(requireAdmin)
router.get('/majors', controller.majors)
router.get('/universities', controller.list)
router.post('/universities', controller.create)
router.get('/universities/:slug', controller.get)
router.put('/universities/:slug', controller.update)
router.delete('/universities/:slug', controller.remove)

module.exports = router
