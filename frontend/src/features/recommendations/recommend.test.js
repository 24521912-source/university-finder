import test from 'node:test'
import assert from 'node:assert/strict'
import seeds from '../../../../database/seeds/universities.json' with { type: 'json' }
import { recommend, trustedSource, validatePreferences } from './recommend.js'
import { DEFAULT_PRIORITIES, WEIGHTS, weightsFromPriorities } from './config.js'

const preferences = { majorCode: '7420101', method: 'high_school_exam', combination: 'A00', score: '25', year: '2026', budget: '40000000', district: 'any', institutionType: 'any', priorities: [] }
const school = (slug) => structuredClone(seeds.find((u) => u.slug === slug))

test('học phí đúng ngành từ seed được chấm; tiêu chí thiếu không gán 0', () => {
  const { ranked } = recommend([school('khoa-hoc-tu-nhien-dhqg')], preferences)
  assert.equal(ranked.length, 1)
  assert.equal(ranked[0].score, 100)
  assert.equal(ranked[0].coverage, 53) // (ngành 30 + học phí 15) / 85
  assert.equal(ranked[0].criteria.tuition.score, 100)
  assert.deepEqual(Object.keys(ranked[0].criteria), ['major', 'admission', 'tuition', 'geography'])
  for (const key of ['admission', 'geography']) assert.equal(ranked[0].criteria[key].score, null)
})

test('chỉ có ngành thì chuyển sang Cần bổ sung dữ liệu, không có điểm tổng', () => {
  const { ranked, needsData } = recommend([school('khoa-hoc-tu-nhien-dhqg')], { ...preferences, budget: 'any' })
  assert.equal(ranked.length, 0)
  assert.equal(needsData[0].score, null)
  assert.equal(needsData[0].coverage, 35) // 30 / 85
  assert.equal(needsData[0].criteria.geography.score, null)
})

test('khu vực: đúng quận trụ sở 100, khác quận 0', () => {
  const u = school('khoa-hoc-tu-nhien-dhqg')
  const p = { ...preferences, budget: 'any' }
  assert.equal(recommend([u], { ...p, district: u.address.district }).ranked[0].criteria.geography.score, 100)
  assert.equal(recommend([u], { ...p, district: 'Quận Không Tồn Tại' }).ranked[0].criteria.geography.score, 0)
})

test('mức ưu tiên 1–5 đổi ra trọng số; không quan tâm thì bỏ khỏi phép tính', () => {
  assert.deepEqual(weightsFromPriorities({ major: 1, admission: 2, tuition: 3, geography: 0 }),
    { major: 1, admission: 0.75, tuition: 0.55, geography: 0 })
  const u = school('khoa-hoc-tu-nhien-dhqg')
  const p = { ...preferences, budget: '20000000', district: 'Quận Không Tồn Tại' }
  const ignored = recommend([u], p, weightsFromPriorities({ ...DEFAULT_PRIORITIES, geography: 0 })).ranked[0]
  assert.equal(ignored.criteria.geography.score, null)
  const tuitionScore = 20000000 / 38600000 * 100
  assert.equal(ignored.score, Math.round((100 * 1 + tuitionScore * 0.55) / 1.55 * 10) / 10)
  assert.throws(() => recommend([u], p, weightsFromPriorities({ ...DEFAULT_PRIORITIES, major: 0 })))
})

test('không dùng điểm tổng hợp dù gắn nhãn THPT và cùng thang 30', () => {
  const result = recommend([school('khoa-hoc-tu-nhien-dhqg')], preferences).ranked[0]
  assert.equal(result.criteria.admission.score, null)
})

test('mã ngành ánh xạ chưa xác minh không được chấm hoặc xếp hạng', () => {
  const { ranked, needsData } = recommend([school('khoa-hoc-tu-nhien-dhqg')], { ...preferences, majorCode: '7480103' })
  assert.equal(ranked.length, 0)
  assert.equal(needsData[0].criteria.major.score, null)
})

