import api from './api'

export async function getUniversityDetail(slug, signal) {
  const { data } = await api.get(`/universities/${encodeURIComponent(slug)}`, { signal })
  if (!data || Array.isArray(data) || data.slug !== slug || typeof data.name !== 'string' || !data.name.trim()) {
    throw new Error('Dữ liệu chi tiết trường không đúng cấu trúc. Vui lòng kiểm tra API đang kết nối.')
  }
  return data
}
