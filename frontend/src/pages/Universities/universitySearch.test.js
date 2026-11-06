import test from 'node:test'
import assert from 'node:assert/strict'
import seeds from '../../../../database/seeds/universities.json' with { type: 'json' }
import { filterUniversities, paginate } from './universitySearch.js'

const first = (q, opts = {}) => filterUniversities(seeds, { query: q, ...opts })[0]?.slug

test('tìm theo tên viết tắt, mọi kiểu hoa/thường', () => {
  for (const q of ['uit', 'UIT', 'Uit', ' uit ']) assert.equal(first(q), 'cong-nghe-thong-tin-dhqg', q)
  assert.equal(first('hcmut'), 'bach-khoa-tphcm')
  assert.equal(first('UEL'), 'kinh-te-luat-dhqg')
})

test('tìm theo tên đầy đủ, có dấu hoặc không dấu', () => {
  for (const q of ['công nghệ thông tin', 'cong nghe thong tin', 'CÔNG NGHỆ THÔNG TIN', 'Trường Đại học Công nghệ Thông tin']) {
    assert.equal(first(q), 'cong-nghe-thong-tin-dhqg', q)
  }
  assert.equal(first('bach khoa'), 'bach-khoa-tphcm')
  assert.equal(first('kinh tế luật'), 'kinh-te-luat-dhqg')
  assert.equal(first('đại học y dược'), 'y-duoc-tphcm')
})

test('lọc công lập / tư thục và ĐHQG', () => {
  assert.ok(filterUniversities(seeds, { type: 'private' }).every((u) => u.institutionType === 'private'))
  assert.ok(filterUniversities(seeds, { type: 'public' }).every((u) => u.institutionType === 'public'))
  assert.equal(filterUniversities(seeds, { vnuOnly: true }).length, 7)
  assert.equal(filterUniversities(seeds, { query: 'van lang', vnuOnly: true }).length, 0)
})

test('phân trang 12 trường/trang, kẹp số trang hợp lệ', () => {
  const p1 = paginate(seeds, 1)
  assert.equal(p1.items.length, 12)
  assert.equal(p1.totalPages, Math.ceil(seeds.length / 12))
  assert.equal(paginate(seeds, 999).current, p1.totalPages)
  assert.equal(paginate([], 3).totalPages, 1)
})
