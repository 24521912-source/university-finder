import { COMPOSITE_SCHOOLS, compositeCandidates } from './composite.js'
import { ADMISSION_SLOPE, ADMISSION_YEAR, ACADEMIC_YEAR, UNCERTAIN_MAJORS, WEIGHTS } from './config.js'

const clamp = (n) => Math.min(100, Math.max(0, n))
const finite = (n) => typeof n === 'number' && Number.isFinite(n)
const money = (n) => `${n.toLocaleString('vi-VN')} đ/năm`
const missing = (text = 'Chưa đủ dữ liệu đã xác minh') => ({ score: null, text, source: null })
const evaluated = (score, text, source) => ({ score, text, source })

// Lọc theo việc trường có thuộc ĐHQG-HCM (seed: belongsToUniversitySystem).
export function matchesVnuhcm(u, choice = 'any') {
  if (choice === 'only') return u.belongsToUniversitySystem === true
  if (choice === 'exclude') return u.belongsToUniversitySystem !== true
  return true
}

// Link https hợp lệ, không chứa tài khoản/mật khẩu.
export function safeUrl(url) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password
  } catch { return false }
}

// Nguồn thuộc tên miền chính thức của trường (university.sourceDomains trong database).
export function trustedSource(u, url) {
  if (!safeUrl(url)) return false
  const host = new URL(url).hostname
  return (Array.isArray(u?.sourceDomains) ? u.sourceDomains : []).some((domain) => typeof domain === 'string' && domain &&
    (host === domain || host.endsWith(`.${domain}`)))
}

export function validatePreferences(p) {
  const errors = {}
  if (!majorCodesOf(p).length) errors.majorCode = 'Hãy chọn ngành muốn học.'
  if (!['high_school_exam', 'competency_assessment'].includes(p.method)) errors.method = 'Hãy chọn phương thức hợp lệ.'
  const scale = p.method === 'high_school_exam' ? 30 : 1200
  if (p.score === '' || !finite(Number(p.score)) || Number(p.score) < 0 || Number(p.score) > scale) errors.score = `Nhập điểm từ 0 đến ${scale}.`
  if (p.method === 'high_school_exam' && !/^[A-Z]\d{2}$/.test(p.combination || '')) errors.combination = 'Nhập tổ hợp hợp lệ, ví dụ A00.'
  if (p.budget !== 'any' && (!finite(Number(p.budget)) || Number(p.budget) <= 0 || Number(p.budget) > 1e10)) errors.budget = 'Nhập trần học phí theo năm hợp lệ.'
  if (!['any', 'public', 'private'].includes(p.institutionType)) errors.institutionType = 'Loại trường không hợp lệ.'
  if (![undefined, 'any', 'only', 'exclude'].includes(p.vnuhcm)) errors.vnuhcm = 'Lựa chọn ĐHQG không hợp lệ.'
  return errors
}

function majorEvidence(u, code) {
  if ((UNCERTAIN_MAJORS[u.slug] || []).includes(code)) return null
  // Chỉ chấp nhận ngành có bản ghi mã ngành kèm nguồn chính thức trong seed.
  // Nguồn điểm tổng hợp vẫn có thể chứng minh trường đào tạo ngành, không chứng minh
  // điểm đó có thể so với điểm THPT. Hai quyết định được kiểm tra độc lập.
  return [...(u.admissions || []), ...(u.tuition || [])]
    .find((item) => item.majorCode === code && trustedSource(u, item.sourceUrl))?.sourceUrl || null
}

