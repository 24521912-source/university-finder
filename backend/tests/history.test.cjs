const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const crypto = require('node:crypto')
const express = require('express')
const jwt = require('jsonwebtoken')

// Model giả trong RAM: không kết nối Atlas.
const unis = new Map()
const users = new Map()
const logs = new Map()
const lean = (v) => ({ select() { return this }, sort() { return this }, skip() { return this }, limit() { return this }, lean: async () => (v ? structuredClone(v) : null) })

const University = {
  findById: (id) => lean(unis.get(String(id))),
  replaceOne: async ({ _id }, doc) => { unis.set(String(_id), structuredClone(doc)); return { modifiedCount: 1 } },
  create: async (doc) => { unis.set(String(doc._id), structuredClone(doc)); return { toObject: () => structuredClone(doc) } },
  deleteOne: async ({ _id }) => { unis.delete(String(_id)); return { deletedCount: 1 } },
}
const User = {
  findById: (id) => Object.assign(Promise.resolve(users.get(String(id)) || null), lean(users.get(String(id)))),
  findOneAndUpdate: ({ _id, role }, update) => {
    const u = users.get(String(_id))
    if (!u || u.role !== role) return lean(null)
    Object.assign(u, update)
    return lean(u)
  },
}
let seq = 0
const ChangeLog = {
  create: async (doc) => { const d = { _id: `log${++seq}`, ...structuredClone(doc) }; logs.set(d._id, d); return d },
  findById: (id) => lean(logs.get(id)),
  findByIdAndDelete: (id) => { const d = logs.get(id); logs.delete(id); return lean(d) },
  find: () => lean([...logs.values()]),
  countDocuments: async () => logs.size,
}
function mock(rel, exports) {
  const file = require.resolve(path.join(__dirname, '../src', rel))
  require.cache[file] = { id: file, filename: file, loaded: true, exports }
}
mock('models/University', University)
mock('models/User', User)
mock('models/ChangeLog', ChangeLog)
const service = require('../src/modules/history/history.service')
const { record } = require('../src/modules/history/history.recorder')

const SUPER = { _id: 's1', role: 'superadmin', email: 's@x.y' }
const ADMIN = { _id: 'a1', role: 'admin', email: 'a@x.y' }

test('trường: khôi phục bản sửa, bản đã xóa, và "tạo mới" (= xóa)', async () => {
  const v1 = { _id: 'u1', slug: 'demo', name: 'Demo v1', admissions: [{ _id: 'r1', score: 20 }] }
  const v2 = { ...v1, name: 'Demo v2' }
  unis.set('u1', structuredClone(v2))
  const upd = await record({ actor: ADMIN, action: 'update', entity: 'university', entityId: 'u1', entityLabel: 'Demo', before: v1, after: v2 })
  assert.deepEqual(upd.changedFields, ['name'])
  await service.restore(ADMIN, upd._id)
  assert.equal(unis.get('u1').name, 'Demo v1')
  assert.equal(unis.get('u1').admissions[0]._id, 'r1', 'giữ nguyên _id dòng con')

  unis.delete('u1')
  const del = await record({ actor: ADMIN, action: 'delete', entity: 'university', entityId: 'u1', before: v1 })
  await service.restore(ADMIN, del._id)
  assert.equal(unis.get('u1').name, 'Demo v1')

  const created = await record({ actor: ADMIN, action: 'create', entity: 'university', entityId: 'u1', after: v1 })
  await service.restore(ADMIN, created._id)
  assert(!unis.has('u1'))
  await assert.rejects(service.restore(ADMIN, created._id), (e) => e.status === 409)

  const restoreLogs = [...logs.values()].filter((l) => l.action === 'restore')
  assert.equal(restoreLogs.length, 3, 'mỗi lần khôi phục cũng được ghi lịch sử')
  assert(restoreLogs.every((l) => l.restoredFrom))
})

test('tài khoản: khôi phục theo đúng quyền, không đụng quản trị cấp cao / chính mình', async () => {
  users.set('u2', { _id: 'u2', email: 'u2@x.y', role: 'user', status: 'active', deletedAt: null, canManageAdmins: false })
  // Trước đó u2 là admin rồi bị hạ -> khôi phục = nâng lại admin: admin thường không được, superadmin được.
  const demote = await record({ actor: SUPER, action: 'role', entity: 'user', entityId: 'u2',
    before: { role: 'admin', status: 'active', deletedAt: null, canManageAdmins: false }, after: users.get('u2') })
  await assert.rejects(service.restore(ADMIN, demote._id), (e) => e.status === 403)
  await service.restore(SUPER, demote._id)
  assert.equal(users.get('u2').role, 'admin')

  // Bỏ xóa mềm: admin thường được với user thường.
  users.set('u3', { _id: 'u3', email: 'u3@x.y', role: 'user', status: 'active', deletedAt: new Date().toISOString(), canManageAdmins: false })
  const del = await record({ actor: ADMIN, action: 'delete', entity: 'user', entityId: 'u3',
    before: { role: 'user', status: 'active', deletedAt: null }, after: users.get('u3') })
  await service.restore(ADMIN, del._id)
  assert.equal(users.get('u3').deletedAt, null)

  // Không khôi phục thành superadmin; không tự khôi phục chính mình.
  const bad = await record({ actor: SUPER, action: 'role', entity: 'user', entityId: 'u3', before: { role: 'superadmin' }, after: users.get('u3') })
  await assert.rejects(service.restore(SUPER, bad._id), (e) => e.status === 403)
  users.set('a1', { ...ADMIN, status: 'active', deletedAt: null })
  const self = await record({ actor: SUPER, action: 'status', entity: 'user', entityId: 'a1', before: { role: 'admin', status: 'locked' }, after: users.get('a1') })
  await assert.rejects(service.restore(ADMIN, self._id), (e) => e.status === 403)
})

test('route: xóa dòng lịch sử chỉ quản trị cấp cao; chưa đăng nhập 401', async () => {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex')
  users.set('s1', { ...SUPER, status: 'active', deletedAt: null })
  const { errorHandler } = require('../src/middlewares/error')
  const app = express()
  app.use('/h', require('../src/modules/history/history.routes'))
  app.use(errorHandler)
  const server = app.listen(0, '127.0.0.1')
  await new Promise((r) => server.once('listening', r))
  const id = [...logs.keys()][0].padEnd(24, '0').replace(/[^a-f0-9]/g, 'a')
  const url = `http://127.0.0.1:${server.address().port}/h/${id}`
  const tok = (sub) => ({ authorization: `Bearer ${jwt.sign({ sub }, process.env.JWT_SECRET)}` })
  try {
    assert.equal((await fetch(url, { method: 'DELETE' })).status, 401)
    assert.equal((await fetch(url, { method: 'DELETE', headers: tok('a1') })).status, 403)
    assert.equal((await fetch(url, { method: 'DELETE', headers: tok('s1') })).status, 404, 'superadmin qua được kiểm tra quyền')
  } finally {
    await new Promise((r) => server.close(r))
  }
})
