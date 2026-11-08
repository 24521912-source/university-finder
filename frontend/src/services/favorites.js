// API yêu thích của người đang đăng nhập. Trả về danh sách id trường đã yêu thích.
import api from './api'

const path = (slug) => `/favorites/${encodeURIComponent(slug)}`

export const addFavorite = (slug) => api.post(path(slug)).then((r) => r.data.favorites)
export const removeFavorite = (slug) => api.delete(path(slug)).then((r) => r.data.favorites)
