const express = require('express')
const controller = require('./universities.controller')

const router = express.Router()

router.get('/', controller.list)
router.get('/recommendation-data', controller.recommendationData)
router.get('/:slug', controller.detail)

module.exports = router
