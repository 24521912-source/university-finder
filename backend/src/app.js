const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const { notFound, errorHandler } = require('./middlewares/error')
const connectDB = require('./config/db')

const app = express()

app.use(cors())
// 1mb: một trường có thể có vài trăm dòng điểm chuẩn khi admin lưu cả document.
app.use(express.json({ limit: '1mb' }))

// Bảo đảm đã kết nối DB trước mỗi request — cần khi chạy serverless (Vercel);
// chạy local thì server.js đã kết nối sẵn nên bước này dùng lại kết nối cũ.
app.use(async (req, res, next) => {
  await connectDB()
  next()
})

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
