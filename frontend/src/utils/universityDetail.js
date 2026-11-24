import { admissionKind, hasTrustedSource, verifiedMajor } from './universityDetailPolicy'
import { hcmutDetailData } from './hcmutDetail.js'

export const MISSING = 'Chưa có dữ liệu'
export const asArray = (value) => Array.isArray(value) ? value.filter((x) => x && typeof x === 'object') : []
export const text = (value) => typeof value === 'string' && value.trim() ? value.trim() : null
export const validNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0
const UNITS = { year: 'năm', semester: 'học kỳ', credit: 'tín chỉ', program: 'toàn khóa' }

export function feeText(fee) {
  if (!fee || !validNumber(fee.amountMin) || !UNITS[fee.unit]) return MISSING
  const amount = (n) => n.toLocaleString('vi-VN')
  const range = validNumber(fee.amountMax) && fee.amountMax !== fee.amountMin ? `–${amount(fee.amountMax)}` : ''
  const prefix = !validNumber(fee.amountMax) ? 'Từ ' : ''
  return `${prefix}${amount(fee.amountMin)}${range} đ/${UNITS[fee.unit]}`
}

export function detailData(u) {
  const hcmut = hcmutDetailData(u)
  if (hcmut) return hcmut
  const rawMajors = asArray(u.majors).filter((m) => text(m.code) && text(m.name))
  const majors = [...new Map(rawMajors.filter((m) => verifiedMajor(u, m)).map((m) => [m.code, m])).values()]
  const codes = new Set(majors.map((m) => m.code))
  const admissions = asArray(u.admissions).flatMap((a) => {
    const kind = admissionKind(u, a)
    return codes.has(a.majorCode) && kind && Number.isInteger(a.year) && a.year >= 1900 &&
      validNumber(a.score) && validNumber(a.scale) && a.scale > 0 && a.score <= a.scale ? [{ ...a, kind }] : []
  })
  const tuition = asArray(u.tuition).filter((t) =>
    hasTrustedSource(u, t.sourceUrl) && validNumber(t.amountMin) &&
    // DATA_NOTES ghi năm học UMP là giả định, chưa xác minh trực tiếp.
    u.slug !== 'y-duoc-tphcm' &&
    (t.amountMax == null || (validNumber(t.amountMax) && t.amountMax >= t.amountMin)) &&
    UNITS[t.unit] && /^\d{4}-\d{4}$/.test(t.academicYear || '') && (!t.majorCode || codes.has(t.majorCode))
  )
  const years = [...new Set(tuition.map((t) => t.academicYear))].sort().reverse()
  const annual = tuition.filter((t) => t.unit === 'year' && t.academicYear === years[0])
  const annualMinimum = annual.length ? annual.reduce((min, t) => t.amountMin < min.amountMin ? t : min) : null
  // Mỗi phương thức/năm/thang điểm có một mức thấp nhất riêng; không gộp thang điểm.
  const grouped = new Map()
  for (const a of admissions) {
    const key = `${a.kind.key}|${a.year}|${a.scale}`
    if (!grouped.has(key) || a.score < grouped.get(key).score) grouped.set(key, a)
  }
  const methods = [...new Map(admissions.map((a) => [`${a.kind.key}|${a.year}|${a.scale}`, {
    label: a.kind.label, year: a.year, scale: a.scale, sourceUrl: a.sourceUrl,
  }])).values()]
  return { majors, admissions, tuition, annualMinimum, minimumScores: [...grouped.values()], methods,
    hiddenAdmissions: asArray(u.admissions).length - admissions.length,
    hiddenMajors: rawMajors.length - majors.length,
    hiddenTuition: asArray(u.tuition).length - tuition.length }
}

export function normalizeSearch(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim()
}
