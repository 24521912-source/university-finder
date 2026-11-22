import test from 'node:test'
import assert from 'node:assert/strict'
import { MAX_SAVED_RESULTS, describeCriteria, toConsultationPayload } from './consultation.js'

const ranked = Array.from({ length: 7 }, (_, i) => ({
  slug: `truong-${i}`, name: `Trường ${i}`, major: 'Công nghệ thông tin', score: 90 - i, coverage: 70,
  criteria: {
    major: { score: 100, text: 'Đúng ngành' },
    admission: { score: null, text: 'Chưa có điểm' },
    tuition: { score: 80, text: 'Học phí 30 tr/năm' },
  },
}))
const preferences = {
  major: { label: 'Nhóm Công nghệ thông tin', codes: ['7480201', '7480101'] }, majorCodes: ['7480201', '7480101'],
  method: 'high_school_exam', combination: 'A00', score: '25.5', budget: '40000000', district: 'any', institutionType: 'any', vnuhcm: 'only',
}

test('payload: tối đa 5 trường, lý do chỉ gồm tiêu chí đã chấm, điểm là số', () => {
  const p = toConsultationPayload(preferences, { ranked })
  assert.equal(p.results.length, MAX_SAVED_RESULTS)
  assert.deepEqual(p.results[0], { slug: 'truong-0', major: 'Công nghệ thông tin', matchScore: 90, coverage: 70, reasons: ['Đúng ngành', 'Học phí 30 tr/năm'] })
  assert.equal(p.criteria.score, 25.5)
  assert.equal(p.criteria.maxTuition, 40000000)
  assert.equal(p.criteria.majorCode, '7480201')
  assert.equal(p.criteria.majorLabel, 'Nhóm Công nghệ thông tin')
})

test('payload: ngân sách "any" -> null; ĐGNL không gửi tổ hợp', () => {
  const p = toConsultationPayload({ ...preferences, budget: 'any', method: 'competency_assessment', score: '900' }, { ranked: [] })
  assert.equal(p.criteria.maxTuition, null)
  assert.equal(p.criteria.combination, undefined)
  assert.deepEqual(p.results, [])
})

test('describeCriteria: nhãn tiếng Việt, số có dấu phẩy thập phân, bỏ tiêu chí "không quan trọng"', () => {
  assert.deepEqual(
    describeCriteria({ majorLabel: 'CNTT', method: 'high_school_exam', combination: 'A00', score: 25.5, maxTuition: 40000000, institutionType: 'any', vnuhcm: 'only' }),
    ['CNTT', 'Điểm THPT A00: 25,5/30', 'Học phí ≤ 40 tr/năm', 'Chỉ trường thuộc ĐHQG'],
  )
  assert.deepEqual(describeCriteria({ majorCode: '7480201', method: 'competency_assessment', score: 950, district: 'Quận 10', institutionType: 'public' }),
    ['Mã ngành 7480201', 'ĐGNL ĐHQG-HCM: 950/1200', 'Quận 10', 'Công lập'])
})
