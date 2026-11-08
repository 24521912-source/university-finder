// API lịch sử thay đổi (quản trị viên). Xóa dòng lịch sử chỉ quản trị cấp cao.
import api from './api'

const path = (id) => `/admin/history/${encodeURIComponent(id)}`

export const listHistory = (params, signal) => api.get('/admin/history', { params, signal }).then((r) => r.data)
export const getHistory = (id) => api.get(path(id)).then((r) => r.data)
export const restoreHistory = (id) => api.post(`${path(id)}/restore`).then((r) => r.data)
export const deleteHistory = (id) => api.delete(path(id)).then((r) => r.data)
