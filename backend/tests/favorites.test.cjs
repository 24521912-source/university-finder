const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const crypto = require('node:crypto')
const express = require('express')
const jwt = require('jsonwebtoken')

// Model giả trong RAM, mô phỏng đúng điều kiện update của MongoDB: không kết nối Atlas.
const schools = new Map([['demo-school', { _id: 'u1', slug: 'demo-school', favoriteCount: 0 }]])
const users = new Map([['user1', { _id: 'user1', role: 'user', favorites: [] }]])
const query = (value) => ({ select() { return this }, lean: async () => value })
const byId = (id) => [...schools.values()].find((s) => s._id === id)

const University = {
  findOne: ({ slug }) => query(schools.get(slug) || null),
  updateOne: async ({ _id, favoriteCount }, { $inc }) => {
    const s = byId(_id)
    if (!s || (favoriteCount?.$gt !== undefined && !(s.favoriteCount > favoriteCount.$gt))) return { modifiedCount: 0 }
    s.favoriteCount += $inc.favoriteCount
    return { modifiedCount: 1 }
  },
}
const User = {
  findById: (id) => {
    const u = users.get(id) || null
    return Object.assign(Promise.resolve(u), { select() { return query(u) } })
  },
  updateOne: async ({ _id, favorites }, update) => {
    const u = users.get(_id)
    if (update.$push) {
      if (u.favorites.includes(favorites.$ne)) return { modifiedCount: 0 }
      u.favorites.push(update.$push.favorites)
    } else {
      if (!u.favorites.includes(favorites)) return { modifiedCount: 0 }
      u.favorites = u.favorites.filter((f) => f !== update.$pull.favorites)
    }
    return { modifiedCount: 1 }
  },
}

function mock(rel, exports) {
  const file = require.resolve(path.join(__dirname, '../src', rel))
  require.cache[file] = { id: file, filename: file, loaded: true, exports }
}
mock('models/University', University)
mock('models/User', User)
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex')

const { errorHandler } = require('../src/middlewares/error')
const app = express()
app.use(express.json())
app.use('/api/favorites', require('../src/modules/favorites/favorites.routes'))
app.use(errorHandler)

let server
let base
test.before(async () => {
  server = app.listen(0, '127.0.0.1')
  await new Promise((r) => server.once('listening', r))
  base = `http://127.0.0.1:${server.address().port}/api/favorites`
})
test.after(() => server.close())

const auth = { authorization: `Bearer ${jwt.sign({ sub: 'user1' }, process.env.JWT_SECRET)}` }
const call = (method, slug, headers = auth) => fetch(`${base}/${slug}`, { method, headers })

test('chưa đăng nhập 401, không ghi', async () => {
  assert.equal((await call('POST', 'demo-school', {})).status, 401)
  assert.equal(schools.get('demo-school').favoriteCount, 0)
})

test('thêm 2 lần chỉ tính 1; bỏ 2 lần không làm số âm', async () => {
  let res = await call('POST', 'demo-school')
  assert.equal(res.status, 200)
  assert.deepEqual((await res.json()).favorites, ['u1'])
  await call('POST', 'demo-school')
  assert.deepEqual(users.get('user1').favorites, ['u1'])
  assert.equal(schools.get('demo-school').favoriteCount, 1)

  res = await call('DELETE', 'demo-school')
  assert.deepEqual((await res.json()).favorites, [])
  await call('DELETE', 'demo-school')
  assert.equal(schools.get('demo-school').favoriteCount, 0)
})

test('slug sai định dạng 400, trường không tồn tại 404', async () => {
  assert.equal((await call('POST', 'Sai_Slug')).status, 400)
  assert.equal((await call('POST', 'khong-co-truong')).status, 404)
  assert.deepEqual(users.get('user1').favorites, [])
})
