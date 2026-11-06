// Tìm kiếm / lọc / phân trang danh sách trường (chạy phía client).
export const PAGE_SIZE = 12

// Bỏ dấu, đ -> d, chữ thường, gộp ký tự đặc biệt thành khoảng trắng.
export const normalize = (s) => String(s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

// Tiền tố chung không mang nghĩa khi tìm ("trường đại học công nghệ thông tin" vẫn khớp UIT).
const PREFIX = /^(truong )?(dai hoc|hoc vien|nhac vien)\s+/

function haystack(u) {
  const name = normalize(u.name)
  const short = normalize(u.shortName)
  return { name, core: name.replace(PREFIX, ''), short, shortCompact: short.replace(/ /g, '') }
}

export function matchesQuery(u, query) {
  const q = normalize(query).replace(PREFIX, '')
  if (!q) return true
  const h = haystack(u)
  if (h.short && (h.shortCompact === q.replace(/ /g, '') || h.short.startsWith(q))) return true
  // Mọi từ trong câu tìm đều phải xuất hiện trong tên (không phụ thuộc thứ tự).
  return q.split(' ').every((word) => h.name.includes(word) || h.short.split(' ').includes(word))
}

export function filterUniversities(list, { query = '', type = 'all', vnuOnly = false } = {}) {
  const q = normalize(query)
  return list
    .filter((u) => (type === 'all' || u.institutionType === type) && (!vnuOnly || u.belongsToUniversitySystem === true) && matchesQuery(u, query))
    .map((u, index) => ({ u, index, rank: rank(u, q) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((x) => x.u)
}

// Ưu tiên: trùng tên viết tắt > tên bắt đầu bằng câu tìm > còn lại (giữ thứ tự gốc).
function rank(u, q) {
  if (!q) return 0
  const h = haystack(u)
  const core = q.replace(PREFIX, '')
  if (h.shortCompact && h.shortCompact === core.replace(/ /g, '')) return 0
  if (h.core.startsWith(core)) return 1
  return 2
}

export function paginate(list, page, size = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(list.length / size))
  const current = Math.min(Math.max(1, page), totalPages)
  return { items: list.slice((current - 1) * size, current * size), totalPages, current }
}
