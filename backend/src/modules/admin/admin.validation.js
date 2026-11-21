// Kiểm tra dữ liệu admin gửi lên. Trả về câu báo lỗi, hoặc null nếu hợp lệ (cùng kiểu với auth.validation.js).

// Chỉ các field này được admin ghi. Bỏ qua _id, favoriteCount, timestamps và field lạ.
const EDITABLE = [
  'slug', 'name', 'shortName', 'aliases', 'institutionType', 'belongsToUniversitySystem', 'universitySystem',
  'foundedYear', 'description', 'dataLevel', 'tags', 'sourceDomains', 'overview', 'contact', 'address', 'campuses', 'media',
  'majors', 'tuition', 'admissions', 'facilities', 'scholarships', 'dormitory', 'studentLife', 'careerOpportunities',
  'detailEvidence',
]
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validateSlug(slug) {
  if (typeof slug !== 'string' || slug.length > 150 || !SLUG.test(slug)) {
    return 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang'
  }
  return null
}

function validateBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Dữ liệu gửi lên không hợp lệ'
  return null
}

// Giữ lại đúng các field được phép ghi.
function pickEditable(body) {
  const data = {}
  for (const key of EDITABLE) if (key in body) data[key] = body[key]
  return data
}

// Mã ngành của trường phải có trong danh mục (knownCodes); học phí / điểm chuẩn phải trỏ tới ngành của chính trường.
function validateMajorCodes(data, knownCodes) {
  const own = new Set((data.majors || []).map((m) => m?.code))
  const errors = [...own].filter((c) => !knownCodes.has(c)).map((c) => `Ngành ${c} chưa có trong danh mục ngành`)
  for (const [label, list] of [['Học phí', data.tuition], ['Điểm chuẩn', data.admissions]]) {
    for (const item of list || []) {
      if (item?.majorCode && !own.has(item.majorCode)) {
        errors.push(`${label}: mã ngành ${item.majorCode} không có trong danh sách ngành của trường`)
      }
    }
  }
  return errors.length ? [...new Set(errors)].join('; ') : null
}

// Tọa độ trụ sở / cơ sở (GeoJSON Point, [kinh độ, vĩ độ]) phải là số hợp lệ. Bỏ trống location thì không kiểm tra.
function validateLocations(data) {
  const check = (location, label) => {
    if (location === undefined || location === null) return null
    const c = location.coordinates
    if (c === undefined || c === null) return null
    if (!Array.isArray(c) || c.length !== 2 || !c.every((n) => typeof n === 'number' && Number.isFinite(n))) {
      return `${label}: tọa độ phải gồm đúng 2 số [kinh độ, vĩ độ]`
    }
    const [lng, lat] = c
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return `${label}: vĩ độ phải trong -90..90, kinh độ trong -180..180`
    if (location.type !== undefined && location.type !== 'Point') return `${label}: kiểu tọa độ phải là Point`
    return null
  }
  const errors = [check(data.address?.location, 'Địa chỉ trụ sở')]
  for (const [i, campus] of (Array.isArray(data.campuses) ? data.campuses : []).entries()) {
    errors.push(check(campus?.location, `Cơ sở ${i + 1}`))
  }
  return errors.filter(Boolean).join('; ') || null
}

module.exports = { EDITABLE, validateSlug, validateBody, pickEditable, validateMajorCodes, validateLocations }
