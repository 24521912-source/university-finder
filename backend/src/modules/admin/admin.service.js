const University = require('../../models/University')
const Major = require('../../models/Major')
const httpError = require('../../utils/httpError')
const { validateSlug, validateBody, pickEditable, validateMajorCodes } = require('./admin.validation')

const PAGE_SIZE = 20

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Ném lỗi 400 nếu hàm validation trả về câu báo lỗi.
function ensure(message) {
  if (message) throw httpError(400, message)
}

async function checkMajorCodes(data) {
  const own = (data.majors || []).map((m) => m?.code)
  const known = new Set(await Major.distinct('code', { code: { $in: own } }))
  ensure(validateMajorCodes(data, known))
}

async function list({ q = '', page = 1 } = {}) {
  const p = Math.max(1, Math.min(1000, Number.parseInt(page, 10) || 1))
  const text = String(q).trim().slice(0, 100)
  const filter = text
    ? { $or: ['name', 'shortName', 'slug'].map((f) => ({ [f]: { $regex: escapeRegex(text), $options: 'i' } })) }
    : {}
  const [items, total] = await Promise.all([
    University.find(filter)
      .select('slug name shortName institutionType dataLevel address.district updatedAt majors.code')
      .sort({ name: 1 }).skip((p - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    University.countDocuments(filter),
  ])
  return {
    items: items.map(({ majors, address, ...u }) => ({ ...u, district: address?.district ?? null, majorCount: majors?.length || 0 })),
    page: p,
    pageSize: PAGE_SIZE,
    total,
  }
}

async function get(slug) {
  ensure(validateSlug(slug))
  const u = await University.findOne({ slug }).lean()
  if (!u) throw httpError(404, 'Không tìm thấy trường đại học')
  return u
}

async function create(body) {
  ensure(validateBody(body))
  const data = pickEditable(body)
  ensure(validateSlug(data.slug))
  await checkMajorCodes(data)
  const u = await University.create(data)
  return u.toObject()
}

async function update(slug, body) {
  ensure(validateSlug(slug))
  ensure(validateBody(body))
  const data = pickEditable(body)
  if ('slug' in data) ensure(validateSlug(data.slug))
  const current = await University.findOne({ slug }).lean()
  if (!current) throw httpError(404, 'Không tìm thấy trường đại học')
  await checkMajorCodes({ ...current, ...data })
  // Ghi đè các field được gửi lên; field không gửi giữ nguyên.
  return University.findOneAndUpdate({ slug }, { $set: data }, { returnDocument: 'after', runValidators: true }).lean()
}

async function remove(slug) {
  ensure(validateSlug(slug))
  const u = await University.findOneAndDelete({ slug }).lean()
  if (!u) throw httpError(404, 'Không tìm thấy trường đại học')
  return { slug: u.slug }
}

async function majors() {
  return Major.find().select('code name -_id').sort({ code: 1 }).lean()
}

module.exports = { list, get, create, update, remove, majors }