test('nguồn thiếu hoặc nguồn thứ cấp không được dùng để chấm', () => {
  const u = school('khoa-hoc-tu-nhien-dhqg')
  for (const a of [...u.admissions, ...u.tuition]) a.sourceUrl = 'https://example.org/unverified'
  const { ranked, needsData } = recommend([u], preferences)
  assert.equal(ranked.length, 0)
  assert.equal(needsData[0].coverage, 0)
  assert.equal(trustedSource(u, 'https://hcmus.edu.vn.attacker.example/'), false)
  assert.equal(trustedSource(u, 'http://hcmus.edu.vn/'), false)
  assert.equal(trustedSource(u, 'https://tuyensinh.hcmus.edu.vn/x'), true)
  assert.equal(trustedSource({ ...u, sourceDomains: [] }, 'https://tuyensinh.hcmus.edu.vn/x'), false)
})

test('điểm chuẩn chỉ được AI dùng khi admin bật verifiedForAI', () => {
  const p = { ...preferences, majorCode: '7480201', combination: 'A00', score: '27' }
  const u = school('cong-nghe-thong-tin-dhqg')
  assert.notEqual(recommend([u], p).ranked[0].criteria.admission.score, null)
  for (const a of u.admissions) a.verifiedForAI = false
  const r = recommend([u], p)
  assert.equal([...r.ranked, ...r.needsData][0].criteria.admission.score, null)
})

test('admin bật verifiedForAI cho trường mới thì AI dùng ngay, không cần sửa code', () => {
  const u = { slug: 'truong-thu', name: 'Trường thử', institutionType: 'public', sourceDomains: ['truongthu.edu.vn'],
    majors: [{ code: '7480201', name: 'Công nghệ thông tin' }], tuition: [],
    admissions: [{ year: 2026, method: 'high_school_exam', majorCode: '7480201', combinations: ['A00'], score: 24, scale: 30,
      sourceUrl: 'https://truongthu.edu.vn/diem-chuan', verifiedForAI: true, aiNote: 'Ghi chú thử.' }] }
  const r = recommend([u], { ...preferences, majorCode: '7480201', combination: 'A00', score: '24', budget: 'any' }).ranked[0]
  assert.equal(r.criteria.admission.score, 50)
  assert.match(r.criteria.admission.text, /Ghi chú thử\./)
})

test('không suy ra học phí theo năm từ học kỳ hoặc dùng phí chương trình khác', () => {
  const u = school('khoa-hoc-tu-nhien-dhqg')
  u.tuition = u.tuition.filter((t) => t.majorCode !== preferences.majorCode || t.program !== 'Chương trình chuẩn')
  const { ranked, needsData } = recommend([u], preferences)
  assert.equal(ranked.length, 0)
  assert.equal(needsData[0].criteria.tuition.score, null)
})

test('thiếu mức tối đa hoặc sai năm học không được tự suy diễn học phí', () => {
  for (const mutate of [(t) => { delete t.amountMax }, (t) => { t.academicYear = '2025-2026' }]) {
    const u = school('khoa-hoc-tu-nhien-dhqg')
    u.tuition.forEach(mutate)
    assert.equal(recommend([u], preferences).ranked.length, 0)
  }
})

test('điểm THPT VLU dùng đúng ngành, tổ hợp, năm, thang; sai điều kiện bị loại', () => {
  const u = school('van-lang')
  const p = { ...preferences, majorCode: '7480201', budget: 'any', score: '16' }
  const a = u.admissions.find((a) => a.majorCode === p.majorCode && a.method === p.method && a.program === 'Standard Program / Global Standard Program')
  assert.ok(a && a.combinations.includes('A00'))
  const r = recommend([u], p).ranked[0]
  assert.equal(r.coverage, 65) // (ngành 30 + điểm 25) / 85
  assert.equal(r.criteria.admission.score, Math.min(100, 50 + 500 * (16 - a.score) / 30))
  for (const patch of [{ combination: 'Z99' }]) {
    assert.equal(recommend([u], { ...p, ...patch }).ranked.length, 0)
  }
  const wrongScale = school('van-lang')
  wrongScale.admissions.forEach((a) => { a.scale = 100 })
  assert.equal(recommend([wrongScale], p).ranked.length, 0)
})