function admissionCriterion(u, p) {
  const scale = p.method === 'high_school_exam' ? 30 : 1200
  if (!(u.admissions || []).some((a) => a.verifiedForAI === true && a.method === p.method && a.year === ADMISSION_YEAR)) {
    return missing('Chưa có điểm riêng đã xác minh đúng phương thức và năm tham chiếu.')
  }
  if (/^(721|71402|78103|7580101)/.test(p.majorCode) || (p.method === 'high_school_exam' && !/^[ABCDX]\d{2}$/.test(p.combination))) return missing('Chưa xác minh được điều kiện năng khiếu / môn thành phần để so điểm ngành và tổ hợp này.')
  // Chỉ so với dòng điểm chuẩn admin đã đánh dấu "Đã xác minh cho AI": đúng phương thức, năm, thang điểm,
  // chương trình chuẩn, nguồn rõ ràng. Dòng chưa đánh dấu vẫn hiện ở trang chi tiết nhưng không dùng để so.
  const records = (u.admissions || []).filter((a) =>
    a.verifiedForAI === true && a.majorCode === p.majorCode && a.method === p.method && a.year === ADMISSION_YEAR &&
    a.scale === scale && safeUrl(a.sourceUrl) && finite(a.score) && a.score >= 0 && a.score <= scale &&
    (p.method !== 'high_school_exam' || a.combinations?.includes(p.combination))
  )
  if (records.length !== 1) return missing('Chưa có một bản ghi điểm chuẩn phù hợp, không mơ hồ về chương trình / tổ hợp.')
  const a = records[0]
  const delta = Number(p.score) - a.score
  return evaluated(clamp(50 + ADMISSION_SLOPE * delta / scale),
    `${p.method === 'high_school_exam' ? `THPT ${p.combination}` : 'ĐGNL ĐHQG-HCM'} ${a.year}: ${a.score}/${scale}; điểm bạn nhập ${p.score}, chênh lệch ${delta.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}. ${a.program || 'Chương trình chuẩn'}. ${a.aiNote ? `${a.aiNote} ` : ''}Chỉ tham khảo lịch sử.`, a.sourceUrl)
}

function tuitionCriterion(u, p) {
  if (p.budget === 'any') return missing('Bạn không ưu tiên học phí; không tham gia tính điểm.')
  // Không gán học phí một nhóm ngành cho toàn trường. Chỉ dùng phí gắn mã ngành,
  // hoặc một mức chuẩn duy nhất ghi rõ áp dụng cả trường, không có ghi chú giới hạn.
  const standard = (t) => /^(Chương trình chuẩn|Chính quy|Chương trình tiếng Việt \(chuẩn\)|Sư phạm \(đào tạo giáo viên\))$/.test(t.program || '')
  const records = (u.tuition || []).filter((t) =>
    t.academicYear === ACADEMIC_YEAR && t.unit === 'year' && standard(t) &&
    trustedSource(u, t.sourceUrl) && finite(t.amountMin) && finite(t.amountMax) &&
    t.amountMin >= 0 && t.amountMax >= t.amountMin &&
    (t.majorCode === p.majorCode || (!t.majorCode && u.slug === 'kinh-te-luat-dhqg'))
  )
  if (records.length !== 1) return missing('Chưa có học phí chuẩn theo năm, đúng ngành và nguồn rõ ràng; không quy đổi từ học kỳ / tín chỉ / toàn khóa.')
  const t = records[0]
  return evaluated(t.amountMax === 0 ? 100 : Math.min(100, Number(p.budget) / t.amountMax * 100),
    `${money(t.amountMin)}${t.amountMax !== t.amountMin ? ` – ${money(t.amountMax)}` : ''}; ${t.academicYear}, ${t.program}. ${t.note || ''} Ngân sách: ${money(Number(p.budget))}.`, t.sourceUrl)
}

// Mã ngành người dùng chọn: một nhóm (majorCodes) hoặc một ngành (majorCode).
export function majorCodesOf(p) {
  const list = Array.isArray(p.majorCodes) && p.majorCodes.length ? p.majorCodes : (p.majorCode ? [p.majorCode] : [])
  return [...new Set(list.map(String))]
}

// Chấm theo quận của địa chỉ trụ sở trong seed: đúng quận 100, khác quận 0.
function geographyCriterion(u, p) {
  if (!p.district || p.district === 'any') return missing('Bạn không ưu tiên khu vực; không tham gia tính điểm.')
  const district = u.address?.district
  if (!district) return missing('Chưa có địa chỉ trường trong dữ liệu.')
  const same = district === p.district
  return evaluated(same ? 100 : 0, `Trụ sở tại ${district}${same ? ', đúng khu vực bạn chọn' : `, khác ${p.district}`}. Tính theo địa chỉ trụ sở; ngành có thể học ở cơ sở khác.`, null)
}

