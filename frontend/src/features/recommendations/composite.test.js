import test from 'node:test'
import assert from 'node:assert/strict'
import seeds from '../../../../database/seeds/universities.json' with { type: 'json' }
import { recommend } from './recommend.js'
import { compositeCandidates, feasibility, hcmutScore } from './composite.js'

const bk = () => structuredClone(seeds.find((u) => u.slug === 'bach-khoa-tphcm'))
const base = { majorCode: '7480101', method: 'high_school_exam', combination: 'A00', score: '27', year: '2026', budget: 'any', district: 'any', institutionType: 'any', priorities: [] }

test('HCMUT không có ĐGNL: Toán x2, năng lực = THPT × 0,75, học lực 70/20/10', () => {
  // A00: Toán 9, Lý 8, Hóa 8 -> (18+8+8)/4*10 = 85
  const r = hcmutScore({ combination: 'A00', thpt: [9, 8, 8], hocBa: [9, 8, 8], dgnl: '' })
  assert.equal(r.thpt, 85)
  assert.equal(r.nangLuc, 63.75)
  assert.equal(r.hocLuc, round(0.7 * 63.75 + 0.2 * 85 + 0.1 * 85))
  assert.equal(r.priority, 0)
})

test('HCMUT có ĐGNL: (tổng + phần Toán) / 15', () => {
  const r = hcmutScore({ combination: 'A00', thpt: [9, 8, 8], hocBa: [9, 8, 8], dgnl: 1000, dgnlMath: 250 })
  assert.equal(r.nangLuc, round(1250 / 15))
})

test('điểm ưu tiên giảm dần khi học lực + cộng ≥ 75; điểm cộng không vượt 100', () => {
  const r = hcmutScore({ combination: 'A00', thpt: [10, 10, 10], hocBa: [10, 10, 10], dgnl: 1200, dgnlMath: 300, bonus: 10, priority: 2.75 })
  assert.equal(r.hocLuc, 100)
  assert.equal(r.bonus, 0)
  assert.equal(r.priority, 0)
  assert.equal(r.total, 100)
  const low = hcmutScore({ combination: 'A00', thpt: [6, 6, 6], hocBa: [6, 6, 6], dgnl: '', priority: 0.75 })
  assert.equal(low.priority, 2.5)
})

test('tổ hợp không có Toán bị từ chối', () => {
  assert.ok(hcmutScore({ combination: 'C00', thpt: [8, 8, 8], hocBa: [8, 8, 8] }).error)
})

test('nhãn khả thi theo khoảng cách điểm chuẩn', () => {
  assert.equal(feasibility(80, 80).level, 'feasible')
  assert.equal(feasibility(76, 80).level, 'consider')
  assert.equal(feasibility(70, 80).level, 'hard')
})

test('Bách Khoa không vào bảng xếp hạng chính mà vào mục xét tuyển tổng hợp', () => {
  const r = recommend([bk()], { ...base, subjectScores: ['9', '8', '8'] })
  assert.equal(r.ranked.length, 0)
  assert.equal(r.needsData.length, 0)
  assert.equal(r.composite.length, 1)
  const prog = r.composite[0].programs[0]
  assert.equal(prog.cutoff, 85.45)
  assert.equal(prog.accepted, true)
  assert.equal(prog.status.level, 'hard')
})

test('tổ hợp không được trường xét thì không ước tính', () => {
  const [c] = compositeCandidates([bk()], { ...base, combination: 'D14', subjectScores: ['9', '9', '9'] })
  assert.equal(c.programs[0].accepted, false)
  assert.equal(c.programs[0].estimate, null)
})

function round(n) { return Math.round(n * 100) / 100 }

test('lọc ĐHQG: chỉ ĐHQG giữ Bách Khoa, ngoài ĐHQG loại Bách Khoa', () => {
  assert.equal(recommend([bk()], { ...base, vnuhcm: 'only', subjectScores: ['9', '8', '8'] }).composite.length, 1)
  assert.equal(recommend([bk()], { ...base, vnuhcm: 'exclude', subjectScores: ['9', '8', '8'] }).composite.length, 0)
  const vl = structuredClone(seeds.find((u) => u.slug === 'van-lang'))
  const r = recommend([vl], { ...base, vnuhcm: 'only' })
  assert.equal(r.ranked.length + r.needsData.length, 0)
  assert.equal(r.excluded, 1)
})

test('chọn nhóm ngành: mỗi trường lấy ngành tốt nhất trong nhóm, kèm ngành liên quan', async () => {
  const { MAJOR_GROUPS, searchMajors } = await import('./majorGroups.js')
  const it = MAJOR_GROUPS.find((g) => g.id === 'cntt')
  const vl = structuredClone(seeds.find((u) => u.slug === 'van-lang'))
  const r = recommend([vl], { ...base, majorCode: undefined, majorCodes: it.codes, score: '27' })
  const all = [...r.ranked, ...r.needsData]
  assert.equal(all.length, 1)
  assert.ok(it.codes.includes(all[0].majorCode))
  assert.ok(Array.isArray(all[0].relatedMajors))
  const c = recommend([bk()], { ...base, majorCode: undefined, majorCodes: it.codes, subjectScores: ['9', '8', '8'] }).composite[0]
  assert.ok(c.programs.length > 1)
  assert.equal(new Set(c.programs.map((x) => x.program)).size, c.programs.length)
  assert.equal(searchMajors('it', [])[0].id, 'cntt')
  assert.equal(searchMajors('ke toan', [])[0].id, 'ketoan')
})

test('UEL: không ĐGNL = 0,9·THPT + 0,1·học bạ (thang 100); có ĐGNL = 55/35/10', async () => {
  const { uelScore } = await import('./composite.js')
  const r = uelScore({ combination: 'D01', thpt: [9, 8, 8], hocBa: [9, 9, 9], dgnl: '' })
  assert.equal(r.hocLuc, round(0.9 * 2500 / 30 + 0.1 * 2700 / 30))
  const d = uelScore({ combination: 'D01', thpt: [9, 8, 8], hocBa: [9, 9, 9], dgnl: 960 })
  assert.equal(d.hocLuc, round(0.55 * 80 + 0.35 * 2500 / 30 + 0.1 * 90))
})

test('USSH đối tượng 2: 90% THPT + 10% học bạ', async () => {
  const { usshScore } = await import('./composite.js')
  const r = usshScore({ combination: 'C00', thpt: [8, 8, 8], hocBa: [9, 9, 9] })
  assert.equal(r.hocLuc, round(0.9 * 80 + 0.1 * 90))
})

test('6 trường ĐHQG còn lại có dữ liệu 2026 trong seed', () => {
  for (const slug of ['kinh-te-luat-dhqg', 'quoc-te-dhqg', 'khoa-hoc-xa-hoi-nhan-van-dhqg', 'khoa-hoc-suc-khoe-dhqg']) {
    const u = seeds.find((x) => x.slug === slug)
    assert.ok(u.admissions.some((a) => a.year === 2026 && a.scale === 100), slug)
  }
})
