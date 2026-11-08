// Đẩy dữ liệu gốc trong database/seeds/*.json lên MongoDB Atlas.
// Upsert theo khóa (Major.code, University.slug): chạy lại nhiều lần không tạo bản trùng.
// Chạy: cd backend && npm run seed
require('dotenv').config()

const mongoose = require('mongoose')
const connectDB = require('./config/db')
const Major = require('./models/Major')
const University = require('./models/University')
const majors = require('../../database/seeds/majors.json')
const universities = require('../../database/seeds/universities.json')

// --dry-run: chỉ in ra trường / field sẽ thay đổi, không ghi gì vào database.
const DRY_RUN = process.argv.includes('--dry-run')

// Bỏ _id/timestamps để so nội dung.
const plain = (v) => JSON.stringify(v ?? null, (k, x) => (['_id', '__v', 'createdAt', 'updatedAt'].includes(k) ? undefined : x))

// Chỉ ghi field có nội dung khác database. Field giống hệt không bị ghi lại, nên _id của từng
// dòng điểm chuẩn / học phí được giữ (trang chi tiết Bách khoa đối chiếu bản ghi đã duyệt theo _id).
async function upsertAll(Model, docs, key) {
  let created = 0
  let updated = 0
  for (const doc of docs) {
    const current = await Model.findOne({ [key]: doc[key] }).lean()
    if (!current) {
      if (DRY_RUN) console.log(`  [thêm] ${doc[key]}`)
      else await Model.create(doc)
      created++
      continue
    }
    const changed = Object.fromEntries(Object.entries(doc).filter(([k, v]) => plain(v) !== plain(current[k])))
    if (Object.keys(changed).length) {
      if (DRY_RUN) console.log(`  [sửa] ${doc[key]}: ${Object.keys(changed).join(', ')}`)
      else await Model.updateOne({ _id: current._id }, { $set: changed }, { runValidators: true })
      updated++
    }
  }
  console.log(`${Model.modelName}: ${docs.length} bản ghi (thêm ${created}, cập nhật ${updated})${DRY_RUN ? ' — CHẠY THỬ, chưa ghi' : ''}`)
}

// Mọi mã ngành trường khai báo phải có trong danh mục; điểm chuẩn/học phí phải trỏ tới ngành của chính trường đó.
function checkMajorCodes() {
  const catalog = new Set(majors.map((m) => m.code))
  const errors = []
  for (const u of universities) {
    const own = new Set((u.majors || []).map((m) => m.code))
    for (const code of own) if (!catalog.has(code)) errors.push(`${u.slug}: ngành ${code} chưa có trong majors.json`)
    for (const item of [...(u.admissions || []), ...(u.tuition || [])]) {
      if (item.majorCode && !own.has(item.majorCode)) errors.push(`${u.slug}: ${item.majorCode} không nằm trong majors của trường`)
    }
  }
  if (errors.length) throw new Error(`Sai mã ngành:\n${errors.join('\n')}`)
}

async function main() {
  checkMajorCodes()
  await connectDB()
  // Admin sửa dữ liệu trực tiếp trên MongoDB. Seed ghi đè các trường cùng slug -> mất bản sửa của admin.
  const existing = await University.estimatedDocumentCount()
  if (existing > 0 && !DRY_RUN && !process.argv.includes('--overwrite')) {
    await mongoose.disconnect()
    throw new Error(`Database đã có ${existing} trường. Seed sẽ GHI ĐÈ dữ liệu admin đã sửa trên web. ` +
      'Nếu chắc chắn, chạy: npm run seed -- --overwrite')
  }
  await upsertAll(Major, majors, 'code')
  // Danh mục ngành = đúng majors.json: xóa ngành không còn trường nào dùng để dropdown không hiện ngành rỗng.
  if (!DRY_RUN) {
    const removed = await Major.deleteMany({ code: { $nin: majors.map((m) => m.code) } })
    if (removed.deletedCount) console.log(`Major: xóa ${removed.deletedCount} ngành không còn trong majors.json`)
  }
  await upsertAll(University, universities, 'slug')
  await mongoose.disconnect()
}

main().catch((error) => {
  console.error('Seed thất bại:', error.message)
  process.exit(1)
})
