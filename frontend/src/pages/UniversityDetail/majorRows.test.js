import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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

test('groups HCMUT programs under their major heading without losing admission codes or score records', () => {
  const schools = JSON.parse(readFileSync(new URL('../../../../database/seeds/universities.json', import.meta.url), 'utf8'))
  const evidence = schools.find(school => school.slug === 'bach-khoa-tphcm').detailEvidence
  const admissionGroups = Object.entries(evidence.groups).map(([examCode, group]) => ({ examCode, groupName: group.title, program: `Program ${examCode}`, score: group.htmlScore, scale: 100 }))
  const rows = buildMajorRows({ admissionGroups })
  assert.equal(rows.length, 43)
  assert.equal(rows.flatMap(row => row.scores).length, admissionGroups.length)
  assert.equal(new Set(rows.flatMap(row => row.codes)).size, 65)
  const computing = rows.find(row => row.codes.includes('106'))
  assert.deepEqual(computing.codes, ['106', '206', '266', '306'])
  assert.deepEqual(computing.scores.map(score => [score.examCode, score.score]), admissionGroups.filter(score => computing.codes.includes(score.examCode)).map(score => [score.examCode, score.score]))
  assert.deepEqual(rows.find(row => row.codes.includes('150')).codes, ['150', '220'])
  assert.deepEqual(rows.find(row => row.codes.includes('156')).codes, ['156', '256'])
})

test('preserves separate joint groups with different membership instead of assigning their scores to individual majors', () => {
  const admissionGroups = [
    { examCode: '101', groupName: 'Nhóm ngành Công nghệ\n(Ngành: A; B)', program: 'Standard', score: 80 },
    { examCode: '201', groupName: 'Nhóm ngành Công nghệ\n(Ngành: A; C)', program: 'English', score: 85 },
    { examCode: '301', groupName: 'A', program: 'Standard', score: 90 },
  ]
  const rows = buildMajorRows({ admissionGroups })
  assert.equal(rows.length, 3)
  assert.equal(rows.find(row => row.code === '301').scores[0].score, 90)
  assert.equal(rows.find(row => row.code === '101').description, '(Ngành: A; B)')
})

test('all schools keep one row per national major code, including duplicate incoming major records', () => {
  const schools = JSON.parse(readFileSync(new URL('../../../../database/seeds/universities.json', import.meta.url), 'utf8'))
  for (const school of schools) {
    const data = { majors: [...(school.majors || []), ...(school.majors || [])], admissions: school.admissions || [], tuition: school.tuition || [] }
    const rows = buildMajorRows(data)
    assert.equal(rows.length, new Set((school.majors || []).map(major => major.code)).size, school.slug)
    assert.equal(rows.flatMap(row => row.scores).length, (school.admissions || []).filter(score => (school.majors || []).some(major => major.code === score.majorCode)).length, school.slug)
  }
})
