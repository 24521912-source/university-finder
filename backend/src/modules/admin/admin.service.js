const University = require('../../models/University')
const mongoose = require('mongoose')
const User = require('../../models/User')
const config = require('./aiSources')
const httpError = require('../../utils/httpError')

function options(query) {
  const integer = (value, fallback, max) => {
    if (value === undefined) return fallback
    if (typeof value !== 'string' || !/^[1-9]\d{0,6}$/.test(value) || Number(value) > max) throw httpError(400, 'Phân trang không hợp lệ')
    return Number(value)
  }
  if (query.q !== undefined && (typeof query.q !== 'string' || query.q.length > 100)) throw httpError(400, 'Từ khóa tối đa 100 ký tự')
  const q = (query.q || '').trim()
  return { page: integer(query.page, 1, 100000), limit: integer(query.limit, 20, 100), q, regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
}
const search = (o, fields) => o.q ? { $or: fields.map(field => ({ [field]: { $regex: o.regex, $options: 'i' } })) } : {}
const result = (items, total, o) => ({ items, total, page: o.page, limit: o.limit, totalPages: Math.ceil(total / o.limit) })
// Không khởi tạo model Major mới ở runtime để tránh autoCreate/autoIndex.
const majorCollection = () => mongoose.connection.db.collection('majors')
async function majors(o) {
  const collection = majorCollection()
  const filter = search(o, ['code', 'name', 'fieldGroup'])
  const [items, total] = await Promise.all([
    collection.find(filter, { projection: { code: 1, name: 1, fieldGroup: 1 } }).sort({ name: 1, _id: 1 }).skip((o.page - 1) * o.limit).limit(o.limit).toArray(), collection.countDocuments(filter),
  ])
  return result(items, total, o)
}
async function catalog(Model, fields, searchable, o) {
  const filter = search(o, searchable)
  const [items, total] = await Promise.all([
    Model.find(filter).select(fields).sort({ name: 1, _id: 1 }).skip((o.page - 1) * o.limit).limit(o.limit).lean(), Model.countDocuments(filter),
  ])
  return result(items, total, o)
}
async function overview() {
  const [universities, majors, users, records] = await Promise.all([
    University.countDocuments({}), majorCollection().countDocuments({}), User.countDocuments({}),
    University.aggregate([{ $group: { _id: null, tuition: { $sum: { $size: { $ifNull: ['$tuition', []] } } }, admissions: { $sum: { $size: { $ifNull: ['$admissions', []] } } } } }]),
  ])
  return { universities, majors, users, tuition: records[0]?.tuition || 0, admissions: records[0]?.admissions || 0 }
}
async function records(field, o) {
  const fields = field === 'tuition' ? ['academicYear', 'program', 'majorCode', 'amountMin', 'amountMax', 'unit', 'note', 'sourceUrl'] : ['year', 'method', 'majorCode', 'program', 'combinations', 'score', 'scale', 'sourceUrl']
  const project = { _id: `$${field}._id`, universityName: '$name', universitySlug: '$slug' }
  for (const key of fields) project[key] = `$${field}.${key}`
  const rows = await University.aggregate([
    { $unwind: `$${field}` }, { $project: project },
    { $match: search(o, ['universityName', 'universitySlug', 'majorCode', 'program']) },
    { $facet: { items: [{ $sort: { universityName: 1, universitySlug: 1, _id: 1 } }, { $skip: (o.page - 1) * o.limit }, { $limit: o.limit }], count: [{ $count: 'value' }] } },
  ])
  return result(rows[0]?.items || [], rows[0]?.count[0]?.value || 0, o)
}
async function aiData(o) {
  // Chỉ metadata đã trích; không phụ thuộc trang hoặc thuật toán AI chưa merge.
  const slugs = [...new Set([...Object.keys(config.SOURCES), ...Object.keys(config.ADMISSION_SOURCES)])].sort()
  const all = slugs.map(slug => ({ slug, domains: config.SOURCES[slug] || [], admission: config.ADMISSION_SOURCES[slug] || null, uncertainMajors: config.UNCERTAIN_MAJORS[slug] || [] })).filter(item => JSON.stringify(item).toLocaleLowerCase('vi').includes(o.q.toLocaleLowerCase('vi')))
  return { ...result(all.slice((o.page - 1) * o.limit, o.page * o.limit), all.length, o), academicYear: config.ACADEMIC_YEAR, provenance: 'Metadata nguồn được trích từ cấu hình AI đã khảo sát, không phải dữ liệu Atlas trực tiếp hoặc xác nhận trang AI đang hoạt động. Có URL trong cấu hình không đồng nghĩa mọi bản ghi đã được xác minh. Giữ nguyên năm, phương thức và các mã ngành còn bất định trong metadata.' }
}
const list = {
  universities: o => catalog(University, 'name slug shortName institutionType address.full address.district dataLevel', ['name', 'slug', 'shortName'], o),
  majors,
  users: o => catalog(User, 'fullName email role createdAt', ['fullName', 'email'], o),
  tuition: o => records('tuition', o), admissions: o => records('admissions', o), 'ai-data': aiData,
}
module.exports = { options, overview, list }
