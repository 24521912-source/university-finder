import test from 'node:test'
import assert from 'node:assert/strict'
import { detailPoints, filterSchools, formatLatLng, parseLatLng, toPoints } from './mapData.js'

const items = [
  { slug: 'bach-khoa', name: 'Trường Đại học Bách khoa', shortName: 'HCMUT', district: 'Quận 10', institutionType: 'public', belongsToUniversitySystem: true, lat: 10.77, lng: 106.65,
    campuses: [{ name: 'Cơ sở Dĩ An', address: 'Dĩ An', lat: 10.88, lng: 106.8 }] },
  { slug: 'van-lang', name: 'Trường Đại học Văn Lang', shortName: 'VLU', district: 'Quận Bình Thạnh', institutionType: 'private', belongsToUniversitySystem: false, lat: 10.81, lng: 106.69, campuses: [] },
]

test('filterSchools: tìm không dấu theo tên / viết tắt / quận, lọc loại trường và ĐHQG', () => {
  assert.deepEqual(filterSchools(items, { q: 'bach khoa' }).map((u) => u.slug), ['bach-khoa'])
  assert.deepEqual(filterSchools(items, { q: 'vlu' }).map((u) => u.slug), ['van-lang'])
  assert.deepEqual(filterSchools(items, { q: 'binh thanh' }).map((u) => u.slug), ['van-lang'])
  assert.deepEqual(filterSchools(items, { type: 'private' }).map((u) => u.slug), ['van-lang'])
  assert.deepEqual(filterSchools(items, { vnu: true }).map((u) => u.slug), ['bach-khoa'])
  assert.equal(filterSchools(items, {}).length, 2)
})

test('toPoints: trụ sở id = slug, cơ sở phụ id = slug#n, màu theo loại trường', () => {
  const points = toPoints(items)
  assert.deepEqual(points.map((p) => p.id), ['bach-khoa', 'bach-khoa#1', 'van-lang'])
  assert.equal(points[1].kind, 'campus')
  assert.equal(points[1].title, 'HCMUT — Cơ sở Dĩ An')
  assert.equal(points[0].href, '/truong/bach-khoa')
  assert.notEqual(points[0].color, points[2].color)
})

test('detailPoints: chỉ lấy trụ sở / cơ sở có tọa độ hợp lệ', () => {
  const u = { name: 'X', institutionType: 'public', address: { full: 'A', location: { coordinates: [106.7, 10.8] } },
    campuses: [{ name: 'Không tọa độ' }, { name: 'CS2', location: { coordinates: [106.9, 10.9] } }, { name: 'Sai', location: { coordinates: [0, 0] } }] }
  assert.deepEqual(detailPoints(u).map((p) => [p.title, p.lat, p.lng]), [['Trụ sở — X', 10.8, 106.7], ['CS2', 10.9, 106.9]])
  assert.deepEqual(detailPoints({ address: {} }), [])
})

test('parseLatLng: đọc "vĩ độ, kinh độ" như Google Maps, báo lỗi rõ', () => {
  assert.deepEqual(parseLatLng('10.8700, 106.8031'), { lat: 10.87, lng: 106.8031 })
  assert.deepEqual(parseLatLng(' 10.87 106.8 '), { lat: 10.87, lng: 106.8 })
  assert.equal(parseLatLng('  '), null)
  assert.match(parseLatLng('10.87').error, /2 số/)
  assert.match(parseLatLng('abc, 106').error, /phải là số/)
  assert.match(parseLatLng('106.8, 100').error, /ngược thứ tự/)
  assert.equal(formatLatLng({ coordinates: [106.8031, 10.87] }), '10.87, 106.8031')
  assert.equal(formatLatLng(undefined), '')
})
