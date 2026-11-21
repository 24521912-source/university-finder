const Consultation = require('../../models/Consultation')
const University = require('../../models/University')
const httpError = require('../../utils/httpError')
const { parseConsultation, isObjectId } = require('./consultations.validation')

// Mỗi tài khoản giữ tối đa chừng này lần tư vấn gần nhất; lưu thêm thì tự xóa bản cũ nhất.
const MAX_PER_USER = 30
const UNIVERSITY_FIELDS = 'slug name shortName'

function format(doc) {
  return {
    id: String(doc._id),
    createdAt: doc.createdAt,
    criteria: doc.criteria || {},
    // Trường đã bị admin xóa thì populate trả về null -> bỏ khỏi danh sách.
    results: (doc.results || []).filter((r) => r.university).map((r) => ({
      slug: r.university.slug,
      name: r.university.name,
      shortName: r.university.shortName,
      major: r.major,
      matchScore: r.matchScore,
      coverage: r.coverage,
      reasons: r.reasons || [],
    })),
  }
}

async function list(userId) {
  const docs = await Consultation.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(MAX_PER_USER)
    .populate('results.university', UNIVERSITY_FIELDS)
    .lean()
  return docs.map(format)
}

async function create(userId, body) {
  const { error, data } = parseConsultation(body)
  if (error) throw httpError(400, error)

  const slugs = [...new Set(data.results.map((r) => r.slug))]
  const found = await University.find({ slug: { $in: slugs } }).select(UNIVERSITY_FIELDS).lean()
  const bySlug = new Map(found.map((u) => [u.slug, u]))
  const unknown = slugs.filter((s) => !bySlug.has(s))
  if (unknown.length) throw httpError(400, `Không tìm thấy trường: ${unknown.join(', ')}`)

  const created = await Consultation.create({
    user: userId,
    criteria: data.criteria,
    results: data.results.map(({ slug, ...r }) => ({ ...r, university: bySlug.get(slug)._id })),
  })

  // Giữ MAX_PER_USER bản mới nhất.
  const old = await Consultation.find({ user: userId }).sort({ createdAt: -1 }).skip(MAX_PER_USER).select('_id').lean()
  if (old.length) await Consultation.deleteMany({ _id: { $in: old.map((o) => o._id) }, user: userId })

  const saved = typeof created.toObject === 'function' ? created.toObject() : created
  return format({ ...saved, results: saved.results.map((r, i) => ({ ...r, university: bySlug.get(data.results[i].slug) })) })
}

// Chỉ xóa được lịch sử của chính mình: điều kiện user nằm ngay trong câu truy vấn.
async function remove(userId, id) {
  if (!isObjectId(id)) throw httpError(400, 'ID không hợp lệ')
  const doc = await Consultation.findOneAndDelete({ _id: id, user: userId }).lean()
  if (!doc) throw httpError(404, 'Không tìm thấy lần tư vấn này')
  return { id }
}

module.exports = { list, create, remove, MAX_PER_USER }
