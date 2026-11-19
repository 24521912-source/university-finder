// Test API tìm kiếm / lọc (WBS 5.4) và so sánh trường (WBS 5.6). Chạy: node --test tests/*.cjs
const test = require('node:test')
const assert = require('node:assert/strict')
const seeds = require('../../database/seeds/universities.json')
const { filterAndSort, annualTuitionFrom, normalize } = require('../src/modules/universities/universities.search')
const { validateSearch, validateCompare } = require('../src/modules/universities/universities.validation')
const { toComparison } = require('../src/modules/universities/universities.service')

const firstSlug = (q) => filterAndSort(seeds, { q })[0]?.slug

// ---------- Tìm theo tên ----------

test('normalize bỏ dấu, đ -> d, chữ thường', () => {
  assert.equal(normalize('Trường ĐH Công nghệ Thông tin'), 'truong dh cong nghe thong tin')
  assert.equal(normalize(undefined), '')
})

test('tìm theo tên viết tắt, mọi kiểu hoa/thường', () => {
  for (const q of ['uit', 'UIT', 'Uit', ' uit ']) assert.equal(firstSlug(q), 'cong-nghe-thong-tin-dhqg', q)
  assert.equal(firstSlug('hcmut'), 'bach-khoa-tphcm')
  assert.equal(firstSlug('UEL'), 'kinh-te-luat-dhqg')
})

test('tìm theo tên đầy đủ, có dấu hoặc không dấu', () => {
  for (const q of ['công nghệ thông tin', 'cong nghe thong tin', 'Trường Đại học Công nghệ Thông tin']) {
    assert.equal(firstSlug(q), 'cong-nghe-thong-tin-dhqg', q)
  }
  assert.equal(firstSlug('bach khoa'), 'bach-khoa-tphcm')
  assert.equal(firstSlug('đại học y dược'), 'y-duoc-tphcm')
})

test('không có từ khóa thì giữ nguyên thứ tự gốc', () => {
  assert.deepEqual(filterAndSort(seeds, {}).map((u) => u.slug), seeds.map((u) => u.slug))
})

// ---------- Học phí ----------

test('học phí quy về năm: năm giữ nguyên, học kỳ × 2, tín chỉ / khóa không quy đổi', () => {
  assert.equal(annualTuitionFrom({ tuition: [{ amountMin: 30e6, unit: 'year' }] }), 30e6)
  assert.equal(annualTuitionFrom({ tuition: [{ amountMin: 15e6, unit: 'semester' }] }), 30e6)
  assert.equal(annualTuitionFrom({ tuition: [{ amountMin: 25e6, unit: 'year' }, { amountMin: 10e6, unit: 'semester' }] }), 20e6)
  assert.equal(annualTuitionFrom({ tuition: [{ amountMin: 900000, unit: 'credit' }] }), null)
  assert.equal(annualTuitionFrom({ tuition: [{ amountMin: 0, unit: 'year' }] }), null)
  assert.equal(annualTuitionFrom({}), null)
})

test('lọc học phí tối đa: chỉ giữ trường có học phí quy đổi được và không vượt mức', () => {
  const result = filterAndSort(seeds, { maxTuition: 40e6 })
  assert.ok(result.length > 0)
  for (const u of result) assert.ok(annualTuitionFrom(u) <= 40e6, u.slug)
})

// ---------- Kiểm tra tham số ----------

test('validateSearch nhận tham số hợp lệ và chuẩn hóa giá trị', () => {
  const { value, error } = validateSearch({ q: ' uit ', type: 'public', vnu: '1', major: '7480201', district: 'TP. Thủ Đức', maxTuition: '40000000' })
  assert.equal(error, undefined)
  assert.deepEqual(value, { q: 'uit', type: 'public', vnuOnly: true, group: null, major: '7480201', district: 'TP. Thủ Đức', maxTuition: 40e6 })
  assert.deepEqual(validateSearch({}).value, { q: '', type: null, vnuOnly: false, group: null, major: null, district: null, maxTuition: null })
})

test('validateSearch từ chối dữ liệu sai kiểu (chặn NoSQL injection)', () => {
  assert.ok(validateSearch({ type: 'abc' }).error)
  assert.ok(validateSearch({ vnu: 'true' }).error)
  assert.ok(validateSearch({ major: { $ne: '' } }).error)
  assert.ok(validateSearch({ district: ['Quận 1', 'Quận 3'] }).error)
  assert.ok(validateSearch({ maxTuition: '-5' }).error)
  assert.ok(validateSearch({ maxTuition: 'abc' }).error)
  assert.ok(validateSearch({ q: 'a'.repeat(101) }).error)
})

