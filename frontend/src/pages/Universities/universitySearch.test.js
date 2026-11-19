// Logic tìm theo tên đã chuyển sang backend: xem backend/tests/university-search.test.cjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { hasActiveFilter, paginate, readFilters, readPage, toApiParams } from './universitySearch.js'

const params = (query) => new URLSearchParams(query)

test('đọc bộ lọc từ URL, bỏ qua giá trị lạ', () => {
  assert.deepEqual(readFilters(params('q=uit&loai=public&dhqg=1&nhom=Kỹ thuật&nganh=7480201&khuvuc=Quận 5&hocphi=30000000')), {
    q: 'uit', type: 'public', vnuOnly: true, group: 'Kỹ thuật', major: '7480201', district: 'Quận 5', maxTuition: '30000000',
  })
  const odd = readFilters(params('loai=abc&dhqg=yes&hocphi=123'))
  assert.equal(odd.type, 'all')
  assert.equal(odd.vnuOnly, false)
  assert.equal(odd.maxTuition, '')
})

test('đọc số trang: mặc định 1, không nhận số âm / chữ', () => {
  assert.equal(readPage(params('')), 1)
  assert.equal(readPage(params('trang=3')), 3)
  assert.equal(readPage(params('trang=-2')), 1)
  assert.equal(readPage(params('trang=abc')), 1)
})

test('chỉ gửi API các bộ lọc đang dùng; có ngành thì không gửi nhóm ngành', () => {
  const empty = readFilters(params(''))
  assert.deepEqual(toApiParams(empty), {})
  assert.equal(hasActiveFilter(empty), false)

  const filters = readFilters(params('q= uit &dhqg=1&nhom=Kỹ thuật&nganh=7480201&hocphi=50000000'))
  assert.deepEqual(toApiParams(filters), { q: 'uit', vnu: '1', major: '7480201', maxTuition: '50000000' })
  assert.equal(hasActiveFilter(filters), true)

  assert.deepEqual(toApiParams(readFilters(params('nhom=Kỹ thuật'))), { group: 'Kỹ thuật' })
})

test('phân trang 12 trường/trang, kẹp số trang hợp lệ', () => {
  const list = Array.from({ length: 30 }, (_, i) => i)
  const p1 = paginate(list, 1)
  assert.equal(p1.items.length, 12)
  assert.equal(p1.totalPages, 3)
  assert.deepEqual(paginate(list, 3).items, [24, 25, 26, 27, 28, 29])
  assert.equal(paginate(list, 999).current, 3)
  assert.equal(paginate([], 3).totalPages, 1)
})
