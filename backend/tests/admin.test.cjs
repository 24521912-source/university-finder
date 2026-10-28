const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const crypto = require('node:crypto')
const jwt = require('jsonwebtoken')
const express = require('express')
const httpError = require('../src/utils/httpError')
const { errorHandler } = require('../src/middlewares/error')
const { parseArgs, promote } = require('../src/makeAdmin')
const { ObjectId } = require('mongoose').mongo
function load(relative, replacements, globals = {}) {
  const filename = path.join(__dirname, '../src', relative)
  const module = { exports: {} }
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), { module, exports: module.exports, require: name => name in replacements ? replacements[name] : require(require.resolve(name, { paths: [path.dirname(filename)] })), __dirname: path.dirname(filename), ...globals }, { filename })
  return module.exports
}
const modelMock = () => ({ find: () => { throw Error('Unexpected database access') }, countDocuments: () => Promise.resolve(0) })
const service = load('modules/admin/admin.service.js', { '../../models/University': modelMock(), '../../models/Major': modelMock(), '../../models/User': modelMock() })

test('Phân trang có giới hạn, tìm kiếm literal và từ chối query object', () => {
  assert.equal(service.options({ q: 'a.*[x]' }).regex, 'a\\.\\*\\[x\\]')
  for (const q of [{ page: '0' }, { limit: '101' }, { page: '1e9' }, { q: { $gt: '' } }, { q: 'x'.repeat(101) }, { limit: ['10'] }]) assert.throws(() => service.options(q))
})
test('AI metadata chỉ bốn phần cần thiết; tìm kiếm/phân trang không nới nguồn hoặc kéo thuật toán', async () => {
  const metadata = require('../src/modules/admin/aiSources')
  assert.deepEqual(Object.keys(metadata).sort(), ['ACADEMIC_YEAR', 'ADMISSION_SOURCES', 'SOURCES', 'UNCERTAIN_MAJORS'].sort())
  assert.equal(metadata.SOURCES['bach-khoa-tphcm'], undefined)
  assert.deepEqual(metadata.UNCERTAIN_MAJORS['khoa-hoc-tu-nhien-dhqg'], ['7480103', '7480104'])
  const data = await service.list['ai-data'](service.options({ q: 'van-lang', limit: '1' }))
  assert.equal(data.total, 1); assert.equal(data.items[0].slug, 'van-lang'); assert.equal(data.items[0].admission.year, 2026)
})
test('HTTP mọi API Admin: guest401, user403, claim admin nhưng database user403, admin200; không có write route', async () => {
  const secret = crypto.randomBytes(32).toString('hex')
  const roles = { regular: 'user', privileged: 'admin' }
  const middleware = load('middlewares/auth.js', { '../models/User': { findById: async id => roles[id] ? { id, role: roles[id] } : null } }, { process: { env: { JWT_SECRET: secret } } })
  const fakeService = { options: () => ({}), overview: async () => ({ universities: 0 }), list: Object.fromEntries(Object.keys(service.list).map(key => [key, async () => ({ items: [], total: 0 })])) }
  const controller = load('modules/admin/admin.controller.js', { './admin.service': fakeService })
  const router = load('modules/admin/admin.routes.js', { '../../middlewares/auth': middleware, './admin.service': fakeService, './admin.controller': controller })
  const app = express(); app.use('/api/admin', router); app.use(errorHandler)
  const server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r))
  const root = `http://127.0.0.1:${server.address().port}/api/admin`
  const token = (sub, role) => jwt.sign({ sub, role }, secret, { expiresIn: '1m' })
  try {
    for (const endpoint of ['overview', ...Object.keys(fakeService.list)]) {
      for (const [authorization, status] of [[null, 401], ['Bearer invalid', 401], [`Bearer ${token('regular', 'user')}`, 403], [`Bearer ${token('regular', 'admin')}`, 403], [`Bearer ${token('privileged', 'admin')}`, 200], [`Bearer ${token('deleted', 'admin')}`, 401]]) {
        assert.equal((await fetch(`${root}/${endpoint}`, { headers: authorization ? { authorization } : {} })).status, status, endpoint)
      }
    }
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) assert.equal((await fetch(root + '/users', { method, headers: { authorization: `Bearer ${token('privileged', 'admin')}` } })).status, 404)
  } finally { await new Promise(r => server.close(r)) }
})
test('Danh sách User dùng projection whitelist, không passwordHash/token/favorites', async () => {
  let projection, limit, skip
  const User = { countDocuments: async () => 3, find: () => ({ select: p => { projection = p; return { sort: () => ({ skip: n => { skip = n; return { limit: n => { limit = n; return { lean: async () => [] } } } } }) } } }) }
  const s = load('modules/admin/admin.service.js', { '../../models/University': modelMock(), '../../models/Major': modelMock(), '../../models/User': User })
  const data = await s.list.users(s.options({ page: '2', limit: '10' }))
  assert.equal(projection, 'fullName email role createdAt'); assert.equal(limit, 10); assert.equal(skip, 10); assert.equal(data.total, 3)
})
test('Script cấp quyền: mặc định dry-run, không update; apply đòi email và ID', async () => {
  const id = new ObjectId(), user = { _id: id, email: 'test@example.org', role: 'user', updatedAt: new Date() }
  let writes = 0
  const collection = { findOne: async () => user, updateOne: async () => { writes++; return { acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 } } }
  const review = await promote(collection, parseArgs([user.email]))
  assert.equal(review.mode, 'dry-run'); assert.equal(review.before, 'user'); assert.equal(writes, 0)
  for (const flags of [['--apply'], ['--apply', '--confirm-email', 'other@example.org', '--expect-id', id.toHexString()], ['--unknown']]) assert.throws(() => parseArgs([user.email, ...flags]))
  const options = parseArgs([user.email, '--apply', '--confirm-email', user.email, '--expect-id', id.toHexString()])
  await promote(collection, options); assert.equal(writes, 1)
})
test('Script: sai ID, role đổi, không có tài khoản hoặc CAS không khớp đều dừng, không retry/upsert', async () => {
  const id = new ObjectId(), options = { email: 'test@example.org', apply: true, expectedId: id.toHexString() }
  for (const user of [null, { _id: new ObjectId(), role: 'user' }, { _id: id, role: 'admin' }]) await assert.rejects(promote({ findOne: async () => user, updateOne: () => { throw Error('must not write') } }, options))
  let writes = 0
  await assert.rejects(promote({ findOne: async () => ({ _id: id, role: 'user', email: options.email, updatedAt: new Date(0) }), updateOne: async (filter, update, opts) => { writes++; assert.equal(filter.role, 'user'); assert.equal(filter.updatedAt.getTime(), 0); assert.equal(opts.upsert, false); return { acknowledged: true, matchedCount: 0, modifiedCount: 0, upsertedCount: 0 } } }, options))
  assert.equal(writes, 1)
})
test('JWT sai hạn và chữ ký bị từ chối trước truy vấn tài khoản', async () => {
  const middleware = load('middlewares/auth.js', { '../models/User': { findById: () => { throw Error('must not query') } } }, { process: { env: { JWT_SECRET: 'test-only-secret' } } })
  for (const token of [jwt.sign({ sub: 'x' }, 'other-secret'), jwt.sign({ sub: 'x' }, 'test-only-secret', { expiresIn: -1 })]) await assert.rejects(middleware.requireAuth({ headers: { authorization: 'Bearer ' + token } }, {}, () => {}), e => e.status === 401)
})
