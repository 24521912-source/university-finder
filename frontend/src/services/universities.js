// Gọi API danh sách / tìm kiếm / so sánh trường (xem docs/API_CONTRACT.md, mục Universities).
import api from './api'

// params: { q, type, vnu, group, major, district, maxTuition } — bỏ trống field nào thì không lọc field đó.
// Trả về { total, items } với items là dữ liệu card cho <UniversityCard />.
export async function searchUniversities(params, signal) {
  const { data } = await api.get('/universities/search', { params, signal })
  return data
}

// Trả về { districts: [...], majorGroups: [{ name, majors: [{ code, name }] }] } cho các ô chọn của bộ lọc.
export async function getFilterOptions(signal) {
  const { data } = await api.get('/universities/filter-options', { signal })
  return data
}

// slugs: 2–3 slug. Trả về mảng dữ liệu so sánh theo đúng thứ tự slug.
export async function compareUniversities(slugs, signal) {
  const { data } = await api.get('/universities/compare', { params: { slugs: slugs.join(',') }, signal })
  return data
}