test('validateCompare cần 2–3 slug khác nhau, đúng định dạng', () => {
  assert.deepEqual(validateCompare({ slugs: 'a-b, c-d' }).value, ['a-b', 'c-d'])
  assert.deepEqual(validateCompare({ slugs: 'a,a,b' }).value, ['a', 'b']) // bỏ trùng
  assert.ok(validateCompare({}).error)
  assert.ok(validateCompare({ slugs: 'chi-mot' }).error)
  assert.ok(validateCompare({ slugs: 'a,b,c,d' }).error)
  assert.ok(validateCompare({ slugs: 'a,../b' }).error)
  assert.ok(validateCompare({ slugs: ['a', 'b'] }).error)
})

// ---------- Dữ liệu so sánh ----------

test('toComparison tóm tắt học phí, điểm chuẩn năm gần nhất và trả null khi thiếu dữ liệu', () => {
  const row = toComparison({
    slug: 'demo', name: 'Demo', institutionType: 'public',
    majors: [{ code: '7480201', name: 'Công nghệ thông tin' }],
    tuition: [{ amountMin: 30e6, amountMax: 40e6, unit: 'year' }, { amountMin: 12e6, unit: 'semester' }],
    admissions: [
      { year: 2025, method: 'high_school_exam', scale: 30, score: 20 },
      { year: 2026, method: 'high_school_exam', scale: 30, score: 24 },
      { year: 2026, method: 'high_school_exam', scale: 30, score: 27.5 },
    ],
  })
  assert.deepEqual(row.tuition, [{ unit: 'year', min: 30e6, max: 40e6 }, { unit: 'semester', min: 12e6, max: 12e6 }])
  assert.equal(row.annualTuitionFrom, 24e6)
  assert.deepEqual(row.examScore, { year: 2026, scale: 30, min: 24, max: 27.5 })
  assert.equal(row.competencyScore, null)
  assert.equal(row.majorCount, 1)
  assert.equal(row.district, null)
  assert.equal(row.dormitory, null)
  assert.deepEqual(toComparison({ slug: 'x', name: 'X' }).tuition, [])
})

// ---------- Route HTTP (service giả, không cần database) ----------

test('route /search, /filter-options, /compare không bị nhầm với /:slug và trả 400 khi tham số sai', async (t) => {
  const express = require('express')
  const path = require('node:path')
  const servicePath = path.join(__dirname, '../src/modules/universities/universities.service.js')
  const controllerPath = path.join(__dirname, '../src/modules/universities/universities.controller.js')
  const routesPath = path.join(__dirname, '../src/modules/universities/universities.routes.js')

  // Thay service thật bằng service giả trong cache của require, rồi nạp lại controller + routes.
  const realService = require.cache[require.resolve(servicePath)]
  require.cache[require.resolve(servicePath)] = {
    id: servicePath, filename: servicePath, loaded: true,
    exports: {
      search: async (filters) => ({ total: 0, items: [], filters }),
      filterOptions: async () => ({ districts: ['Quận 1'], majorGroups: [] }),
      compare: async (slugs) => slugs.map((slug) => ({ slug })),
      detail: async () => null,
    },
  }
  delete require.cache[require.resolve(controllerPath)]
  delete require.cache[require.resolve(routesPath)]
  const router = require(routesPath)
  t.after(() => {
    require.cache[require.resolve(servicePath)] = realService
    delete require.cache[require.resolve(controllerPath)]
    delete require.cache[require.resolve(routesPath)]
  })

  const { errorHandler } = require('../src/middlewares/error')
  const app = express()
  app.use('/api/universities', router)
  app.use(errorHandler)
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  t.after(() => new Promise((resolve) => server.close(resolve)))
  const base = `http://127.0.0.1:${server.address().port}/api/universities`

  const search = await fetch(`${base}/search?q=uit&type=public&maxTuition=40000000`)
  assert.equal(search.status, 200)
  assert.equal((await search.json()).filters.maxTuition, 40e6)

  const badSearch = await fetch(`${base}/search?type=abc`)
  assert.equal(badSearch.status, 400)
  assert.deepEqual(await badSearch.json(), { message: 'Loại trường không hợp lệ' })

  const options = await fetch(`${base}/filter-options`)
  assert.deepEqual(await options.json(), { districts: ['Quận 1'], majorGroups: [] })

  const compare = await fetch(`${base}/compare?slugs=a,b`)
  assert.deepEqual(await compare.json(), [{ slug: 'a' }, { slug: 'b' }])

  const badCompare = await fetch(`${base}/compare?slugs=a`)
  assert.equal(badCompare.status, 400)
})
