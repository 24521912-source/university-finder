const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { denyReason } = require('../src/utils/roles')
const v = require('../src/modules/accounts/accounts.validation')

const acc = (id, role, extra = {}) => ({ _id: id, role, ...extra })
const SUPER = acc('s1', 'superadmin')
const SUPER2 = acc('s2', 'superadmin')
const GRANTED = acc('g1', 'admin', { canManageAdmins: true })
const GRANTED2 = acc('g2', 'admin', { canManageAdmins: true })
const ADMIN = acc('a1', 'admin')
const ADMIN2 = acc('a2', 'admin')
const USER = acc('u1', 'user')
const allowed = (actor, target, action, payload) => denyReason(actor, target, action, payload) === null

test('không ai tự thao tác lên chính mình hoặc lên quản trị cấp cao', () => {
  for (const actor of [SUPER, GRANTED, ADMIN]) {
    for (const action of ['status', 'delete', 'role', 'permissions']) assert(!allowed(actor, actor, action, { role: 'user' }))
  }
  for (const actor of [SUPER, GRANTED, ADMIN]) assert(!allowed(actor, SUPER2, 'status'))
  assert(!allowed(USER, acc('u2', 'user'), 'status'))
})

test('admin thường: khóa/xóa user, không đụng admin, không nâng quyền', () => {
  assert(allowed(ADMIN, USER, 'status'))
  assert(allowed(ADMIN, USER, 'delete'))
  assert(!allowed(ADMIN, USER, 'role', { role: 'admin' }))
  assert(!allowed(ADMIN, ADMIN2, 'status'))
  assert(!allowed(ADMIN, ADMIN2, 'delete'))
  assert(!allowed(ADMIN, ADMIN2, 'role', { role: 'user' }))
  assert(!allowed(ADMIN, ADMIN2, 'permissions'))
})

test('admin được trao quyền: nâng user, hạ/khóa/xóa admin thường; không đụng admin cùng quyền, không trao quyền', () => {
  assert(allowed(GRANTED, USER, 'role', { role: 'admin' }))
  assert(allowed(GRANTED, ADMIN, 'role', { role: 'user' }))
  assert(allowed(GRANTED, ADMIN, 'status'))
  assert(allowed(GRANTED, ADMIN, 'delete'))
  assert(!allowed(GRANTED, GRANTED2, 'role', { role: 'user' }))
  assert(!allowed(GRANTED, GRANTED2, 'status'))
  assert(!allowed(GRANTED, ADMIN, 'permissions'))
  assert(!allowed(GRANTED, USER, 'role', { role: 'superadmin' }))
})

test('quản trị cấp cao: làm được mọi việc với admin/user; chỉ trao quyền cho admin', () => {
  for (const target of [USER, ADMIN, GRANTED]) {
    assert(allowed(SUPER, target, 'status'))
    assert(allowed(SUPER, target, 'delete'))
  }
  assert(allowed(SUPER, GRANTED, 'role', { role: 'user' }))
  assert(allowed(SUPER, ADMIN, 'permissions'))
  assert(!allowed(SUPER, USER, 'permissions'))
  assert(!allowed(SUPER, USER, 'role', { role: 'superadmin' }))
})

test('validation tạo tài khoản hộ và ID', () => {
  assert.equal(v.validateCreate({ fullName: 'Bà Lan', email: 'ba.lan@example.org', password: 'tam123' }), null)
  assert(v.validateCreate({ fullName: '', email: 'a@b.c', password: 'tam123' }))
  assert(v.validateCreate({ fullName: 'A', email: 'sai-email', password: 'tam123' }))
  assert(v.validateCreate({ fullName: 'A', email: 'a@b.c', password: '123' }))
  assert(v.validateId('../x'))
  assert(v.validateId({ $ne: '' }))
  assert.equal(v.validateId('a'.repeat(24)), null)
})

// ---- service với model giả trong RAM ----
const users = new Map()
const q = (value) => ({ select() { return this }, sort() { return this }, skip() { return this }, limit() { return this }, lean: async () => value })
const User = {
  exists: async ({ email }) => [...users.values()].some((u) => u.email === email),
  create: async (doc) => { const u = { _id: `n${users.size}`, createdAt: new Date(), ...doc }; users.set(u._id, u); return u },
  findOne: ({ _id }) => { const u = users.get(_id); return q(u && !u.deletedAt ? { ...u } : null) },
  findOneAndUpdate: ({ _id, role }, update) => {
    const u = users.get(_id)
    if (!u || u.role !== role || u.deletedAt) return q(null)
    Object.assign(u, update)
    return q({ ...u })
  },
}
const file = require.resolve(path.join(__dirname, '../src/models/User'))
require.cache[file] = { id: file, filename: file, loaded: true, exports: User }
const service = require('../src/modules/accounts/accounts.service')

test('service: tạo hộ luôn là user + cần đổi mật khẩu; hạ quyền thu luôn canManageAdmins; xóa mềm', async () => {
  for (const u of [SUPER, GRANTED, ADMIN, USER]) users.set(u._id, { ...u, email: `${u._id}@x.y`, fullName: u._id })
  const created = await service.create(ADMIN, { fullName: 'Bà Lan', email: 'BA.LAN@example.org', password: 'tam123', role: 'admin' })
  assert.equal(created.role, 'user')
  assert.equal(created.mustChangePassword, true)
  assert.equal(created.email, 'ba.lan@example.org')
  assert(!('passwordHash' in created))
  await assert.rejects(service.create(ADMIN, { fullName: 'X', email: 'ba.lan@example.org', password: 'tam123' }), (e) => e.status === 409)

  await assert.rejects(service.setRole(ADMIN, 'u1', { role: 'admin' }), (e) => e.status === 403)
  assert.equal((await service.setRole(GRANTED, 'u1', { role: 'admin' })).role, 'admin')
  await service.setPermissions(SUPER, 'u1', { canManageAdmins: true })
  const demoted = await service.setRole(SUPER, 'u1', { role: 'user' })
  assert.equal(demoted.canManageAdmins, false)

  assert.equal((await service.setStatus(ADMIN, 'u1', { status: 'locked' })).status, 'locked')
  const removed = await service.remove(ADMIN, 'u1')
  assert.equal(removed.deleted, true)
  assert(users.get('u1').deletedAt instanceof Date)
  await assert.rejects(service.setStatus(ADMIN, 'u1', { status: 'active' }), (e) => e.status === 404)
})
