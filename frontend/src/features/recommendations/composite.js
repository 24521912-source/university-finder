// Trường xét tuyển tổng hợp (thang 100): không quy đổi điểm chuẩn về thang 30,
// mà tính điểm của thí sinh theo công thức riêng của trường rồi so trên cùng thang.
import { COMBINATIONS } from './config.js'
import { majorCodesOf, matchesVnuhcm } from './recommend.js'

const round2 = (n) => Math.round(n * 100) / 100
const finite = (n) => typeof n === 'number' && Number.isFinite(n)
const inRange = (v, max) => v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= max
const sum = (arr) => arr.reduce((s, v) => s + Number(v), 0)

// Ngưỡng nhãn ước tính so với điểm chuẩn (điểm, thang 100).
export const FEASIBLE_MARGIN = 5

// ---- Phần chung theo quy định ĐHQG-HCM 2026 ----
// Điểm cộng tối đa 10 và không đẩy tổng vượt 100; điểm ưu tiên (thang 30) quy đổi ×10/3,
// giảm dần khi học lực + điểm cộng ≥ 75: (100 − HL − cộng) / 25 × ưu tiên quy đổi.
function finish(hocLuc, bonusRaw, priorityRaw) {
  const bonus = hocLuc + bonusRaw >= 100 ? Math.max(0, 100 - hocLuc) : bonusRaw
  const priorityConverted = priorityRaw / 3 * 10
  const base = hocLuc + bonus
  const priority = base < 75 ? priorityConverted : round2(Math.max(0, (100 - base) / 25 * priorityConverted))
  return { bonus: round2(bonus), priority: round2(priority), total: round2(Math.min(100, base + priority)) }
}

function commonInput(input, { requireMath = false, dgnlMath = false } = {}) {
  const subjects = COMBINATIONS[input.combination]
  if (!subjects) return { error: 'Hãy chọn tổ hợp trong danh mục.' }
  if (requireMath && !subjects.includes('Toán')) return { error: 'Tổ hợp phải có môn Toán.' }
  if (!input.thpt?.every((v) => inRange(v, 10))) return { error: 'Nhập đủ điểm thi THPT 3 môn (0–10).' }
  if (!input.hocBa?.every((v) => inRange(v, 10))) return { error: 'Nhập đủ điểm học bạ 3 môn (0–10).' }
  const hasDgnl = input.dgnl !== '' && input.dgnl !== undefined && input.dgnl !== null
  if (hasDgnl && !inRange(input.dgnl, 1200)) return { error: 'Điểm ĐGNL từ 0 đến 1200.' }
  if (hasDgnl && dgnlMath && (!inRange(input.dgnlMath, 300) || Number(input.dgnlMath) > Number(input.dgnl))) return { error: 'Nhập điểm phần Toán ĐGNL (0–300).' }
  const bonusRaw = input.bonus === '' || input.bonus === undefined ? 0 : Number(input.bonus)
  const priorityRaw = input.priority === '' || input.priority === undefined ? 0 : Number(input.priority)
  if (!inRange(bonusRaw, 10)) return { error: 'Điểm cộng thành tích từ 0 đến 10.' }
  if (!inRange(priorityRaw, 2.75)) return { error: 'Điểm ưu tiên (thang 30) từ 0 đến 2,75.' }
  return { subjects, hasDgnl, bonusRaw, priorityRaw }
}

// ---- HCMUT 2026 (đối tượng 2.1 / 2.2) ----
// Mỗi thành phần: 3 môn của tổ hợp, Toán nhân 2, chia 4, nhân 10 -> thang 100.
function mathWeighted(scores, subjects) {
  const mathIndex = subjects.indexOf('Toán')
  return scores.reduce((s, v, i) => s + Number(v) * (i === mathIndex ? 2 : 1), 0) / 4 * 10
}

export function hcmutScore(input) {
  const c = commonInput(input, { requireMath: true, dgnlMath: true })
  if (c.error) return c
  const thpt = mathWeighted(input.thpt, c.subjects)
  const hocBa = mathWeighted(input.hocBa, c.subjects)
  // Có ĐGNL: (tổng + phần Toán) / 15 (thang 1500 -> 100). Không có: THPT quy đổi × 0,75.
  const nangLuc = c.hasDgnl ? (Number(input.dgnl) + Number(input.dgnlMath)) / 15 : thpt * 0.75
  const hocLuc = nangLuc * 0.7 + thpt * 0.2 + hocBa * 0.1
  const f = finish(hocLuc, c.bonusRaw, c.priorityRaw)
  return {
    hasDgnl: c.hasDgnl, thpt: round2(thpt), hocBa: round2(hocBa), nangLuc: round2(nangLuc), hocLuc: round2(hocLuc), ...f,
    steps: [
      ['Điểm thi THPT quy đổi (Toán ×2)', thpt],
      ['Điểm học bạ quy đổi (Toán ×2)', hocBa],
      [c.hasDgnl ? 'Điểm năng lực = (ĐGNL + phần Toán) / 15' : 'Điểm năng lực = THPT quy đổi × 0,75 (không có ĐGNL)', nangLuc],
      ['Điểm học lực = 70% năng lực + 20% THPT + 10% học bạ', hocLuc],
    ],
  }
}

