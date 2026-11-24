// Ghi dữ liệu chi tiết đã duyệt của một trường (database/seeds/details/<slug>.json) vào MongoDB.
// File gồm: slug, set (các field ghi đè, kèm detailEvidence) và admissionProgramDefault
// (tên chương trình điền cho dòng điểm chuẩn chưa ghi chương trình).
// node src/applyUniversityDetail.js ../database/seeds/details/cong-nghe-thong-tin-dhqg.json          -> chạy thử
// node src/applyUniversityDetail.js ../database/seeds/details/cong-nghe-thong-tin-dhqg.json --apply  -> ghi thật
require('dotenv').config()
const fs = require('fs')
const mongoose = require('mongoose')
const connectDB = require('./config/db')

const file = process.argv[2]
const apply = process.argv.includes('--apply')
if (!file) {
  console.error('Thiếu đường dẫn file JSON')
  process.exit(1)
}

// _id dạng chuỗi trong các mảng con -> ObjectId để khớp với bản ghi mongoose tạo ra.
// detailEvidence giữ nguyên chuỗi vì trang chi tiết so sánh với _id đã chuyển thành chuỗi qua API.
const withObjectIds = (value) => Array.isArray(value)
  ? value.map((item) => item && typeof item === 'object' && typeof item._id === 'string' ? { ...item, _id: new mongoose.Types.ObjectId(item._id) } : item)
  : value

;(async () => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  await connectDB()
  const col = mongoose.connection.db.collection('universities')
  const doc = await col.findOne({ slug: data.slug })
  if (!doc) throw new Error(`Không có trường ${data.slug} trong database`)

  const set = {}
  for (const [key, value] of Object.entries(data.set || {})) set[key] = key === 'detailEvidence' ? value : withObjectIds(value)
  if (data.set?.detailEvidence?.slug !== data.slug) throw new Error('detailEvidence.slug phải trùng slug của trường')

  let filled = 0
  if (data.admissionProgramDefault) {
    set.admissions = (doc.admissions || []).map((a) => {
      if (a.program) return a
      filled++
      return { ...a, program: data.admissionProgramDefault }
    })
  }

  for (const [key, value] of Object.entries(set)) {
    const before = doc[key]
    const count = (v) => Array.isArray(v) ? `[${v.length}]` : v && typeof v === 'object' ? '{…}' : JSON.stringify(v)
    console.log(`  ${key}: ${count(before)} -> ${count(value)}`)
  }
  if (data.admissionProgramDefault) console.log(`  (điền chương trình "${data.admissionProgramDefault}" cho ${filled} dòng điểm chuẩn)`)

  if (apply) {
    await col.updateOne({ _id: doc._id }, { $set: { ...set, updatedAt: new Date() } })
    console.log(`Đã ghi ${data.slug}`)
  } else {
    console.log('Chạy thử, chưa ghi. Thêm --apply để ghi thật.')
  }
  await mongoose.disconnect()
})().catch((e) => { console.error(e); process.exit(1) })
