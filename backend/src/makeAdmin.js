// Cấp quyền admin cho một tài khoản đã đăng ký. Website không cho tự đăng ký làm admin.
// Chạy: cd backend && npm run make-admin -- email@example.com
require('dotenv').config()

const mongoose = require('mongoose')
const connectDB = require('./config/db')
const User = require('./models/User')

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  if (!email) throw new Error('Cách dùng: npm run make-admin -- email@example.com')

  await connectDB()
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { returnDocument: 'after' })
  console.log(user ? `${user.email} đã là admin` : `Không có tài khoản ${email} — hãy đăng ký trên web trước`)
  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
