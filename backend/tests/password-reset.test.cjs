const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const crypto = require('node:crypto')
const jwt = require('jsonwebtoken')
const express = require('express')
const { validateForgotPassword, validateResetPassword } = require('../src/modules/auth/auth.validation')
const { errorHandler } = require('../src/middlewares/error')

function load(relative, replacements, globals = {}) {
  const filename = path.join(__dirname, '../src', relative)
  const module = { exports: {} }
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), { module, require: name => name in replacements ? replacements[name] : require(require.resolve(name, { paths: [path.dirname(filename)] })), ...globals }, { filename })
  return module.exports
}
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex')
const NOW = new Date('2026-11-22T08:00:00Z')
const TOKEN = 'ab'.repeat(32)
const quietConsole = { info() {}, error() {}, log() {} }

// Tài khoản giả: findOne trả về bản ghi (hoặc null), ghi nhận các lần save.
function fakeUsers(account) {
  const calls = { filters: [], saves: [] }
  const User = {
    findOne: (filter) => {
      calls.filters.push(filter)
      return { select: async () => account }
    },
  }
  if (account) account.save = async () => { calls.saves.push({ ...account }) }
  return { User, calls }
}

function makeService({ account, canSend = true, send, env = { APP_URL: 'https://unimatch.example/' } }) {
  const { User, calls } = fakeUsers(account)
  const mails = []
  const service = load('modules/auth/passwordReset.service.js', {
    '../../models/User': User,
    '../../utils/mailer': { canSend: () => canSend, sendMail: send || (async (mail) => { mails.push(mail) }) },
    './auth.service': { createSession: (user) => ({ token: 'session-token', user: { id: user.id, email: user.email } }) },
    bcryptjs: { hash: async (value) => 'hash:' + value },
  }, { process: { env }, console: quietConsole })
  return { service, calls, mails }
}

test('Validation quên / đặt lại mật khẩu chặn kiểu lạ và mã sai định dạng', () => {
  for (const email of [undefined, '', 'abc', { $ne: '' }, ['a@b.c']]) assert(validateForgotPassword({ email }))
  assert.equal(validateForgotPassword({ email: ' Test@Example.org ' }), null)
  for (const token of [undefined, 'abc', { $ne: '' }, 'AB'.repeat(32), TOKEN + '0']) assert(validateResetPassword({ token, password: 'new-pass' }))
  assert(validateResetPassword({ token: TOKEN, password: '123' }))
  assert(validateResetPassword({ token: TOKEN, password: { $ne: '' } }))
  assert.equal(validateResetPassword({ token: TOKEN, password: 'new-pass' }), null)
})

test('Gửi link: chỉ lưu hash của mã, hết hạn sau 30 phút, link chứa mã gốc', async () => {
  const account = { id: 'u1', email: 'test@example.org', fullName: 'Nguyễn <b>A</b>', status: 'active', deletedAt: null }
  const { service, calls, mails } = makeService({ account })
  await service.requestReset({ email: '  TEST@example.org ' }, NOW)

  assert.equal(JSON.stringify(calls.filters), JSON.stringify([{ email: 'test@example.org' }]))
  assert.equal(calls.saves.length, 1)
  assert.equal(mails.length, 1)
  assert.equal(mails[0].to, 'test@example.org')
  const token = mails[0].text.match(/https:\/\/unimatch\.example\/dat-lai-mat-khau\?token=([0-9a-f]{64})/)[1]
  assert.equal(account.resetTokenHash, sha256(token))
  assert.notEqual(account.resetTokenHash, token)
  assert.equal(account.resetTokenExpiresAt.getTime() - NOW.getTime(), 30 * 60 * 1000)
  assert(mails[0].html.includes('Nguyễn &#60;b&#62;A&#60;/b&#62;'), 'tên trong HTML phải được escape')
})

