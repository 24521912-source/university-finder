import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

// Bọc trang cần đăng nhập: <ProtectedRoute><Profile /></ProtectedRoute>
// Trang chỉ cho admin:        <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
function ProtectedRoute({ adminOnly = false, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="container muted">Đang tải…</p>
  // Chưa đăng nhập -> sang trang đăng nhập, đăng nhập xong quay lại đúng trang này
  if (!user) return <Navigate to="/dang-nhap" replace state={{ from: location }} />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default ProtectedRoute
