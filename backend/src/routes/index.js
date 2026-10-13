const express = require('express')
const University = require('../models/University')

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({
    message: 'Backend is running',
    status: 'OK',
  })
})

router.get('/universities', async (req, res) => {
  const universities = await University.find()
    .select('slug name shortName institutionType address.district media.logoUrl favoriteCount')
    .sort({ name: 1 })
    .lean()

  res.json(universities)
})

module.exports = router
