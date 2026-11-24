import { useEffect, useMemo, useState } from 'react'
import api, { TOKEN_KEY } from '../../services/api'
import { AuthContext } from './AuthContext'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Có token cũ -> đang hỏi lại backend xem còn hợp lệ không; trang cần đăng nhập chờ bước này xong
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(() => {
    const saveSession = ({ token, user }) => {
      localStorage.setItem(TOKEN_KEY, token)
      setUser(user)
      return user
    }
    return {
      user,
      loading,
      setUser, // để chức năng khác cập nhật user (vd. danh sách yêu thích) mà không cần tải lại
      login: async (email, password) => saveSession((await api.post('/auth/login', { email, password })).data),
      register: async (form) => saveSession((await api.post('/auth/register', form)).data),
      // Đặt mật khẩu mới bằng mã trong email; backend trả phiên đăng nhập mới.
      resetPassword: async (token, password) => saveSession((await api.post('/auth/reset-password', { token, password })).data),
      logout: () => {
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
      },
    }
  }, [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
