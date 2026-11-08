// Khôi phục từ bản sao lưu của `npm run backup`.
// Chạy trong backend:
//   npm run restore-backup -- <thư-mục-backup> <collection>               -> CHẠY THỬ: in số bản ghi sẽ ghi, không ghi
//   npm run restore-backup -- <thư-mục-backup> <collection> --overwrite   -> ghi thật
// Ví dụ: npm run restore-backup -- ../backups/2026-11-08T10-00-00 universities
// Mỗi bản ghi trong file được ghi đè theo _id (chưa có thì thêm). Bản ghi chỉ có trong database, không có trong file, giữ nguyên.
// Chỉ khôi phục từng collection một, có chủ đích; nên chạy `npm run backup` trước để có bản hiện tại.
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const connectDB = require('./config/db')

const { EJSON } = mongoose.mongo.BSON

async function main() {
  const [dirArg, collection] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const write = process.argv.includes('--overwrite')
  if (!dirArg || !collection || !/^[a-z_]+$/i.test(collection)) {
    throw new Error('Cách dùng: npm run restore-backup -- <thư-mục-backup> <collection> [--overwrite]')
  }
  const file = path.resolve(dirArg, `${collection}.json`)
  if (!fs.existsSync(file)) throw new Error(`Không thấy file ${file}`)
  const docs = EJSON.parse(fs.readFileSync(file, 'utf8'), { relaxed: false })
  if (!Array.isArray(docs)) throw new Error('File sao lưu không đúng định dạng')

  await connectDB()
  const col = mongoose.connection.db.collection(collection)
  const ids = docs.map((d) => d._id)
  const existing = await col.countDocuments({ _id: { $in: ids } })
  console.log(`${collection}: ${docs.length} bản ghi trong file — ghi đè ${existing}, thêm mới ${docs.length - existing}`)

  if (!write) {
    console.log('CHẠY THỬ, chưa ghi. Thêm --overwrite để ghi thật.')
  } else if (docs.length) {
    const result = await col.bulkWrite(docs.map((d) => ({ replaceOne: { filter: { _id: d._id }, replacement: d, upsert: true } })))
    console.log(`Đã ghi: sửa ${result.modifiedCount}, thêm ${result.upsertedCount}`)
  }
  await mongoose.disconnect()
}

main().catch((error) => {
  console.error('Khôi phục thất bại:', error.message)
  process.exit(1)
})
