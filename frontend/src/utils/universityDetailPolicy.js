// Quy tắc hiển thị từ database/seeds/DATA_NOTES.md, không thêm thông tin trường.
// Nguồn tin cậy lấy từ database: university.sourceDomains và admissions[].verifiedForAI.
import { UNCERTAIN_MAJORS } from '../features/recommendations/config'
import { hcmutProfile } from './hcmutDetail.js'

export function safeUrl(value) {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch { return null }
}

// Link thuộc tên miền nguồn chính thức của trường (university.sourceDomains).
export function hasTrustedSource(u, value) {
  const source = safeUrl(value)
  if (!source || !source.startsWith('https:')) return false
  const host = new URL(source).hostname
  return (Array.isArray(u?.sourceDomains) ? u.sourceDomains : [])
    .some((domain) => typeof domain === 'string' && domain && (host === domain || host.endsWith(`.${domain}`)))
}

export function verifiedMajor(u, major) {
  if ((UNCERTAIN_MAJORS[u.slug] || []).includes(major.code)) return false
  return [...(Array.isArray(u.admissions) ? u.admissions : []), ...(Array.isArray(u.tuition) ? u.tuition : [])]
    .some((r) => r && r.majorCode === major.code && hasTrustedSource(u, r.sourceUrl))
}

const COMBINED = {
  'kinh-te-tphcm': { year: 2025, label: 'Điểm quy đổi chung các phương thức' },
  'cong-nghiep-tphcm': { year: 2026, label: 'Xét tuyển kết hợp' },
  'cong-nghe-thong-tin-dhqg': { year: 2026, label: 'Xét tuyển tổng hợp (điểm quy đổi)' },
  'khoa-hoc-tu-nhien-dhqg': { year: 2026, label: 'Xét tuyển tổng hợp (điểm quy đổi)' },
  'su-pham-ky-thuat-tphcm': { year: 2026, label: 'Xét tuyển kết hợp' },
}

export function admissionKind(u, a) {
  if (!hasTrustedSource(u, a.sourceUrl)) return null
  if (u.slug === 'van-lang' && a.program === 'Global Elite Program') return null
  if (u.slug === 'ton-duc-thang' && !/^Tiêu chuẩn:/.test(a.program || '')) return null
  if (a.method === 'high_school_exam' && COMBINED[u.slug]?.year === a.year) {
    return { key: 'combined', label: COMBINED[u.slug].label }
  }
  // Cùng bảng nguồn (link, năm, phương thức) với một dòng admin đã xác minh cho AI -> hiện đúng loại điểm.
  const verifiedTable = (Array.isArray(u.admissions) ? u.admissions : []).some((v) =>
    v?.verifiedForAI === true && v.sourceUrl === a.sourceUrl && v.year === a.year && v.method === a.method)
  if (verifiedTable) {
    if (a.method === 'competency_assessment' && a.scale === 1200) return { key: 'competency', label: 'ĐGNL ĐHQG-HCM' }
    if (a.method === 'high_school_exam' && [30, 35, 40].includes(a.scale)) return { key: 'thpt', label: 'Thi tốt nghiệp THPT' }
    if (a.method === 'transcript' && a.scale === 30) return { key: 'transcript', label: 'Học bạ THPT' }
  }
  // Các trường hợp chưa xác minh thang ĐGNL OU, điểm bách phân vị UEL,
  // nguồn thứ cấp HCMUE, ánh xạ FTU không được đưa vào cột điểm chuẩn.
  if (u.slug === 'ton-duc-thang' && a.method === 'high_school_exam' && a.year === 2025 && a.scale === 40 &&
      /\/2025\/Huong-dan-thu-tuc-nhap-hoc\/Diem-trung-tuyen-dai-hoc-2025-Verfull\.pdf$/.test(a.sourceUrl)) {
    return { key: 'thpt', label: 'THPT — tổ hợp gốc, một môn hệ số 2' }
  }
  return null
}

export function profilePolicy(u) {
  const uncertainAddress = ['bach-khoa-tphcm', 'cong-nghe-thong-tin-dhqg', 'kinh-te-luat-dhqg', 'mo-tphcm', 'ngoai-thuong-cs2', 'quoc-te-dhqg']
  const uncertainYear = ['kinh-te-tphcm', 'bach-khoa-tphcm', 'ngoai-thuong-cs2', 'su-pham-ky-thuat-tphcm']
  const original = typeof u.description === 'string' ? u.description : ''
  // Loại các câu chứa tuyên bố xếp hạng / kiểm định chưa có bằng chứng riêng.
  const description = original.split(/(?<=[.;])\s+/u).filter((s) => !/xếp hạng|hàng đầu|THE\s|QS\s|đạt chuẩn|trọng điểm quốc gia|đầu tiên tại/i.test(s)).join(' ').trim()
  return {
    description,
    foundedYear: uncertainYear.includes(u.slug) ? null : u.foundedYear,
    address: uncertainAddress.includes(u.slug) ? null : u.address?.full,
    phone: ['bach-khoa-tphcm', 'ngoai-thuong-cs2'].includes(u.slug) ? null : u.contact?.phone,
    // Hiện model không có bằng chứng xác minh tọa độ/cơ sở theo ngành.
    // Tọa độ OSM trong seed không đủ để khẳng định vị trí đã được xác minh.
    map: null,
    // Ngoại lệ riêng theo giá trị đã đối chiếu, không mở domain/mã ngành cho AI.
    ...hcmutProfile(u),
  }
}
