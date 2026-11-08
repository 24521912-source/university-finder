// API quản lý tài khoản (chỉ quản trị viên). Backend kiểm tra quyền ở từng thao tác.
import api from './api'

const path = (id) => `/admin/users/${encodeURIComponent(id)}`

export const listAccounts = (params, signal) => api.get('/admin/users', { params, signal }).then((r) => r.data)
export const createAccount = (data) => api.post('/admin/users', data).then((r) => r.data)
export const setAccountStatus = (id, status) => api.patch(`${path(id)}/status`, { status }).then((r) => r.data)
export const setAccountRole = (id, role) => api.patch(`${path(id)}/role`, { role }).then((r) => r.data)
export const setAccountPermissions = (id, canManageAdmins) => api.patch(`${path(id)}/permissions`, { canManageAdmins }).then((r) => r.data)
export const deleteAccount = (id) => api.delete(path(id)).then((r) => r.data)
