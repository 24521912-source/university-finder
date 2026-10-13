// File dùng chung để frontend gọi API backend. Tự gắn token đăng nhập vào mọi request.
// Dùng: import api from '../services/api';  const res = await api.get('/universities')
import axios from 'axios'

export const TOKEN_KEY = 'token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Câu báo lỗi để hiện cho người dùng: backend luôn trả lỗi dạng { message }
export const getErrorMessage = (error) =>
  error.response?.data?.message || 'Không kết nối được máy chủ, vui lòng thử lại'

export default api
