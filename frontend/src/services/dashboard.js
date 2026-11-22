// API số liệu tổng quan cho trang quản trị (chỉ quản trị viên).
import api from './api'

export const getDashboard = (signal) => api.get('/admin/dashboard', { signal }).then((r) => r.data)
