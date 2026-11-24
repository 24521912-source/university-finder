const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const crypto = require('node:crypto')
const jwt = require('jsonwebtoken')
const express = require('express')
const { validateRegister } = require('../src/modules/auth/auth.validation')
const { errorHandler } = require('../src/middlewares/error')

function load(relative, replacements, globals = {}) {
  const filename = path.join(__dirname, '../src', relative)
  const module = { exports: {} }
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), { module, require: name => name in replacements ? replacements[name] : require(require.resolve(name, { paths: [path.dirname(filename)] })), ...globals }, { filename })
  return module.exports
}
const form = { fullName: 'Test', email: 'test@example.org', password: 'test-only-password' }

test('Đăng ký công khai: user hợp lệ, admin/null/object/role lạ bị chặn trước ghi', async () => {
  assert.equal(validateRegister(form), null)
  assert.equal(validateRegister({ ...form, role: 'user' }), null)
  const service = load('modules/auth/auth.service.js', { '../../models/User': { exists: () => { throw Error('Không được truy vấn hoặc ghi') } } })
  for (const role of ['admin', 'owner', null, { $ne: 'user' }]) {
    assert(validateRegister({ ...form, role }))
    await assert.rejects(service.register({ ...form, role }), error => error.status === 400)
  }
})
test('Đăng ký whitelist field, luôn role user và không trả passwordHash', async () => {
  let created
  const service = load('modules/auth/auth.service.js', {
    '../../models/User': { exists: async () => false, create: async payload => { created = payload; return { ...payload, id: 'test-id', favorites: [] } } },
    bcryptjs: { hash: async () => 'test-only-hash' }, jsonwebtoken: { sign: () => 'test-only-token' },
  }, { process: { env: {} } })
  const session = await service.register({ ...form, email: 'TEST@example.org', passwordHash: 'injected', favorites: ['injected'] })
  assert.deepEqual(Object.keys(created).sort(), ['email', 'fullName', 'passwordHash', 'role'])
  assert.equal(created.role, 'user'); assert.equal(created.email, 'test@example.org')
  assert(!('passwordHash' in session.user)); assert.equal(session.user.role, 'user')
})
test('Email đã đăng ký trả 409, không tạo tài khoản', async () => {
  const service = load('modules/auth/auth.service.js', { '../../models/User': { exists: async () => true, create: () => { throw Error('Không được ghi') } } })
  await assert.rejects(service.register(form), error => error.status === 409)
})
test('Login dùng role của tài khoản, không dùng role do client gửi', async () => {
  const secret = crypto.randomBytes(32).toString('hex')
  for (const role of ['user', 'admin']) {
    const account = { id: 'test-id', email: form.email, role, fullName: 'Test', favorites: [], passwordHash: 'test-only-hash' }
    const service = load('modules/auth/auth.service.js', { '../../models/User': { findOne: () => ({ select: async () => account }) }, bcryptjs: { compare: async () => true } }, { process: { env: { JWT_SECRET: secret } } })
    const session = await service.login({ ...form, role: role === 'user' ? 'admin' : 'user' })
    assert.equal(session.user.role, role); assert.equal(jwt.verify(session.token, secret).role, role); assert(!('passwordHash' in session.user))
  }
})
test('Login sai mật khẩu trả 401', async () => {
  const service = load('modules/auth/auth.service.js', { '../../models/User': { findOne: () => ({ select: async () => ({ passwordHash: 'test-only-hash' }) }) }, bcryptjs: { compare: async () => false } })
  await assert.rejects(service.login(form), error => error.status === 401)
})
test('requireAdmin HTTP: guest401, user403, claim admin nhưng model user403, admin200', async () => {
  const secret = crypto.randomBytes(32).toString('hex')
  const roles = { ordinary: 'user', privileged: 'admin' }
  const auth = load('middlewares/auth.js', { '../models/User': { findById: async id => roles[id] ? { id, role: roles[id] } : null } }, { process: { env: { JWT_SECRET: secret } } })
  const app = express(); app.get('/protected', auth.requireAdmin, (req, res) => res.json({ role: req.user.role })); app.use(errorHandler)
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve))
  const token = (sub, role) => jwt.sign({ sub, role }, secret, { expiresIn: '1m' })
  try {
    for (const [bearer, expected] of [[null, 401], ['invalid', 401], [token('ordinary', 'user'), 403], [token('ordinary', 'admin'), 403], [token('privileged', 'admin'), 200], [token('missing', 'admin'), 401]]) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/protected`, { headers: bearer ? { Authorization: 'Bearer ' + bearer } : {} })
      assert.equal(response.status, expected)
    }
  } finally { await new Promise(resolve => server.close(resolve)) }
})
test('JWT sai chữ ký/hết hạn bị chặn trước khi đọc tài khoản', async () => {
  const secret = crypto.randomBytes(32).toString('hex')
  const auth = load('middlewares/auth.js', { '../models/User': { findById: () => { throw Error('Không được truy vấn') } } }, { process: { env: { JWT_SECRET: secret } } })
  for (const token of [jwt.sign({ sub: 'x' }, crypto.randomBytes(32).toString('hex')), jwt.sign({ sub: 'x' }, secret, { expiresIn: -1 })]) {
    await assert.rejects(auth.requireAuth({ headers: { authorization: 'Bearer ' + token } }, {}, () => {}), error => error.status === 401)
  }
})

const { validateProfile, validatePasswordChange } = require('../src/modules/auth/auth.validation')

test('Sửa hồ sơ: chỉ ghi fullName đã trim, bỏ qua email/role/favorites client gửi', async () => {
  assert(validateProfile({}))
  assert(validateProfile({ fullName: '   ' }))
  assert(validateProfile({ fullName: { $ne: '' } }))
  assert(validateProfile({ fullName: 'a'.repeat(101) }))
  assert.equal(validateProfile({ fullName: 'Nguyễn Văn A' }), null)
  let update
  const service = load('modules/auth/auth.service.js', { '../../models/User': {
    findByIdAndUpdate: async (id, payload) => { update = payload; return { id, fullName: payload.fullName, email: 'a@b.c', role: 'user', favorites: [] } },
  } })
  const user = await service.updateProfile('u1', { fullName: '  Tên mới  ', email: 'hack@x.y', role: 'admin', favorites: ['x'] })
  assert.deepEqual(Object.keys(update), ['fullName'])
  assert.equal(user.fullName, 'Tên mới')
  assert.equal(user.role, 'user')
  assert(!('passwordHash' in user))
})

test('Đổi mật khẩu: sai mật khẩu hiện tại trả 400 và không ghi; đúng thì lưu hash mới', async () => {
  assert(validatePasswordChange({ currentPassword: '', newPassword: 'abcdef' }))
  assert(validatePasswordChange({ currentPassword: 'old-pass', newPassword: '123' }))
  assert(validatePasswordChange({ currentPassword: 'same-pass', newPassword: 'same-pass' }))
  assert(validatePasswordChange({ currentPassword: { $ne: '' }, newPassword: 'abcdef' }))
  assert.equal(validatePasswordChange({ currentPassword: 'old-pass', newPassword: 'new-pass' }), null)
  let saved = 0
  const account = { passwordHash: 'old-hash', save: async () => { saved++ } }
  const make = (match) => load('modules/auth/auth.service.js', {
    '../../models/User': { findById: () => ({ select: async () => account }) },
    bcryptjs: { compare: async () => match, hash: async () => 'new-hash' },
  })
  await assert.rejects(make(false).changePassword('u1', { currentPassword: 'wrong', newPassword: 'new-pass' }), (e) => e.status === 400)
  assert.equal(saved, 0)
  assert.equal(account.passwordHash, 'old-hash')
  await make(true).changePassword('u1', { currentPassword: 'old-pass', newPassword: 'new-pass' })
  assert.equal(saved, 1)
  assert.equal(account.passwordHash, 'new-hash')
})

test('Tài khoản bị khóa: login 403, token cũ bị chặn ngay; đã xóa mềm: 401', async () => {
  const make = (account) => load('modules/auth/auth.service.js', { '../../models/User': { findOne: () => ({ select: async () => account }) }, bcryptjs: { compare: async () => true } }, { process: { env: { JWT_SECRET: 'x' } } })
  await assert.rejects(make({ id: 'a', status: 'locked', role: 'user' }).login(form), (e) => e.status === 403)
  await assert.rejects(make({ id: 'a', deletedAt: new Date(), role: 'user' }).login(form), (e) => e.status === 401)
  const secret = crypto.randomBytes(32).toString('hex')
  for (const account of [{ id: 'a', status: 'locked' }, { id: 'a', deletedAt: new Date() }]) {
    const auth = load('middlewares/auth.js', { '../models/User': { findById: async () => account } }, { process: { env: { JWT_SECRET: secret } } })
    await assert.rejects(auth.requireAuth({ headers: { authorization: 'Bearer ' + jwt.sign({ sub: 'a' }, secret) } }, {}, () => {}), (e) => e.status === 401)
  }
})
