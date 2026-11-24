const path = require('path')
const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const { notFound, errorHandler } = require('./middlewares/error')
const connectDB = require('./config/db')

const app = express()

app.use(cors())
// 1mb: một trường có thể có vài trăm dòng điểm chuẩn khi admin lưu cả document.
app.use(express.json({ limit: '1mb' }))

// Tài liệu API (apidoc) — tạo bằng `npm run docs`. Đặt trước bước kết nối DB để xem được cả khi DB lỗi.
const API_DOCS_DIR = path.join(__dirname, '../public/api-docs')
app.use('/api-docs', express.static(API_DOCS_DIR))
app.get('/', (req, res) => res.redirect('/api-docs/'))

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
