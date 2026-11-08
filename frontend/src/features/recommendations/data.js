import seeds from '../../../../database/seeds/universities.json'
import catalog from '../../../../database/seeds/majors.json'
import api from '../../services/api'

export const majorOptions = catalog
export const districtOptions = [...new Set(seeds.map((u) => u.address?.district).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'))

export async function loadRecommendationData(signal) {
  const { data } = await api.get('/universities', { signal })
  if (!Array.isArray(data) || data.some((u) => !u || typeof u.slug !== 'string')) {
    throw new Error('API trả dữ liệu trường không hợp lệ.')
  }
  const bySlug = new Map(seeds.map((u) => [u.slug, u]))
  // API quyết định trường nào tồn tại; không tự thêm trường từ seed khi API lỗi.
  return [...new Map(data.map((card) => [card.slug, {
    ...bySlug.get(card.slug), ...card,
    majors: bySlug.get(card.slug)?.majors || [],
    tuition: bySlug.get(card.slug)?.tuition || [],
    admissions: bySlug.get(card.slug)?.admissions || [],
    // Các mảng chi tiết và địa chỉ là snapshot seed, không phải dữ liệu trực tiếp.
    address: bySlug.get(card.slug)?.address,
  }])).values()]
}
