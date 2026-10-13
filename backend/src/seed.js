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

async function upsertAll(Model, docs, key) {
  for (const doc of docs) {
    await Model.updateOne({ [key]: doc[key] }, doc, { upsert: true, runValidators: true })
  }
  console.log(`${Model.modelName}: ${docs.length} bản ghi`)
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
  await upsertAll(Major, majors, 'code')
  // Danh mục ngành = đúng majors.json: xóa ngành không còn trường nào dùng để dropdown không hiện ngành rỗng.
  const removed = await Major.deleteMany({ code: { $nin: majors.map((m) => m.code) } })
  if (removed.deletedCount) console.log(`Major: xóa ${removed.deletedCount} ngành không còn trong majors.json`)
  await upsertAll(University, universities, 'slug')
  await mongoose.disconnect()
}

main().catch((error) => {
  console.error('Seed thất bại:', error.message)
  process.exit(1)
})