test('Email chưa đăng ký, tài khoản khóa hoặc đã xóa: không gửi, vẫn trả về bình thường', async () => {
  for (const account of [null, { email: 'a@b.c', status: 'locked' }, { email: 'a@b.c', status: 'active', deletedAt: new Date() }]) {
    const { service, calls, mails } = makeService({ account })
    await service.requestReset({ email: 'a@b.c' }, NOW)
    assert.equal(mails.length, 0)
    assert.equal(calls.saves.length, 0)
  }
})

test('Bấm gửi lại trong vòng 1 phút thì bỏ qua, sau 1 phút thì gửi mã mới', async () => {
  const recent = { email: 'a@b.c', status: 'active', resetRequestedAt: new Date(NOW - 10 * 1000), resetTokenHash: 'old' }
  const first = makeService({ account: recent })
  await first.service.requestReset({ email: 'a@b.c' }, NOW)
  assert.equal(first.mails.length, 0)
  assert.equal(recent.resetTokenHash, 'old')

  const later = { email: 'a@b.c', status: 'active', resetRequestedAt: new Date(NOW - 2 * 60 * 1000), resetTokenHash: 'old' }
  const second = makeService({ account: later })
  await second.service.requestReset({ email: 'a@b.c' }, NOW)
  assert.equal(second.mails.length, 1)
  assert.notEqual(later.resetTokenHash, 'old')
})

test('Server chưa cấu hình email: 503, không đọc database', async () => {
  const { service, calls } = makeService({ account: { email: 'a@b.c' }, canSend: false })
  await assert.rejects(service.requestReset({ email: 'a@b.c' }, NOW), (e) => e.status === 503)
  assert.equal(calls.filters.length, 0)
})

test('Gửi email lỗi: 502 và xóa mã vừa tạo để thử lại ngay được', async () => {
  const account = { email: 'a@b.c', status: 'active' }
  const { service, calls } = makeService({ account, send: async () => { throw new Error('smtp down') } })
  await assert.rejects(service.requestReset({ email: 'a@b.c' }, NOW), (e) => e.status === 502)
  assert.equal(calls.saves.length, 2)
  assert.equal(account.resetTokenHash, undefined)
  assert.equal(account.resetRequestedAt, undefined)
})

test('Đặt lại mật khẩu: tìm theo hash + còn hạn, lưu hash mới, xóa mã, đăng xuất phiên cũ', async () => {
  const account = { id: 'u1', email: 'a@b.c', status: 'active', passwordHash: 'old', mustChangePassword: true, resetTokenHash: sha256(TOKEN), resetTokenExpiresAt: new Date(NOW.getTime() + 1000) }
  const { service, calls } = makeService({ account })
  const session = await service.resetPassword({ token: TOKEN, password: 'new-pass' }, NOW)

  assert.equal(calls.filters[0].resetTokenHash, sha256(TOKEN))
  assert.equal(calls.filters[0].resetTokenExpiresAt.$gt, NOW)
  assert.equal(account.passwordHash, 'hash:new-pass')
  assert.equal(account.mustChangePassword, false)
  assert.equal(account.passwordChangedAt, NOW)
  assert.equal(account.resetTokenHash, undefined)
  assert.equal(account.resetTokenExpiresAt, undefined)
  assert.equal(calls.saves.length, 1)
  assert.equal(session.token, 'session-token')
})

test('Đặt lại mật khẩu: mã sai / hết hạn 400, tài khoản khóa 403, không ghi', async () => {
  const missing = makeService({ account: null })
  await assert.rejects(missing.service.resetPassword({ token: TOKEN, password: 'new-pass' }, NOW), (e) => e.status === 400)

  const locked = { status: 'locked', passwordHash: 'old' }
  const blocked = makeService({ account: locked })
  await assert.rejects(blocked.service.resetPassword({ token: TOKEN, password: 'new-pass' }, NOW), (e) => e.status === 403)
  assert.equal(blocked.calls.saves.length, 0)
  assert.equal(locked.passwordHash, 'old')
})