function compareResults(a, b) {
  return (b.score ?? -1) - (a.score ?? -1) || b.coverage - a.coverage || a.name.localeCompare(b.name, 'vi') || String(a.majorCode).localeCompare(String(b.majorCode))
}

function evaluateMajor(u, base, major, weights, totalWeight) {
  const p = { ...base, majorCode: major?.code ?? base.majorCode }
  const source = major && majorEvidence(u, major.code)
  const criteria = {
    major: source ? evaluated(100, `${major.name} (${major.code}) — có mã ngành trong nguồn của trường.`, source) : missing('Chưa xác minh được ngành phù hợp từ nguồn đủ tin cậy.'),
    admission: source ? admissionCriterion(u, p) : missing(),
    tuition: source ? tuitionCriterion(u, p) : missing(),
    geography: geographyCriterion(u, p),
  }
  for (const k of Object.keys(criteria)) if (!(weights[k] > 0)) criteria[k] = missing('Bạn chọn không quan tâm tiêu chí này; không tham gia tính điểm.')
  const keys = Object.keys(criteria).filter((k) => criteria[k].score !== null && weights[k] > 0)
  const usedWeight = keys.reduce((sum, k) => sum + weights[k], 0)
  const canRank = keys.includes('major') && keys.length >= 2
  return {
    slug: u.slug, name: u.name, major: major?.name || null, majorCode: major?.code || null, criteria,
    score: canRank ? Math.round(keys.reduce((sum, k) => sum + criteria[k].score * weights[k], 0) / usedWeight * 10) / 10 : null,
    coverage: Math.round(usedWeight / totalWeight * 100), usedWeight, totalWeight,
    evaluatedCount: keys.length,
    reason: !source ? 'Cần xác minh ngành đào tạo.' : 'Đã xác định ngành; cần thêm ít nhất một tiêu chí hợp lệ để xếp hạng.',
  }
}

export function recommend(universities, preferences, weights = WEIGHTS) {
  if (Object.keys(validatePreferences(preferences)).length) throw new Error('Thông tin tư vấn chưa hợp lệ.')
  // Trọng số 0 = người dùng không quan tâm tiêu chí đó. Ngành luôn phải được tính.
  if (Object.keys(WEIGHTS).some((key) => !finite(weights[key]) || weights[key] < 0) || !(weights.major > 0)) throw new Error('Trọng số không hợp lệ: không âm, và ngành phải lớn hơn 0.')
  const codes = majorCodesOf(preferences)
  const p = { ...preferences, majorCode: codes[0], majorCodes: codes }
  const ranked = []
  const needsData = []
  let excluded = 0
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)
  for (const u of universities) {
    // Trường xét tuyển tổng hợp có thang/công thức riêng: hiển thị ở mục riêng, không xếp chung.
    if (COMPOSITE_SCHOOLS[u.slug]) continue
    if (!matchesVnuhcm(u, p.vnuhcm)) { excluded++; continue }
    if (p.institutionType !== 'any' && u.institutionType !== p.institutionType) { excluded++; continue }
    const matched = (u.majors || []).filter((m) => codes.includes(m.code))
    if (!matched.length && u.majors?.length) { excluded++; continue }
    // Chấm từng ngành trong nhóm mà trường có; giữ ngành tốt nhất làm đại diện.
    const candidates = (matched.length ? matched : [null]).map((major) => evaluateMajor(u, p, major, weights, totalWeight))
    candidates.sort(compareResults)
    const best = candidates[0]
    best.relatedMajors = matched.filter((m) => m.code !== best.majorCode).map((m) => m.name)
    if (best.score !== null) ranked.push(best)
    else needsData.push(best)
  }
  ranked.sort(compareResults)
  return { ranked: ranked.slice(0, 5), needsData, rankedCount: ranked.length, excluded, composite: compositeCandidates(universities, p) }
}
