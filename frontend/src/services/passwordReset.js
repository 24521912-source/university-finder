// Quên mật khẩu: yêu cầu gửi link về email. Bước đặt mật khẩu mới nằm trong AuthProvider (vì đăng nhập luôn).
import api from './api'

export const requestPasswordReset = (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data.message)