test('Token đăng nhập cấp trước lúc đặt lại mật khẩu bị từ chối, token mới vẫn dùng được', async () => {
  const secret = crypto.randomBytes(32).toString('hex')
  const changedAt = new Date(Date.now() - 60 * 1000)
  const auth = load('middlewares/auth.js', { '../models/User': { findById: async (id) => ({ id, role: 'user', status: 'active', passwordChangedAt: changedAt }) } }, { process: { env: { JWT_SECRET: secret } } })
  const before = jwt.sign({ sub: 'u1', iat: Math.floor(changedAt / 1000) - 3600 }, secret)
  await assert.rejects(auth.requireAuth({ headers: { authorization: 'Bearer ' + before } }, {}, () => {}), (e) => e.status === 401)
  let passed = false
  const after = jwt.sign({ sub: 'u1' }, secret)
  await auth.requireAuth({ headers: { authorization: 'Bearer ' + after } }, {}, () => { passed = true })
  assert(passed)
})

test('HTTP: /forgot-password trả cùng một câu dù có tài khoản hay không; dữ liệu sai 400', async () => {
  const requested = []
  const reset = { requestReset: async (body) => { requested.push(body.email) }, resetPassword: async () => ({ token: 't', user: {} }), SENT_MESSAGE: 'đã gửi' }
  const controller = load('modules/auth/auth.controller.js', { './passwordReset.service': reset, './auth.service': {} })
  const router = load('modules/auth/auth.routes.js', { './auth.controller': controller, '../../middlewares/auth': { requireAuth: (req, res, next) => next() } })
  const app = express(); app.use(express.json()); app.use('/auth', router); app.use(errorHandler)
  const server = app.listen(0, '127.0.0.1'); await new Promise((r) => server.once('listening', r))
  const post = (url, body) => fetch(`http://127.0.0.1:${server.address().port}/auth${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  try {
    for (const email of ['co@example.org', 'khong@example.org']) {
      const res = await post('/forgot-password', { email })
      assert.equal(res.status, 200)
      assert.deepEqual(await res.json(), { message: 'đã gửi' })
    }
    assert.equal((await post('/forgot-password', { email: { $ne: '' } })).status, 400)
    assert.equal((await post('/reset-password', { token: { $ne: '' }, password: 'new-pass' })).status, 400)
    assert.equal((await post('/reset-password', { token: TOKEN, password: 'new-pass' })).status, 200)
    assert.deepEqual(requested, ['co@example.org', 'khong@example.org'])
  } finally { await new Promise((r) => server.close(r)) }
})

test('Mailer: local chưa cấu hình thì in ra terminal, production chưa cấu hình thì báo không gửi được', async () => {
  const printed = []
  const transport = { createTransport: () => { throw Error('Không được tạo kết nối SMTP') } }
  const dev = load('utils/mailer.js', { nodemailer: transport }, { process: { env: {} }, console: { info: (m) => printed.push(m) } })
  assert.equal(dev.canSend(), true)
  await dev.sendMail({ to: 'a@b.c', subject: 'S', text: 'link-here' })
  assert(printed[0].includes('link-here'))

  const prod = load('utils/mailer.js', { nodemailer: transport }, { process: { env: { NODE_ENV: 'production' } } })
  assert.equal(prod.canSend(), false)
  await assert.rejects(prod.sendMail({ to: 'a@b.c', subject: 'S', text: 'x' }))

  const sent = []
  const configured = load('utils/mailer.js', { nodemailer: { createTransport: (options) => ({ sendMail: async (mail) => sent.push({ options, mail }) }) } }, { process: { env: { NODE_ENV: 'production', SMTP_USER: 'bot@gmail.com', SMTP_PASS: 'app-password' } } })
  assert.equal(configured.canSend(), true)
  await configured.sendMail({ to: 'a@b.c', subject: 'S', text: 'x' })
  assert.equal(sent[0].options.host, 'smtp.gmail.com')
  assert.equal(sent[0].options.secure, true)
  assert.equal(sent[0].mail.from, 'UniMatch HCMC <bot@gmail.com>')
})
