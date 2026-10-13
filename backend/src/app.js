const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const { notFound, errorHandler } = require('./middlewares/error')
const connectDB = require('./config/db')

const app = express()

app.use(cors())
app.use(express.json())

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
