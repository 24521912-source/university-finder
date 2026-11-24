// Nhập dữ liệu thu thập từ web vào universities. Chỉ điền các mục đang trống.
// node src/importScraped.js <thư mục json>          -> dry-run
// node src/importScraped.js <thư mục json> --apply  -> ghi thật
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const dir = process.argv[2]
const apply = process.argv.includes('--apply')
const METHODS = ['high_school_exam', 'competency_assessment', 'transcript', 'direct', 'other']
const isEmpty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0)

;(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'unimatch_hcmc' })
  const col = mongoose.connection.db.collection('universities')
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
    const slug = data.slug || path.basename(file, '.json')
    // Dạng gọn: [majorCode, name, method, combos, score, scale, program]
    if (Array.isArray(data.admissions?.[0])) {
      const rows = data.admissions
      data.admissions = rows.map(([majorCode, , method, combinations, score, scale, program]) => ({
        year: data.year, method, majorCode, score,
        combinations: Array.isArray(combinations) ? combinations : String(combinations || '').split(/[;,\s]+/).filter(Boolean), scale, ...(program ? { program } : {}), sourceUrl: data.source,
      }))
      if (!data.majors) {
        const seen = new Map()
        rows.forEach(([code, name]) => { if (code && !seen.has(code)) seen.set(code, name.replace(/\s*\(Chương trình.*$/i, '')) })
        data.majors = [...seen].map(([code, name]) => ({ code, name }))
      }
    }
    const doc = await col.findOne({ slug })
    if (!doc) { console.log(`!! ${slug}: không có trong DB`); continue }
    const set = {}
    if (isEmpty(doc.description) && data.description) set.description = data.description
    if (isEmpty(doc.majors) && data.majors?.length)
      set.majors = data.majors.filter((m) => /^\d{7}$/.test(m.code) && m.name)
    if (isEmpty(doc.admissions) && data.admissions?.length)
      set.admissions = data.admissions
        .filter((a) => /^\d{7}$/.test(a.majorCode) && METHODS.includes(a.method) && a.score > 0 && a.scale > 0 && a.year)
        .map((a) => ({ _id: new mongoose.Types.ObjectId(), verifiedForAI: true, ...a }))
    if (isEmpty(doc.tuition) && data.tuition?.length)
      set.tuition = data.tuition
        .filter((t) => t.academicYear && t.amountMin > 0)
        .map((t) => ({ _id: new mongoose.Types.ObjectId(), ...t }))
    if (data.sourceDomains?.length) set.sourceDomains = [...new Set([...(doc.sourceDomains || []), ...data.sourceDomains])]
    const hasMajors = (set.majors || doc.majors || []).length > 0
    const hasAdm = (set.admissions || doc.admissions || []).length > 0
    if (hasMajors && hasAdm && (doc.dataLevel || 1) < 2) set.dataLevel = 2
    const summary = Object.entries(set).map(([k, v]) => `${k}${Array.isArray(v) ? `(${v.length})` : ''}`).join(', ')
    console.log(`${apply ? 'GHI' : 'THỬ'} ${slug}: ${summary || 'không có gì mới'}`)
    if (apply && Object.keys(set).length) await col.updateOne({ _id: doc._id }, { $set: { ...set, updatedAt: new Date() } })
  }
  await mongoose.disconnect()
})().catch((e) => { console.error(e); process.exit(1) })
