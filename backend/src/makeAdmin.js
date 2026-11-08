// Cấp quyền quản trị cho một tài khoản đã đăng ký. Website không cho tự đăng ký làm quản trị.
// Chạy trong backend:
//   npm run make-admin -- email@example.com           -> quản trị viên (admin)
//   npm run make-admin -- email@example.com --super   -> quản trị viên cấp cao (tối đa 2 người)
require('dotenv').config()

const mongoose = require('mongoose')
const connectDB = require('./config/db')
const User = require('./models/User')
const { MAX_SUPERADMINS } = require('./utils/roles')

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  const superadmin = process.argv.includes('--super')
  if (!email || email.startsWith('--')) throw new Error('Cách dùng: npm run make-admin -- email@example.com [--super]')

  await connectDB()
  const user = await User.findOne({ email, deletedAt: null })
  if (!user) {
    console.log(`Không có tài khoản ${email} — hãy đăng ký trên web trước`)
  } else if (superadmin) {
    const count = await User.countDocuments({ role: 'superadmin', deletedAt: null, _id: { $ne: user._id } })
    if (count >= MAX_SUPERADMINS) throw new Error(`Đã đủ ${MAX_SUPERADMINS} quản trị viên cấp cao`)
    await User.updateOne({ _id: user._id }, { role: 'superadmin', canManageAdmins: false, status: 'active' })
    console.log(`${email} đã là quản trị viên cấp cao`)
  } else {
    if (user.role === 'superadmin') throw new Error(`${email} đang là quản trị viên cấp cao; lệnh này không hạ quyền`)
    await User.updateOne({ _id: user._id }, { role: 'admin' })
    console.log(`${email} đã là quản trị viên`)
  }
  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
