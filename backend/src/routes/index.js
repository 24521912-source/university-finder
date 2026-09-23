const express = require('express')

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({
    message: 'Backend is running',
    status: 'OK',
  })
})

router.get('/universities', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Đại học Công nghệ Thông tin',
      location: 'TP.HCM',
    },
    {
      id: 2,
      name: 'Đại học Bách Khoa',
      location: 'TP.HCM',
    },
  ])
})

module.exports = router