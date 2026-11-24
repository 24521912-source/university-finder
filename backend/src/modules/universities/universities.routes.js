const express = require('express')
const controller = require('./universities.controller')

const router = express.Router()

router.get('/', controller.list)
// Các đường dẫn cố định phải khai báo TRƯỚC '/:slug', nếu không "search" sẽ bị hiểu là một slug.
router.get('/search', controller.search)
router.get('/filter-options', controller.filterOptions)
router.get('/compare', controller.compare)
router.get('/recommendation-data', controller.recommendationData)
router.get('/:slug', controller.detail)

module.exports = router
