// API dữ liệu bản đồ: { items: trường có tọa độ, missing: trường chưa có tọa độ }.
import api from './api'

export const getMapUniversities = (signal) => api.get('/map/universities', { signal }).then((r) => r.data)
