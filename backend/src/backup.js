// Sao lưu TOÀN BỘ database ra file (phòng sự cố lớn; gói Atlas miễn phí không tự sao lưu).
// Chạy trong backend:  npm run backup
// Kết quả: backups/<ngày-giờ>/<collection>.json (định dạng Extended JSON, giữ đúng ObjectId / Date).
// ⚠️ File chứa cả mật khẩu đã mã hóa của người dùng: thư mục backups/ đã nằm trong .gitignore,
//    không gửi file này cho người ngoài nhóm. Khôi phục: npm run restore-backup (xem database/README.md).
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const connectDB = require('./config/db')

const { EJSON } = mongoose.mongo.BSON
const ROOT = path.join(__dirname, '../../backups')

async function main() {
  await connectDB()
  const db = mongoose.connection.db
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const dir = path.join(ROOT, stamp)
  fs.mkdirSync(dir, { recursive: true })

  const collections = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).sort()
  const summary = {}
  for (const name of collections) {
    const docs = await db.collection(name).find().toArray()
    fs.writeFileSync(path.join(dir, `${name}.json`), EJSON.stringify(docs, null, 1, { relaxed: false }))
    summary[name] = docs.length
  }
  fs.writeFileSync(path.join(dir, '_summary.json'), JSON.stringify({ createdAt: new Date().toISOString(), database: db.databaseName, collections: summary }, null, 2))
  console.log(`Đã sao lưu ${collections.length} collection vào ${path.relative(process.cwd(), dir)}`)
  for (const [name, n] of Object.entries(summary)) console.log(`  ${name}: ${n}`)
  await mongoose.disconnect()
}

main().catch((error) => {
  console.error('Sao lưu thất bại:', error.message)
  process.exit(1)
})
