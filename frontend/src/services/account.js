// API tài khoản của người đang đăng nhập.
import api from './api'

export const updateProfile = (data) => api.put('/auth/me', data).then((r) => r.data.user)
export const changePassword = (data) => api.put('/auth/password', data).then((r) => r.data)