test('THPT và ĐGNL được so riêng trên đúng thang, không chuyển đổi', () => {
  const u = school('van-lang')
  const p = { ...preferences, majorCode: '7480201', method: 'competency_assessment', score: '650', budget: 'any' }
  const a = u.admissions.find((a) => a.majorCode === p.majorCode && a.method === p.method && a.program === 'Standard Program / Global Standard Program')
  const r = recommend([u], p).ranked[0]
  assert.equal(r.criteria.admission.score, Math.min(100, 50 + 500 * (650 - a.score) / 1200))
  assert.match(r.criteria.admission.text, /ĐGNL ĐHQG-HCM/)
  u.admissions = u.admissions.filter((a) => a.method !== p.method)
  assert.equal(recommend([u], p).ranked.length, 0)
})

test('bản ghi trùng mơ hồ không được chọn điểm chuẩn thấp nhất', () => {
  const u = school('van-lang')
  const p = { ...preferences, majorCode: '7480201', budget: 'any' }
  u.admissions.push({ ...u.admissions.find((a) => a.majorCode === p.majorCode && a.method === p.method && a.program === 'Standard Program / Global Standard Program') })
  assert.equal(recommend([u], p).ranked.length, 0)
})

test('bộ lọc loại trường và trường thiếu ngành', () => {
  assert.equal(recommend([school('van-lang')], { ...preferences, institutionType: 'public' }).needsData.length, 0)
  const u = school('van-lang')
  u.majors = []
  const { ranked, needsData } = recommend([u], preferences)
  assert.equal(ranked.length, 0)
  assert.equal(needsData.length, 1)
})

test('trọng số có thể đổi và mẫu số chỉ gồm tiêu chí hợp lệ', () => {
  const p = { ...preferences, budget: '20000000' }
  const weights = { ...WEIGHTS, tuition: 30 }
  const r = recommend([school('khoa-hoc-tu-nhien-dhqg')], p, weights).ranked[0]
  const tuitionScore = 20000000 / 38600000 * 100
  assert.equal(r.score, Math.round((100 * 30 + tuitionScore * 30) / 60 * 10) / 10)
  assert.equal(r.usedWeight, 60)
  assert.equal(r.totalWeight, 100) // 30 + 25 + 30 + 15
  assert.throws(() => recommend([], preferences, { ...WEIGHTS, tuition: -1 }))
})

test('kết quả từ toàn bộ seed được xếp ổn định, tối đa năm, không có điểm giả cho nhóm thiếu', () => {
  const p = { ...preferences, majorCode: '7480201' }
  const a = recommend(seeds, p)
  const b = recommend([...seeds].reverse(), p)
  assert.ok(a.ranked.length <= 5)
  assert.deepEqual(a.ranked.map((r) => r.slug), b.ranked.map((r) => r.slug))
  for (const r of a.ranked) {
    assert.ok(r.score >= 0 && r.score <= 100)
    assert.ok(r.evaluatedCount >= 2)
    assert.equal(r.criteria.major.score, 100)
  }
  assert.ok(a.needsData.every((r) => r.score === null))
})

test('kiểm tra điểm rỗng, NaN, vượt thang và ngân sách không hợp lệ', () => {
  for (const patch of [{ score: '' }, { score: 'NaN' }, { score: '-1' }, { score: '31' }, { budget: '0' }, { budget: '' }, { combination: 'A0' }, { majorCode: '' }]) {
    assert.ok(Object.keys(validatePreferences({ ...preferences, ...patch })).length > 0)
    assert.throws(() => recommend(seeds, { ...preferences, ...patch }))
  }
  assert.deepEqual(validatePreferences({ ...preferences, score: '0' }), {})
  assert.equal(recommend([], preferences).ranked.length, 0)
})
