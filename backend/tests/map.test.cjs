const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const express = require('express')

// Model giả trong RAM: không kết nối Atlas.
const schools = [
  { slug: 'co-toa-do', name: 'B Trường có tọa độ', shortName: 'B', institutionType: 'public', belongsToUniversitySystem: true, dataLevel: 3,
    address: { full: '1 Đường A', district: 'Quận 1', location: { type: 'Point', coordinates: [106.7, 10.78] } },
    campuses: [{ name: 'Cơ sở 2', address: '2 Đường B', location: { type: 'Point', coordinates: [106.8, 10.87] } }, { name: 'Chưa có tọa độ' }] },
  { slug: 'chua-co', name: 'A Trường chưa có', address: { district: 'Quận 3' } },
  { slug: 'toa-do-0', name: 'C Tọa độ 0,0', address: { location: { coordinates: [0, 0] } } },
  { slug: 'sai-thu-tu', name: 'D Vĩ độ > 90', address: { location: { coordinates: [10.7, 106.7] } } },
]
const University = { find: () => ({ select() { return this }, sort() { return this }, lean: async () => structuredClone(schools) }) }

const file = require.resolve(path.join(__dirname, '../src/models/University'))
require.cache[file] = { id: file, filename: file, loaded: true, exports: University }

const { toLatLng } = require('../src/modules/map/map.service')
const { validateLocations } = require('../src/modules/admin/admin.validation')
const { errorHandler } = require('../src/middlewares/error')
const app = express()
app.use('/api/map', require('../src/modules/map/map.routes'))
app.use(errorHandler)

let server
let base
test.before(async () => {
  server = app.listen(0, '127.0.0.1')
  await new Promise((r) => server.once('listening', r))
  base = `http://127.0.0.1:${server.address().port}/api/map`
})
test.after(() => server.close())

test('GET /map/universities: chỉ trường có tọa độ hợp lệ vào items, còn lại vào missing', async () => {
  const res = await fetch(`${base}/universities`)
  assert.equal(res.status, 200)
  const { items, missing } = await res.json()
  assert.deepEqual(items.map((u) => u.slug), ['co-toa-do'])
  assert.equal(items[0].lat, 10.78)
  assert.equal(items[0].lng, 106.7)
  assert.equal(items[0].address, '1 Đường A')
  assert.deepEqual(items[0].campuses, [{ name: 'Cơ sở 2', address: '2 Đường B', lat: 10.87, lng: 106.8 }])
  assert.deepEqual(missing.map((u) => u.slug), ['chua-co', 'toa-do-0', 'sai-thu-tu'])
})

test('toLatLng đổi [lng, lat] -> { lat, lng } và bỏ giá trị sai', () => {
  assert.deepEqual(toLatLng({ coordinates: [106.7, 10.8] }), { lat: 10.8, lng: 106.7 })
  for (const bad of [undefined, {}, { coordinates: [] }, { coordinates: ['106', '10'] }, { coordinates: [200, 10] }, { coordinates: [0, 0] }]) {
    assert.equal(toLatLng(bad), null)
  }
})

test('admin: validateLocations chặn tọa độ sai, cho phép bỏ trống', () => {
  assert.equal(validateLocations({}), null)
  assert.equal(validateLocations({ address: { location: { type: 'Point', coordinates: [106.7, 10.8] } } }), null)
  assert.equal(validateLocations({ address: { location: null }, campuses: [{ name: 'X' }] }), null)
  assert.match(validateLocations({ address: { location: { coordinates: [106.7] } } }), /đúng 2 số/)
  assert.match(validateLocations({ address: { location: { coordinates: ['106.7', '10.8'] } } }), /đúng 2 số/)
  assert.match(validateLocations({ address: { location: { coordinates: [10.8, 106.7] } } }), /vĩ độ/)
  assert.match(validateLocations({ campuses: [{}, { location: { type: 'Polygon', coordinates: [106, 10] } }] }), /Cơ sở 2/)
})
