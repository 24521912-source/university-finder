const test = require('node:test')
const assert = require('node:assert/strict')
const express = require('express')
const { rateLimit } = require('../src/middlewares/rateLimit')

// App thử: /ok luôn 200, /fail luôn 401. Đồng hồ giả để không phải chờ thật.
async function withApp(options, run) {
  let time = 1_000_000
  const clock = { now: () => time, advance: (ms) => { time += ms } }
  const app = express()
  app.set('trust proxy', 1)
  const limit = rateLimit({ ...options, now: clock.now })
  app.post('/ok', limit, (req, res) => res.json({ ok: true }))
  app.post('/fail', limit, (req, res) => res.status(401).json({ message: 'sai' }))
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const post = (path, ip = '1.1.1.1') => fetch(`http://127.0.0.1:${server.address().port}${path}`, {
    method: 'POST',
    headers: { 'X-Forwarded-For': ip },
  })
  try { await run({ post, clock }) } finally { await new Promise((resolve) => server.close(resolve)) }
}

test('quá số lần cho phép thì trả 429 kèm Retry-After và câu báo tiếng Việt', async () => {
  await withApp({ windowMs: 15 * 60_000, max: 3 }, async ({ post }) => {
    for (let i = 0; i < 3; i++) assert.equal((await post('/fail')).status, 401)
    const blocked = await post('/fail')
    assert.equal(blocked.status, 429)
    assert.equal(blocked.headers.get('retry-after'), '900')
    assert.equal(blocked.headers.get('ratelimit-remaining'), '0')
    assert.match((await blocked.json()).message, /thử lại sau 15 phút/)
  })
})

test('hết cửa sổ thời gian thì được thử lại', async () => {
  await withApp({ windowMs: 60_000, max: 2 }, async ({ post, clock }) => {
    await post('/fail'); await post('/fail')
    assert.equal((await post('/fail')).status, 429)
    clock.advance(60_000)
    assert.equal((await post('/fail')).status, 401)
  })
})

test('mỗi IP đếm riêng (IP lấy từ X-Forwarded-For do Nginx gửi)', async () => {
  await withApp({ windowMs: 60_000, max: 1 }, async ({ post }) => {
    assert.equal((await post('/fail', '2.2.2.2')).status, 401)
    assert.equal((await post('/fail', '2.2.2.2')).status, 429)
    assert.equal((await post('/fail', '3.3.3.3')).status, 401)
  })
})

test('skipSuccessful: request thành công không bị tính, chỉ đếm lần sai', async () => {
  await withApp({ windowMs: 60_000, max: 2, skipSuccessful: true }, async ({ post }) => {
    for (let i = 0; i < 5; i++) assert.equal((await post('/ok')).status, 200)
    assert.equal((await post('/fail')).status, 401)
    assert.equal((await post('/fail')).status, 401)
    assert.equal((await post('/fail')).status, 429)
  })
})
