// Kiểm tra tham số từ URL. Mỗi hàm trả { value } nếu hợp lệ, hoặc { error: 'câu báo lỗi' }.
// Luôn kiểm tra kiểu string để chặn NoSQL injection (vd. ?major[$ne]=x).

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAJOR_CODE = /^[0-9A-Za-z]{5,10}$/ // mã ngành Bộ GD&ĐT, vd. 7480201 (vài mã có chữ: 75202A1)
const TYPES = ['public', 'private', 'international', 'other']
const MAX_TEXT = 100
const MAX_TUITION = 1e10

const isMissing = (value) => value === undefined || value === ''
const isShortText = (value) => typeof value === 'string' && value.trim().length <= MAX_TEXT

// GET /universities/search?q=&type=&vnu=&group=&major=&district=&maxTuition=
function validateSearch(query = {}) {
  const { q, type, vnu, group, major, district, maxTuition } = query

  if (!isMissing(q) && !isShortText(q)) return { error: `Từ khóa tìm kiếm tối đa ${MAX_TEXT} ký tự` }
  if (!isMissing(type) && !TYPES.includes(type)) return { error: 'Loại trường không hợp lệ' }
  if (!isMissing(vnu) && vnu !== '1') return { error: 'Tham số vnu chỉ nhận giá trị 1' }
  if (!isMissing(group) && !isShortText(group)) return { error: 'Nhóm ngành không hợp lệ' }
  if (!isMissing(major) && (typeof major !== 'string' || !MAJOR_CODE.test(major))) return { error: 'Mã ngành không hợp lệ' }
  if (!isMissing(district) && !isShortText(district)) return { error: 'Khu vực không hợp lệ' }

  let tuition = null
  if (!isMissing(maxTuition)) {
    tuition = typeof maxTuition === 'string' ? Number(maxTuition) : NaN
    if (!Number.isFinite(tuition) || tuition <= 0 || tuition > MAX_TUITION) return { error: 'Học phí tối đa phải là số dương (đồng/năm)' }
  }

  return {
    value: {
      q: isMissing(q) ? '' : q.trim(),
      type: isMissing(type) ? null : type,
      vnuOnly: vnu === '1',
      group: isMissing(group) ? null : group.trim(),
      major: isMissing(major) ? null : major,
      district: isMissing(district) ? null : district.trim(),
      maxTuition: tuition,
    },
  }
}

const MIN_COMPARE = 2
const MAX_COMPARE = 3

// GET /universities/compare?slugs=uit,bach-khoa-tphcm  -> 2 đến 3 slug khác nhau
function validateCompare(query = {}) {
  const { slugs } = query
  if (typeof slugs !== 'string' || slugs.trim() === '') return { error: `Hãy chọn ${MIN_COMPARE}–${MAX_COMPARE} trường để so sánh` }

  const list = [...new Set(slugs.split(',').map((slug) => slug.trim()).filter(Boolean))]
  if (list.length < MIN_COMPARE || list.length > MAX_COMPARE) return { error: `Hãy chọn ${MIN_COMPARE}–${MAX_COMPARE} trường khác nhau để so sánh` }
  if (list.some((slug) => slug.length > 150 || !SLUG.test(slug))) return { error: 'Đường dẫn trường không hợp lệ' }

  return { value: list }
}

module.exports = { validateSearch, validateCompare, MIN_COMPARE, MAX_COMPARE }
