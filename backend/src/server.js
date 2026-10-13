require('dotenv').config()

const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

if (!process.env.JWT_SECRET) {
  console.error('Thiếu JWT_SECRET trong backend/.env (xem backend/.env.example)')
  process.exit(1)
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  })
