require('dotenv').config()

const mongoose = require('mongoose')
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

if (!process.env.JWT_SECRET) {
  console.error('Thiếu JWT_SECRET trong backend/.env (xem backend/.env.example)')
  process.exit(1)
}

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`)
      // process.json bật wait_ready: PM2 chờ tín hiệu này (đã nối DB, đã mở cổng) mới coi tiến trình là online.
      // Nhờ vậy `pm2 reload` chỉ tắt tiến trình cũ khi tiến trình mới đã sẵn sàng nhận request.
      if (process.send) process.send('ready')
    })

    // PM2 gửi SIGINT khi stop / reload: ngừng nhận request mới, trả lời nốt request đang chạy rồi đóng kết nối DB.
    // Quá kill_timeout (5 giây) mà chưa xong thì PM2 tự buộc dừng.
    let shuttingDown = false
    const shutdown = () => {
      if (shuttingDown) return
      shuttingDown = true
      server.close(() => {
        mongoose.connection.close().finally(() => process.exit(0))
      })
    }
    process.once('SIGINT', shutdown)
    process.once('SIGTERM', shutdown)
    // Windows không có tín hiệu, PM2 gửi message 'shutdown' thay cho SIGINT
    process.on('message', (message) => {
      if (message === 'shutdown') shutdown()
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  })
