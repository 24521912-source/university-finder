import api from '../../services/api'

// Mọi dữ liệu trang AI đọc từ MongoDB qua API.
export const districtsOf = (universities) =>
  [...new Set(universities.map((u) => u.address?.district).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'))

export async function loadRecommendationData(signal) {
  const [{ data }, { data: majors }] = await Promise.all([
    api.get('/universities/recommendation-data', { signal }),
    api.get('/majors', { signal }),
  ])
  if (!Array.isArray(data) || data.some((u) => !u || typeof u.slug !== 'string') || !Array.isArray(majors)) {
    throw new Error('API trả dữ liệu không hợp lệ.')
  }
  return { universities: data, majors }
}