// ---- UEL 2026 (đề án, α = 100%, β = 55/35/10) ----
// X = ĐGNL × 100/1200; Y = tổng 3 môn thi × 100/30; Z = tổng TB học bạ 3 môn × 100/30.
// Có ĐGNL: 0,55X + 0,35Y + 0,1Z. Không có ĐGNL: X thay bằng Y·α -> 0,9Y + 0,1Z.
export function uelScore(input) {
  const c = commonInput(input)
  if (c.error) return c
  const y = sum(input.thpt) * 100 / 30
  const z = sum(input.hocBa) * 100 / 30
  const x = c.hasDgnl ? Number(input.dgnl) * 100 / 1200 : y
  const hocLuc = 0.55 * x + 0.35 * y + 0.1 * z
  const f = finish(hocLuc, c.bonusRaw, c.priorityRaw)
  return {
    hasDgnl: c.hasDgnl, hocLuc: round2(hocLuc), ...f,
    steps: [
      ['Điểm thi THPT quy đổi = tổng 3 môn × 100/30', y],
      ['Điểm học bạ quy đổi = tổng 3 môn × 100/30', z],
      [c.hasDgnl ? 'Điểm ĐGNL quy đổi = ĐGNL × 100/1200' : 'Không có ĐGNL: dùng điểm THPT quy đổi thay', x],
      ['Điểm học lực = 55% ĐGNL + 35% THPT + 10% học bạ', hocLuc],
    ],
  }
}

// ---- USSH 2026 (KHXH&NV), đối tượng 2: thí sinh không có ĐGNL ----
// Trường công bố điểm chuẩn riêng theo đối tượng; dữ liệu đang dùng cột "THPT + học bạ".
// ĐHL1 = 90% THPT quy đổi + 10% học bạ quy đổi; THPT, học bạ = tổng 3 môn × 100/30.
export function usshScore(input) {
  const c = commonInput({ ...input, dgnl: '' })
  if (c.error) return c
  const y = sum(input.thpt) * 100 / 30
  const z = sum(input.hocBa) * 100 / 30
  const hocLuc = 0.9 * y + 0.1 * z
  const f = finish(hocLuc, c.bonusRaw, c.priorityRaw)
  return {
    hasDgnl: false, hocLuc: round2(hocLuc), ...f,
    steps: [
      ['Điểm thi THPT quy đổi = tổng 3 môn × 100/30', y],
      ['Điểm học bạ quy đổi = tổng 3 môn × 100/30', z],
      ['Điểm học lực = 90% THPT + 10% học bạ', hocLuc],
    ],
  }
}

export const FORMULAS = {
  hcmut: { compute: hcmutScore, dgnlMath: true, notes: 'Toán nhân 2 ở mọi thành phần. Không có ĐGNL thì điểm năng lực = THPT quy đổi × 0,75.' },
  uel: { compute: uelScore, dgnlMath: false, notes: 'Không có ĐGNL thì phần ĐGNL được thay bằng điểm THPT quy đổi (α = 100% năm 2026).' },
  ussh: { compute: usshScore, dgnl: false, dgnlMath: false, notes: 'Tính theo nhóm thí sinh không dùng ĐGNL (THPT + học bạ), so với điểm chuẩn riêng của nhóm này. Trọng số 90/10 là mức trường công bố dự kiến.' },
}

