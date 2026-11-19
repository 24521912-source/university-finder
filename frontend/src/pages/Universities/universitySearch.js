// Hàm thuần cho trang danh sách trường: đọc bộ lọc từ URL, đổi sang tham số API, phân trang.
// Việc tìm theo tên / lọc thực hiện ở backend: GET /api/universities/search (WBS 5.4).

export const PAGE_SIZE = 12

export const TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'public', label: 'Công lập' },
  { value: 'private', label: 'Tư thục' },
  { value: 'international', label: 'Quốc tế' },
]

// Mức trần học phí (đồng/năm). value rỗng = không lọc.
export const TUITION_OPTIONS = [
  { value: '', label: 'Không giới hạn' },
  { value: '20000000', label: 'Tối đa 20 triệu/năm' },
  { value: '30000000', label: 'Tối đa 30 triệu/năm' },
  { value: '50000000', label: 'Tối đa 50 triệu/năm' },
  { value: '80000000', label: 'Tối đa 80 triệu/năm' },
  { value: '120000000', label: 'Tối đa 120 triệu/năm' },
]

// Tên tham số trên URL (tiếng Việt cho dễ đọc, dễ chia sẻ link): /truong?q=uit&loai=public&nganh=7480201
export const URL_KEYS = {
  q: 'q',
  type: 'loai',
  vnuOnly: 'dhqg',
  group: 'nhom',
  major: 'nganh',
  district: 'khuvuc',
  maxTuition: 'hocphi',
  page: 'trang',
}

const isAllowed = (options, value) => options.some((option) => option.value === value)

// URLSearchParams -> object bộ lọc. Giá trị lạ trên URL được bỏ qua thay vì làm hỏng trang.
export function readFilters(params) {
  const type = params.get(URL_KEYS.type)
  const maxTuition = params.get(URL_KEYS.maxTuition) || ''
  return {
    q: params.get(URL_KEYS.q) || '',
    type: isAllowed(TYPE_OPTIONS, type) ? type : 'all',
    vnuOnly: params.get(URL_KEYS.vnuOnly) === '1',
    group: params.get(URL_KEYS.group) || '',
    major: params.get(URL_KEYS.major) || '',
    district: params.get(URL_KEYS.district) || '',
    maxTuition: isAllowed(TUITION_OPTIONS, maxTuition) ? maxTuition : '',
  }
}

export function readPage(params) {
  return Math.max(1, Number.parseInt(params.get(URL_KEYS.page), 10) || 1)
}

// Có đang bật bộ lọc nào không (để hiện nút "Xóa bộ lọc").
export function hasActiveFilter(filters) {
  return Boolean(filters.q.trim() || filters.type !== 'all' || filters.vnuOnly ||
    filters.group || filters.major || filters.district || filters.maxTuition)
}

// Object bộ lọc -> tham số gửi API. Chỉ gửi field đang dùng.
export function toApiParams(filters) {
  const params = {}
  if (filters.q.trim()) params.q = filters.q.trim()
  if (filters.type !== 'all') params.type = filters.type
  if (filters.vnuOnly) params.vnu = '1'
  if (filters.major) params.major = filters.major
  else if (filters.group) params.group = filters.group // đã chọn ngành cụ thể thì không cần gửi nhóm
  if (filters.district) params.district = filters.district
  if (filters.maxTuition) params.maxTuition = filters.maxTuition
  return params
}

export function paginate(list, page, size = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(list.length / size))
  const current = Math.min(Math.max(1, page), totalPages)
  return { items: list.slice((current - 1) * size, current * size), totalPages, current }
}
