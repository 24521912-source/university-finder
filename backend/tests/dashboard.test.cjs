const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const crypto = require('node:crypto')
const express = require('express')
const jwt = require('jsonwebtoken')

// Model giả trong RAM: không kết nối Atlas.
const now = new Date('2026-11-21T10:00:00Z')
const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)
const universities = [
  { slug: 'a', name: 'Trường A', shortName: 'A', institutionType: 'public', belongsToUniversitySystem: true, dataLevel: 3, favoriteCount: 5,
    media: { logoUrl: 'https://a/logo.png' }, address: { location: { coordinates: [106.7, 10.8] } },
    majors: [{ code: '1' }], tuition: [{ _id: 't' }], admissions: [{ verifiedForAI: true }] },
  { slug: 'b', name: 'Trường B', institutionType: 'private', dataLevel: 2, favoriteCount: 9, majors: [{ code: '1' }], admissions: [{ verifiedForAI: false }] },
  { slug: 'c', name: 'Trường C', institutionType: 'private', favoriteCount: 0, address: { location: { coordinates: [0, 0] } } },
]
const users = [
  { _id: 'admin1', role: 'admin', status: 'active', createdAt: daysAgo(100) },
  { _id: 'u1', role: 'user', status: 'active', createdAt: daysAgo(3) },
  { _id: 'u2', role: 'user', status: 'locked', createdAt: daysAgo(40) },
  { _id: 'u3', role: 'user', status: 'active', createdAt: daysAgo(1), deletedAt: daysAgo(1) },
]
const lean = (v) => ({ select() { return this }, sort() { return this }, limit() { return this }, lean: async () => structuredClone(v) })
function mock(rel, exports) {
  const file = require.resolve(path.join(__dirname, '../src', rel))
  require.cache[file] = { id: file, filename: file, loaded: true, exports }
}
mock('models/University', { find: () => lean(universities) })
mock('models/Major', { countDocuments: async () => 42 })
mock('models/User', {
  find: () => lean(users),
  findById: async (id) => users.find((u) => u._id === id) || null,
})
mock('models/Consultation', { countDocuments: async () => 7, find: () => lean([{ createdAt: daysAgo(0) }, { createdAt: daysAgo(0) }, { createdAt: daysAgo(2) }, { createdAt: daysAgo(10) }]) })
mock('models/ChangeLog', { find: () => lean([{ _id: 'l1', action: 'update', entity: 'university', entityLabel: 'Trường A', actor: { email: 'a@x.y' }, createdAt: daysAgo(0) }]) })
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex')

const { summarize, TREND_DAYS } = require('../src/modules/dashboard/dashboard.service')
const { errorHandler } = require('../src/middlewares/error')
const app = express()
app.use('/api/admin/dashboard', require('../src/modules/dashboard/dashboard.routes'))
app.use(errorHandler)

let server
let base
test.before(async () => {
  server = app.listen(0, '127.0.0.1')
  await new Promise((r) => server.once('listening', r))
  base = `http://127.0.0.1:${server.address().port}/api/admin/dashboard`
})
test.after(() => server.close())
const tokenOf = (id) => ({ authorization: `Bearer ${jwt.sign({ sub: id }, process.env.JWT_SECRET)}` })

test('quyền: chưa đăng nhập 401, user thường 403, admin 200', async () => {
  assert.equal((await fetch(base)).status, 401)
  assert.equal((await fetch(base, { headers: tokenOf('u1') })).status, 403)
  const res = await fetch(base, { headers: tokenOf('admin1') })
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.universities.total, 3)
  assert.equal(body.majorCount, 42)
  assert.equal(body.recentChanges[0].actor, 'a@x.y')
})

test('summarize: đếm loại trường, độ đầy đủ dữ liệu, người dùng (bỏ tài khoản đã xóa)', () => {
  const s = summarize({ universities, majorCount: 42, users, consultationTotal: 7, recentConsultations: [], recentChanges: [], now })
  assert.deepEqual(s.universities.byType, { public: 1, private: 2, international: 0, other: 0 })
  assert.deepEqual(s.universities.byDataLevel, { 1: 1, 2: 1, 3: 1 })
  assert.equal(s.universities.vnuhcm, 1)
  assert.deepEqual(s.coverage, { majors: 2, tuition: 1, admissions: 2, verifiedForAI: 1, coordinates: 1, logo: 1 })
  assert.deepEqual(s.users, { total: 3, byRole: { user: 2, admin: 1, superadmin: 0 }, locked: 1, newLast30Days: 1 })
})

test('summarize: top yêu thích bỏ trường 0 lượt; xu hướng tư vấn 14 ngày theo giờ Việt Nam', () => {
  const recent = [{ createdAt: daysAgo(0) }, { createdAt: daysAgo(0) }, { createdAt: daysAgo(2) }, { createdAt: daysAgo(10) },
    { createdAt: new Date('2026-11-20T18:30:00Z') }] // 01:30 sáng 21/11 giờ VN -> tính vào ngày 21/11
  const s = summarize({ universities, majorCount: 0, users: [], consultationTotal: 9, recentConsultations: recent, recentChanges: [], now })
  assert.deepEqual(s.topFavorites.map((u) => [u.slug, u.favoriteCount]), [['b', 9], ['a', 5]])
  assert.equal(s.consultations.trend.length, TREND_DAYS)
  assert.deepEqual(s.consultations.trend.at(-1), { date: '2026-11-21', count: 3 })
  assert.equal(s.consultations.trend.at(-3).count, 1)
  assert.equal(s.consultations.last7Days, 4)
  assert.equal(s.consultations.total, 9)
})
