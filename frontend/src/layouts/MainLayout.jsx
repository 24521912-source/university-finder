import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Khung chung mọi trang: header + nội dung trang (Outlet) + footer
function MainLayout() {
  const { user } = useAuth()
  return (
    <>
      <Header />
      {user?.mustChangePassword && (
        <div className="temp-password-banner" role="status">
          Bạn đang dùng mật khẩu tạm do quản trị viên tạo. <Link to="/ca-nhan">Đổi mật khẩu ngay →</Link>
        </div>
      )}
      <main className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default MainLayout
