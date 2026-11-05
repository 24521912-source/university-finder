import test from 'node:test'
import assert from 'node:assert/strict'
import { buildMajorRows, paginateRows } from './majorRows.js'

test('keeps one row per major with every program and its original score records', () => {
  const data = {
    majors: [{ code: 'A', name: 'Alpha' }, { code: 'B', name: 'Beta' }],
    admissions: [
      { majorCode: 'A', program: 'Standard', score: 25, year: 2025, scale: 30 },
      { majorCode: 'A', program: 'English', score: 27, year: 2025, scale: 30 },
      { majorCode: 'A', program: 'Standard', score: 24, year: 2024, scale: 30 },
    ], tuition: [],
  }
  const rows = buildMajorRows(data)
  assert.equal(rows.length, 2)
  assert.deepEqual(rows[0].programs, ['Standard', 'English'])
  assert.deepEqual(rows[0].scores.filter(score => score.program === 'Standard').map(row => row.score), [25, 24])
  assert.deepEqual(rows[0].scores.filter(score => score.program === 'English').map(row => row.score), [27])
  assert.equal(rows[1].code, 'B')
  assert.deepEqual(rows[1].scores, [])
})

test('keeps group scores attached to their admission code without assigning them to constituent majors', () => {
  const score = { examCode: '106', groupName: 'Computing group', program: 'Standard', score: 80, scale: 100 }
  const rows = buildMajorRows({ admissionGroups: [score], majors: [{ code: 'A', name: 'Computing' }] })
  assert.equal(rows.length, 1)
  assert.equal(rows[0].code, '106')
  assert.deepEqual(rows[0].scores, [score])
  const english = { ...score, program: 'English', score: 85 }
  const grouped = buildMajorRows({ admissionGroups: [score, english] })
  assert.equal(grouped.length, 1)
  assert.deepEqual(grouped[0].programs, ['Standard', 'English'])
  assert.deepEqual(grouped[0].scores.map(record => record.score), [80, 85])
})

test('pagination covers all results exactly once and clamps the last page after filtering', () => {
  const rows = Array.from({ length: 23 }, (_, i) => i)
  const pages = [1, 2, 3].map(page => paginateRows(rows, page, 10))
  assert.deepEqual(pages.flatMap(page => page.rows), rows)
  assert.deepEqual([pages[2].start, pages[2].end], [21, 23])
  const filtered = paginateRows(rows.slice(0, 2), 3, 10)
  assert.equal(filtered.page, 1)
  assert.deepEqual(filtered.rows, [0, 1])
  assert.equal(paginateRows(rows, 1, 20).rows.length, 20)
})

test('empty lists have a stable first page with a zero result range', () => {
  assert.deepEqual(paginateRows([], 4, 10), { rows: [], page: 1, pages: 1, start: 0, end: 0 })
})