export const COMPOSITE_SCHOOLS = {
  'bach-khoa-tphcm': {
    year: 2026,
    scale: 100,
    formula: 'hcmut',
    formulaSources: [
      'https://hcmut.edu.vn/tuyen-sinh/dai-hoc-chinh-quy/phuong-thuc-tuyen-sinh/xet-tuyen-tong-hop-2026',
      'https://diemthi.tuyensinh247.com/tin/cach-tinh-diem-xet-tuyen-dai-hoc-bach-khoa-dhqg-tphcm-hcmut-2026-504.html',
    ],
  },
  'quoc-te-dhqg': {
    year: 2026,
    scale: 100,
    // Đề án IU 2026 chỉ nêu dạng k1·THPT + k2·ĐGNL + k3·học bạ, chưa tìm được hệ số -> chưa ước tính.
    formula: null,
    formulaSources: ['https://tuyensinh.hcmiu.edu.vn/wp-content/uploads/2026/04/0420_QSQ_Thong-tin-tuyen-sinh-2026.pdf'],
  },
  'khoa-hoc-xa-hoi-nhan-van-dhqg': {
    year: 2026,
    scale: 100,
    formula: 'ussh',
    formulaSources: [
      'https://tuoitre.vn/khong-thi-danh-gia-nang-luc-co-duoc-xet-tuyen-vo-truong-dh-khoa-hoc-xa-hoi-va-nhan-van-20260224114759718.htm',
      'https://tienphong.vn/bao-chi-mat-ngoi-dau-diem-chuan-tai-truong-dh-khoa-hoc-xa-hoi-va-nhan-van-tphcm-post1866740.tpo',
    ],
  },
  'khoa-hoc-suc-khoe-dhqg': {
    year: 2026,
    scale: 100,
    // Chưa xác minh được trọng số THPT / ĐGNL / học bạ năm 2026 -> chỉ hiện điểm chuẩn.
    formula: null,
    formulaSources: ['https://diemthi.tuyensinh247.com/diem-chuan/dai-hoc-khoa-hoc-suc-khoe-dhqg-tphcm-QSY.html'],
  },
  'kinh-te-luat-dhqg': {
    year: 2026,
    scale: 100,
    formula: 'uel',
    formulaSources: [
      'https://dcdn.dantri.com.vn/2026/02/15/thong-tin-tuyen-sinh-uel-2026-1771150334010.docx',
      'https://tuyensinh.uel.edu.vn/truong-dai-hoc-kinh-te-luat-cong-bo-ket-qua-tuyen-sinh-dai-hoc-chinh-quy-nam-2026/',
    ],
  },
}

const safeUrl = (url) => {
  try { return new URL(url).protocol === 'https:' } catch { return false }
}

export function feasibility(estimate, cutoff) {
  if (estimate >= cutoff) return { level: 'feasible', label: 'Khả thi' }
  if (estimate >= cutoff - FEASIBLE_MARGIN) return { level: 'consider', label: 'Cần cân nhắc' }
  return { level: 'hard', label: 'Khó' }
}

/**
 * Danh sách chương trình chuẩn của trường xét tuyển tổng hợp có ngành đã chọn,
 * kèm ước tính sơ bộ từ điểm 3 môn (giả định: không có ĐGNL, học bạ = điểm thi, không điểm cộng/ưu tiên).
 */
export function compositeCandidates(universities, p) {
  const out = []
  const codes = majorCodesOf(p)
  for (const u of universities) {
    const cfg = COMPOSITE_SCHOOLS[u.slug]
    if (!cfg) continue
    if (p.institutionType !== 'any' && u.institutionType !== p.institutionType) continue
    if (!matchesVnuhcm(u, p.vnuhcm)) continue
    const records = (u.admissions || []).filter((a) =>
      codes.includes(a.majorCode) && a.year === cfg.year && a.scale === cfg.scale &&
      // Admin đánh dấu "Đã xác minh cho AI" cho dòng chương trình chuẩn, nguồn rõ ràng.
      a.verifiedForAI === true && finite(a.score) && a.score >= 0 && a.score <= cfg.scale && safeUrl(a.sourceUrl))
    if (!records.length) continue
    const nameOf = (code) => u.majors?.find((m) => m.code === code)?.name || code
    const scores = p.subjectScores || []
    const formula = FORMULAS[cfg.formula]
    const canEstimate = formula && p.method === 'high_school_exam' && scores.length === 3 && scores.every((v) => inRange(v, 10))
    // Một mã xét tuyển có thể gồm nhiều mã ngành (cùng điểm chuẩn): gộp theo chương trình.
    const byProgram = new Map()
    for (const a of records) {
      const cur = byProgram.get(a.program)
      if (cur) { if (!cur.majors.includes(nameOf(a.majorCode))) cur.majors.push(nameOf(a.majorCode)) }
      else byProgram.set(a.program, { a, majors: [nameOf(a.majorCode)] })
    }
    const programs = [...byProgram.values()].map(({ a, majors }) => {
      const accepted = p.method !== 'high_school_exam' || (a.combinations || []).includes(p.combination)
      let estimate = null
      let status = null
      if (accepted && canEstimate) {
        const r = formula.compute({ combination: p.combination, thpt: scores, hocBa: scores, dgnl: '' })
        if (!r.error) { estimate = r.total; status = feasibility(r.total, a.score) }
      }
      return { program: a.program, majors, cutoff: a.score, combinations: a.combinations || [], accepted, estimate, status, source: a.sourceUrl }
    })
    programs.sort((x, y) => y.cutoff - x.cutoff)
    out.push({ slug: u.slug, name: u.name, formula: cfg.formula, major: [...new Set(programs.flatMap((x) => x.majors))].join(', '), year: cfg.year, programs, formulaSources: cfg.formulaSources })
  }
  return out
}
