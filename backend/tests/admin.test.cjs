const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const express = require('express')
const jwt = require('jsonwebtoken')

// Model giả trong RAM: không kết nối Atlas, không ghi dữ liệu thật.
const store = new Map()
const users = new Map()
const MAJORS = ['7480201', '7340101']
const query = (value) => ({ select() { return this }, sort() { return this }, skip() { return this }, limit() { return this }, lean: async () => value })

const University = {
  find: () => query([...store.values()]),
  countDocuments: async () => store.size,
  findOne: ({ slug }) => query(store.get(slug) || null),
  create: async (data) => {
    if (store.has(data.slug)) throw Object.assign(new Error('dup'), { code: 11000 })
    store.set(data.slug, { ...data })
    return { toObject: () => store.get(data.slug) }
  },
  findOneAndUpdate: ({ slug }, { $set }) => {
    const next = { ...store.get(slug), ...$set }
    store.delete(slug)
    store.set(next.slug, next)
    return query(next)
  },
  findOneAndDelete: ({ slug }) => { const u = store.get(slug); store.delete(slug); return query(u || null) },
}
const Major = {
  distinct: async (field, { code: { $in } }) => $in.filter((c) => MAJORS.includes(c)),
  find: () => query(MAJORS.map((code) => ({ code, name: code }))),
}
const User = { findById: async (id) => users.get(id) || null }

function mock(rel, exports) {
  const file = require.resolve(path.join(__dirname, '../src', rel))
  require.cache[file] = { id: file, filename: file, loaded: true, exports }
}
mock('models/University', University)
mock('models/Major', Major)
mock('models/User', User)
process.env.JWT_SECRET = require('node:crypto').randomBytes(32).toString('hex')

const { errorHandler } = require('../src/middlewares/error')
const app = express()
app.use(express.json())
app.use('/api/admin', require('../src/modules/admin/admin.routes'))
app.use(errorHandler)

users.set('admin1', { _id: 'admin1', role: 'admin' })
users.set('user1', { _id: 'user1', role: 'user' })
const token = (id) => `Bearer ${jwt.sign({ sub: id }, process.env.JWT_SECRET)}`

let base
let server
test.before(async () => {
  server = app.listen(0, '127.0.0.1')
  await new Promise((r) => server.once('listening', r))
  base = `http://127.0.0.1:${server.address().port}/api/admin`
})
test.after(() => server.close())

const call = (method, url, { auth, body } = {}) => fetch(base + url, {
  method,
  headers: { 'content-type': 'application/json', ...(auth ? { authorization: auth } : {}) },
  body: body && JSON.stringify(body),
})

test('chưa đăng nhập 401, user thường 403', async () => {
  assert.equal((await call('GET', '/universities')).status, 401)
  assert.equal((await call('GET', '/universities', { auth: token('user1') })).status, 403)
  assert.equal((await call('POST', '/universities', { auth: token('user1'), body: { slug: 'x', name: 'x' } })).status, 403)
  assert.equal(store.size, 0)
})

test('admin thêm, sửa, xóa trường; chỉ ghi field cho phép', async () => {
  const auth = token('admin1')
  let res = await call('POST', '/universities', { auth, body: {
    slug: 'demo-school', name: 'Demo', institutionType: 'public', favoriteCount: 999, role: 'admin',
    majors: [{ code: '7480201', name: 'CNTT' }],
  } })
  assert.equal(res.status, 201)
  assert.equal(store.get('demo-school').favoriteCount, undefined)
  assert.equal(store.get('demo-school').role, undefined)

  res = await call('PUT', '/universities/demo-school', { auth, body: {
    name: 'Demo mới',
    tuition: [{ academicYear: '2026-2027', majorCode: '7480201', amountMin: 1, unit: 'year' }],
  } })
  assert.equal(res.status, 200)
  assert.equal(store.get('demo-school').name, 'Demo mới')
  assert.equal(store.get('demo-school').majors.length, 1)

  const list = await (await call('GET', '/universities?q=demo', { auth })).json()
  assert.equal(list.total, 1)
  assert.equal(list.items[0].majorCount, 1)

  assert.equal((await call('DELETE', '/universities/demo-school', { auth })).status, 200)
  assert.equal(store.size, 0)
  assert.equal((await call('DELETE', '/universities/demo-school', { auth })).status, 404)
})

test('từ chối mã ngành lạ, học phí trỏ ngành không có, slug sai', async () => {
  const auth = token('admin1')
  let res = await call('POST', '/universities', { auth, body: { slug: 'a-b', name: 'A', majors: [{ code: '0000000', name: '?' }] } })
  assert.equal(res.status, 400)
  res = await call('POST', '/universities', { auth, body: {
    slug: 'a-b', name: 'A', majors: [{ code: '7480201', name: 'CNTT' }],
    admissions: [{ year: 2026, method: 'high_school_exam', majorCode: '7340101', score: 20, scale: 30 }],
  } })
  assert.equal(res.status, 400)
  assert.equal((await call('POST', '/universities', { auth, body: { slug: 'Sai Slug', name: 'A' } })).status, 400)
  assert.equal((await call('GET', '/universities/..%2Fx', { auth })).status, 400)
  assert.equal(store.size, 0)
})
