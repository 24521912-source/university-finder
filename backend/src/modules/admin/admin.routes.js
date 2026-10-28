const express = require('express')
const { requireAdmin } = require('../../middlewares/auth')
const service = require('./admin.service')
const controller = require('./admin.controller')
const router = express.Router()
router.use(requireAdmin)
router.get('/overview', controller.overview)
for (const resource of Object.keys(service.list)) {
  router.get(`/${resource}`, controller.list(resource))
}
module.exports = router
