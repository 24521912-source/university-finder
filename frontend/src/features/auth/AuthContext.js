import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// Trong component bất kỳ: const { user, loading, login, register, logout, setUser } = useAuth()
// user = null khi chưa đăng nhập; user.role = 'user' | 'admin' | 'superadmin' (kiểm tra quyền quản trị: isAdmin trong utils/roles.js)
export const useAuth = () => useContext(AuthContext)
