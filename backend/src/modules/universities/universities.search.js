// Hàm thuần (không gọi database) cho API tìm kiếm / lọc trường — dễ viết test.

// ---------- Tìm theo tên ----------

// Bỏ dấu, đ -> d, chữ thường, gộp ký tự đặc biệt thành khoảng trắng.
// "Trường ĐH Công nghệ Thông tin" -> "truong dh cong nghe thong tin"
function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Tiền tố chung không mang nghĩa khi tìm ("trường đại học công nghệ thông tin" vẫn khớp UIT).
const NAME_PREFIX = /^(truong )?(dai hoc|hoc vien|nhac vien)\s+/

function nameParts(university) {
  const name = normalize(university.name)
  const short = normalize(university.shortName)
  return {
    name,
    core: name.replace(NAME_PREFIX, ''), // tên đã bỏ tiền tố
    short,
    shortCompact: short.replace(/ /g, ''), // "UEH ISB" -> "uehisb"
  }
}

// Trường có khớp câu tìm không: trùng tên viết tắt, hoặc mọi từ đều có trong tên.
function matchesQuery(university, query) {
  const q = normalize(query).replace(NAME_PREFIX, '')
  if (!q) return true

  const parts = nameParts(university)
  if (parts.short && (parts.shortCompact === q.replace(/ /g, '') || parts.short.startsWith(q))) return true

  const shortWords = parts.short.split(' ')
  return q.split(' ').every((word) => parts.name.includes(word) || shortWords.includes(word))
}

// Độ ưu tiên khi sắp xếp: 0 = trùng tên viết tắt, 1 = tên bắt đầu bằng câu tìm, 2 = còn lại.
function queryRank(university, query) {
  const q = normalize(query).replace(NAME_PREFIX, '')
  if (!q) return 0

  const parts = nameParts(university)
  if (parts.shortCompact && parts.shortCompact === q.replace(/ /g, '')) return 0
  if (parts.core.startsWith(q)) return 1
  return 2
}

// ---------- Học phí ----------

const SEMESTERS_PER_YEAR = 2

// Học phí thấp nhất quy về một năm (đồng/năm), hoặc null nếu không quy đổi được.
// - Đơn vị "year": dùng luôn.
// - Đơn vị "semester": ước tính × 2 học kỳ chính (ghi rõ là ước tính trên giao diện).
// - Đơn vị "credit" / "program": không quy đổi vì phụ thuộc số tín chỉ / số năm học.
function annualTuitionFrom(university) {
  const yearly = (university.tuition || [])
    .filter((fee) => fee.amountMin > 0)
    .map((fee) => {
      if (fee.unit === 'year') return fee.amountMin
      if (fee.unit === 'semester') return fee.amountMin * SEMESTERS_PER_YEAR
      return null
    })
    .filter((amount) => amount !== null)

  return yearly.length ? Math.min(...yearly) : null
}

// ---------- Lọc + sắp xếp ----------

// Lọc phần không làm được bằng truy vấn MongoDB (tên không dấu, học phí quy đổi) rồi sắp xếp.
// universities đã được MongoDB lọc sẵn theo loại trường, ĐHQG, ngành, khu vực.
function filterAndSort(universities, { q = '', maxTuition = null } = {}) {
  return universities
    .filter((u) => matchesQuery(u, q))
    .filter((u) => {
      if (maxTuition === null) return true
      const yearly = annualTuitionFrom(u)
      return yearly !== null && yearly <= maxTuition
    })
    .map((u, index) => ({ u, index, rank: queryRank(u, q) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index) // giữ thứ tự gốc khi cùng hạng
    .map((item) => item.u)
}

module.exports = { normalize, matchesQuery, queryRank, annualTuitionFrom, filterAndSort }
