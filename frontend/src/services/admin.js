// API quản trị: chỉ tài khoản admin gọi được (backend kiểm tra role trong database).
import api from './api'

const path = (slug) => `/admin/universities/${encodeURIComponent(slug)}`

export const listUniversities = (params, signal) => api.get('/admin/universities', { params, signal }).then((r) => r.data)
export const getUniversity = (slug, signal) => api.get(path(slug), { signal }).then((r) => r.data)
export const createUniversity = (data) => api.post('/admin/universities', data).then((r) => r.data)
export const updateUniversity = (slug, data) => api.put(path(slug), data).then((r) => r.data)
export const deleteUniversity = (slug) => api.delete(path(slug)).then((r) => r.data)
export const listMajors = (signal) => api.get('/admin/majors', { signal }).then((r) => r.data)
