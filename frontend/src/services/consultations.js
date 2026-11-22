// API lịch sử AI tư vấn của người đang đăng nhập.
import api from './api'

export const listConsultations = (signal) => api.get('/consultations', { signal }).then((r) => r.data)
export const saveConsultation = (payload) => api.post('/consultations', payload).then((r) => r.data)
export const deleteConsultation = (id) => api.delete(`/consultations/${encodeURIComponent(id)}`).then((r) => r.data)
