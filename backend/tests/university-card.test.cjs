const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { createRequire } = require('node:module')

const filename = path.join(__dirname, '../src/modules/universities/universities.service.js')
const serviceModule = { exports: {} }
// require tương đối (vd ../../models/Major) phải tính từ file service, không phải từ thư mục tests/
const requireFromFile = createRequire(filename)
vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
  module: serviceModule,
  require: (name) => (name.startsWith('../../models/') ? {} : requireFromFile(name)),
}, { filename })
const { toCard } = serviceModule.exports

// JSON round-trip: object tạo trong vm thuộc realm khác nên deepEqual strict không so trực tiếp được
const card = (tuition) => JSON.parse(JSON.stringify(toCard({ slug: 'demo', name: 'Demo', tuition, admissions: [], majors: [] })))

test('tuitionFrom prefers a cheaper per-semester fee over a pricier per-year fee', () => {
  const tuition = [
    { unit: 'year', amountMin: 84000000 },
    { unit: 'semester', amountMin: 20900000 },
  ]
  assert.deepEqual(card(tuition).tuitionFrom, { amount: 20900000, unit: 'semester' })
})

test('tuitionFrom keeps the per-year fee when it is cheaper than two semesters', () => {
  const tuition = [
    { unit: 'semester', amountMin: 25000000 },
    { unit: 'year', amountMin: 30000000 },
  ]
  assert.deepEqual(card(tuition).tuitionFrom, { amount: 30000000, unit: 'year' })
})

test('tuitionFrom falls back to credit, then program, and ignores zero fees', () => {
  assert.deepEqual(card([
    { unit: 'program', amountMin: 500000000 },
    { unit: 'credit', amountMin: 900000 },
    { unit: 'credit', amountMin: 850000 },
    { unit: 'year', amountMin: 0 },
  ]).tuitionFrom, { amount: 850000, unit: 'credit' })
  assert.deepEqual(card([{ unit: 'program', amountMin: 500000000 }]).tuitionFrom, { amount: 500000000, unit: 'program' })
  assert.equal(card([]).tuitionFrom, null)
  assert.equal(card(undefined).tuitionFrom, null)
})
