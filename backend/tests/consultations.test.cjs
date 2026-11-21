const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const crypto = require('node:crypto')
const express = require('express')
const jwt = require('jsonwebtoken')

// Model giả trong RAM: không kết nối Atlas.
const oid = () => crypto.randomBytes(12).toString('hex')
const schools = [
  { _id: oid(), slug: 'truong-a', name: 'Trường A', shortName: 'A' },
  { _id: oid(), slug: 'truong-b', name: 'Trường B', shortName: 'B' },
]
const users = new Map([['user1', { _id: 'user1', role: 'user' }], ['user2', { _id: 'user2', role: 'user' }]])
let docs = []
let clock = 0

// Query giả hỗ trợ chuỗi sort / skip / limit / select / populate / lean như mongoose.
function query(rows) {
  let out = rows
  let populate = false
  return {
    sort() { out = [...out].sort((a, b) => b.createdAt - a.createdAt); return this },
    skip(n) { out = out.slice(n); return this },
    limit(n) { out = out.slice(0, n); return this },
    select() { return this },
    populate() { populate = true; return this },
    lean: async () => structuredClone(out).map((d) => (populate
      ? { ...d, results: d.results.map((r) => ({ ...r, university: schools.find((s) => s._id === r.university) || null })) }
      : d)),
  }
}

const Consultation = {
  find: ({ user }) => query(docs.filter((d) => d.user === user)),
  create: async (doc) => {
    const d = { _id: oid(), createdAt: new Date(++clock), ...structuredClone(doc) }
    docs.push(d)
    return { toObject: () => structuredClone(d) }
  },
  deleteMany: async ({ _id, user }) => {
    const before = docs.length
    docs = docs.filter((d) => !(d.user === user && _id.$in.includes(d._id)))
    return { deletedCount: before - docs.length }
  },
  findOneAndDelete: ({ _id, user }) => {
    const d = docs.find((x) => x._id === _id && x.user === user) || null
    docs = docs.filter((x) => x !== d)
    return { lean: async () => d }
  },
}
const University = {
  find: ({ slug }) => ({ select() { return this }, lean: async () => schools.filter((s) => slug.$in.includes(s.slug)) }),
}
const User = { findById: async (id) => users.get(id) || null }

function mock(rel, exports) {
  const file = require.resolve(path.join(__dirname, '../src', rel))
  require.cache[file] = { id: file, filename: file, loaded: true, exports }
}
mock('models/Consultation', Consultation)
mock('models/University', University)
mock('models/User', User)
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex')

const { errorHandler } = require('../src/middlewares/error')
const { MAX_PER_USER } = require('../src/modules/consultations/consultations.service')
const app = express()
app.use(express.json())
app.use('/api/consultations', require('../src/modules/consultations/consultations.routes'))
app.use(errorHandler)

let server
let base
test.before(async () => {
  server = app.listen(0, '127.0.0.1')
  await new Promise((r) => server.once('listening', r))
  base = `http://127.0.0.1:${server.address().port}/api/consultations`
})
test.after(() => server.close())
test.beforeEach(() => { docs = [] })

const tokenOf = (id) => ({ authorization: `Bearer ${jwt.sign({ sub: id }, process.env.JWT_SECRET)}` })
const call = (method, url = '', body, headers = tokenOf('user1')) => fetch(`${base}${url}`, {
  method,
  headers: { ...headers, 'content-type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
})

const valid = () => ({
  criteria: { majorCode: '7480201', majorLabel: 'Công nghệ thông tin', method: 'high_school_exam', combination: 'A00', score: 25.5, maxTuition: 40000000, district: 'any', institutionType: 'any', vnuhcm: 'any' },
  results: [
    { slug: 'truong-a', major: 'Công nghệ thông tin', matchScore: 92.5, coverage: 75, reasons: ['Đúng ngành', 'Học phí trong ngân sách'] },
    { slug: 'truong-b', major: 'Khoa học máy tính', matchScore: 80, coverage: 60, reasons: [] },
  ],
})

test('chưa đăng nhập 401, không ghi', async () => {
  assert.equal((await call('GET', '', undefined, {})).status, 401)
  assert.equal((await call('POST', '', valid(), {})).status, 401)
  assert.equal(docs.length, 0)
})

test('lưu rồi đọc lại: trả tên trường, bỏ khu vực "any", giữ thứ tự kết quả', async () => {
  const res = await call('POST', '', valid())
  assert.equal(res.status, 201)
  const saved = await res.json()
  assert.equal(saved.results[0].name, 'Trường A')
  assert.equal(saved.criteria.district, undefined)

  const list = await (await call('GET')).json()
  assert.equal(list.length, 1)
  assert.deepEqual(list[0].results.map((r) => r.slug), ['truong-a', 'truong-b'])
  assert.equal(list[0].results[0].matchScore, 92.5)
  assert.equal(list[0].criteria.majorLabel, 'Công nghệ thông tin')
})

test('dữ liệu sai 400: điểm ngoài thang, slug sai, trường không tồn tại, danh sách rỗng', async () => {
  const cases = [
    (b) => { b.criteria.score = 31 },
    (b) => { b.criteria.method = 'transcript' },
    (b) => { b.criteria.majorCode = '<script>' },
    (b) => { b.results[0].slug = 'Sai_Slug' },
    (b) => { b.results[0].slug = 'khong-co' },
    (b) => { b.results[0].matchScore = 101 },
    (b) => { b.results = [] },
    (b) => { b.results = Array.from({ length: 11 }, () => b.results[0]) },
  ]
  for (const change of cases) {
    const body = valid()
    change(body)
    assert.equal((await call('POST', '', body)).status, 400, JSON.stringify(body).slice(0, 120))
  }
  assert.equal(docs.length, 0)
})

test('ĐGNL thang 1200 hợp lệ, không lưu tổ hợp; mã ngành có chữ (75202A1) hợp lệ', async () => {
  const body = valid()
  Object.assign(body.criteria, { method: 'competency_assessment', score: 950, majorCode: '75202A1' })
  const saved = await (await call('POST', '', body)).json()
  assert.equal(saved.criteria.combination, undefined)
  assert.equal(saved.criteria.score, 950)
})

test(`chỉ giữ ${MAX_PER_USER} lần gần nhất mỗi tài khoản`, async () => {
  for (let i = 0; i < MAX_PER_USER + 2; i++) await call('POST', '', valid())
  await call('POST', '', valid(), tokenOf('user2'))
  assert.equal(docs.filter((d) => d.user === 'user1').length, MAX_PER_USER)
  assert.equal(docs.filter((d) => d.user === 'user2').length, 1)
})

test('xóa: chỉ xóa được của mình; id sai 400; không có 404', async () => {
  const mine = await (await call('POST', '', valid())).json()
  assert.equal((await call('DELETE', `/${mine.id}`, undefined, tokenOf('user2'))).status, 404)
  assert.equal(docs.length, 1)
  assert.equal((await call('DELETE', '/abc')).status, 400)
  assert.equal((await call('DELETE', `/${mine.id}`)).status, 200)
  assert.equal(docs.length, 0)
})

test('trường bị admin xóa sau đó thì không hiện trong lịch sử', async () => {
  await call('POST', '', valid())
  const removed = schools.pop()
  try {
    const list = await (await call('GET')).json()
    assert.deepEqual(list[0].results.map((r) => r.slug), ['truong-a'])
  } finally {
    schools.push(removed)
  }
})
