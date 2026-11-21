// Kiểm tra kết quả tư vấn gửi lên để lưu. Trả về { error } hoặc { data } đã chuẩn hóa.
// Thuật toán chấm điểm chạy ở trình duyệt; backend chỉ kiểm tra kiểu dữ liệu / giới hạn rồi lưu.

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const METHODS = ['high_school_exam', 'competency_assessment']
const INSTITUTION_TYPES = ['public', 'private', 'international', 'other', 'any']
const VNUHCM = ['only', 'exclude', 'any']
const MAX_RESULTS = 10
const MAX_REASONS = 6

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const isNumberIn = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max
const shortText = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined)
const isBlank = (v) => v === undefined || v === null

function parseCriteria(c) {
  if (!isObject(c)) return { error: 'Thiếu tiêu chí tư vấn' }
  if (typeof c.majorCode !== 'string' || !/^[0-9A-Z]{5,12}$/.test(c.majorCode)) return { error: 'Mã ngành không hợp lệ' }
  if (!METHODS.includes(c.method)) return { error: 'Phương thức xét tuyển không hợp lệ' }
  const scale = c.method === 'high_school_exam' ? 30 : 1200
  if (!isNumberIn(c.score, 0, scale)) return { error: `Điểm phải từ 0 đến ${scale}` }
  if (!isBlank(c.combination) && (typeof c.combination !== 'string' || !/^[A-Z]\d{2}$/.test(c.combination))) return { error: 'Tổ hợp không hợp lệ' }
  if (!isBlank(c.maxTuition) && !isNumberIn(c.maxTuition, 1, 1e10)) return { error: 'Học phí tối đa không hợp lệ' }
  if (!isBlank(c.district) && typeof c.district !== 'string') return { error: 'Khu vực không hợp lệ' }
  if (!isBlank(c.institutionType) && !INSTITUTION_TYPES.includes(c.institutionType)) return { error: 'Loại trường không hợp lệ' }
  if (!isBlank(c.vnuhcm) && !VNUHCM.includes(c.vnuhcm)) return { error: 'Lựa chọn ĐHQG không hợp lệ' }

  return {
    data: {
      majorCode: c.majorCode,
      majorLabel: shortText(c.majorLabel, 150),
      method: c.method,
      combination: c.method === 'high_school_exam' && !isBlank(c.combination) ? c.combination : undefined,
      score: c.score,
      maxTuition: isBlank(c.maxTuition) ? null : c.maxTuition,
      district: c.district === 'any' ? undefined : shortText(c.district, 100),
      institutionType: c.institutionType || 'any',
      vnuhcm: c.vnuhcm || 'any',
    },
  }
}

function parseResult(r, index) {
  const label = `Kết quả thứ ${index + 1}`
  if (!isObject(r)) return { error: `${label} không hợp lệ` }
  if (typeof r.slug !== 'string' || r.slug.length > 150 || !SLUG.test(r.slug)) return { error: `${label}: đường dẫn trường không hợp lệ` }
  if (!isNumberIn(r.matchScore, 0, 100)) return { error: `${label}: điểm phù hợp phải từ 0 đến 100` }
  if (!isBlank(r.coverage) && !isNumberIn(r.coverage, 0, 100)) return { error: `${label}: độ phủ phải từ 0 đến 100` }
  if (!isBlank(r.reasons) && !Array.isArray(r.reasons)) return { error: `${label}: lý do phải là danh sách` }
  return {
    data: {
      slug: r.slug,
      major: shortText(r.major, 200),
      matchScore: r.matchScore,
      coverage: isBlank(r.coverage) ? undefined : r.coverage,
      reasons: (r.reasons || []).map((x) => shortText(x, 300)).filter(Boolean).slice(0, MAX_REASONS),
    },
  }
}

function parseConsultation(body) {
  if (!isObject(body)) return { error: 'Dữ liệu gửi lên không hợp lệ' }
  const criteria = parseCriteria(body.criteria)
  if (criteria.error) return criteria
  if (!Array.isArray(body.results) || !body.results.length) return { error: 'Chưa có trường nào trong kết quả để lưu' }
  if (body.results.length > MAX_RESULTS) return { error: `Chỉ lưu tối đa ${MAX_RESULTS} trường` }
  const results = []
  for (const [i, r] of body.results.entries()) {
    const parsed = parseResult(r, i)
    if (parsed.error) return parsed
    results.push(parsed.data)
  }
  return { data: { criteria: criteria.data, results } }
}

const isObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)

module.exports = { parseConsultation, isObjectId, MAX_RESULTS }
