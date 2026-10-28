// Công cụ vận hành riêng; mặc định chỉ đọc. Không tạo tài khoản hoặc upsert.
const { MongoClient, ObjectId } = require('mongoose').mongo
function parseArgs(args) {
  const [rawEmail, ...flags] = args
  const email = rawEmail?.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Cần email tài khoản hiện có')
  const options = { email, apply: false }
  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i]
    if (flag === '--apply' && !options.apply) options.apply = true
    else if (['--confirm-email', '--expect-id'].includes(flag) && flags[i + 1] && !flags[i + 1].startsWith('--')) {
      const key = flag === '--confirm-email' ? 'confirmEmail' : 'expectedId'
      if (options[key]) throw new Error('Tham số bị lặp')
      options[key] = flags[++i]
    } else throw new Error('Tham số không hợp lệ')
  }
  if (options.apply && (options.confirmEmail !== email || !ObjectId.isValid(options.expectedId))) throw new Error('Apply cần --confirm-email đúng email và --expect-id lấy từ dry-run')
  return options
}
async function promote(collection, options) {
  const user = await collection.findOne({ email: options.email }, { projection: { email: 1, role: 1, updatedAt: 1 } })
  if (!user) throw new Error('Không tìm thấy tài khoản; công cụ không tự tạo tài khoản')
  const review = { mode: options.apply ? 'apply' : 'dry-run', id: user._id.toHexString(), email: user.email, before: user.role, after: 'admin', changed: false }
  if (!options.apply) return review
  if (review.id !== options.expectedId) throw new Error('ID khác bản đã duyệt; dừng')
  if (user.role !== 'user') throw new Error('Tài khoản không còn role user; dừng')
  const result = await collection.updateOne({ _id: user._id, email: user.email, role: 'user', updatedAt: user.updatedAt }, { $set: { role: 'admin', updatedAt: new Date() } }, { upsert: false })
  if (result.acknowledged !== true || result.matchedCount !== 1 || result.modifiedCount !== 1 || result.upsertedCount !== 0) throw new Error('Phản hồi cập nhật bất thường; không tự retry')
  return { ...review, changed: true }
}
async function main() {
  const options = parseArgs(process.argv.slice(2))
  require('dotenv').config({ quiet: true })
  const dbName = process.env.MONGODB_DB_NAME || 'unimatch_hcmc'
  if (dbName !== 'unimatch_hcmc' || !process.env.MONGODB_URI) throw new Error('Cấu hình database không đúng đích unimatch_hcmc')
  const dns = require('node:dns')
  if (dns.getServers().every(s => s === '127.0.0.1' || s === '::1')) dns.setServers(['8.8.8.8', '1.1.1.1'])
  const client = new MongoClient(process.env.MONGODB_URI, { retryWrites: false, serverSelectionTimeoutMS: 12000 })
  try {
    await client.connect()
    console.log(JSON.stringify(await promote(client.db(dbName).collection('users'), options), null, 2))
  } finally { await client.close() }
}
module.exports = { parseArgs, promote }
if (require.main === module) main().catch(() => { console.error('Dừng cấp quyền: kiểm tra email, tham số xác nhận, trạng thái tài khoản và kết nối. Không tự retry.'); process.exitCode = 1 })
