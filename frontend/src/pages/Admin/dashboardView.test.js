import test from 'node:test'
import assert from 'node:assert/strict'
import { coverageRows, percent, shortDate, trendBars, typeRows } from './dashboardView.js'

const data = {
  universities: { total: 66, byType: { public: 40, private: 26, international: 0, other: 0 } },
  coverage: { majors: 60, admissions: 33, verifiedForAI: 20, tuition: 30, coordinates: 15, logo: 66 },
}

test('percent làm tròn, tổng 0 trả 0', () => {
  assert.equal(percent(15, 66), 23)
  assert.equal(percent(3, 0), 0)
})

test('coverageRows: đủ 6 dòng theo thứ tự cố định, có % ', () => {
  const rows = coverageRows(data)
  assert.deepEqual(rows.map((r) => r.key), ['majors', 'admissions', 'verifiedForAI', 'tuition', 'coordinates', 'logo'])
  assert.deepEqual(rows.find((r) => r.key === 'coordinates'), { key: 'coordinates', label: 'Có tọa độ bản đồ', value: 15, total: 66, pct: 23 })
  assert.equal(coverageRows(undefined)[0].pct, 0)
})

test('typeRows bỏ loại không có trường', () => {
  assert.deepEqual(typeRows(data).map((r) => [r.label, r.value, r.pct]), [['Công lập', 40, 61], ['Tư thục', 26, 39]])
})

test('trendBars: cao nhất = 100%, ngày 0 lượt = 0%, nhãn dd/mm', () => {
  const { max, bars } = trendBars([{ date: '2026-11-20', count: 0 }, { date: '2026-11-21', count: 4 }, { date: '2026-11-19', count: 2 }])
  assert.equal(max, 4)
  assert.deepEqual(bars.map((b) => b.pct), [0, 100, 50])
  assert.equal(bars[1].label, '21/11')
  assert.equal(trendBars([{ date: '2026-11-21', count: 0 }]).max, 1)
  assert.equal(shortDate('2026-01-05'), '05/01')
})
