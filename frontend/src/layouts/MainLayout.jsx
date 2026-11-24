import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Khung chung mọi trang: skip-link + header + nội dung trang (Outlet) + footer.
// Mỗi trang tự đặt đúng một <h1> bên trong <main>.
function MainLayout() {
  const { user } = useAuth()
  return (
    <>
      <a href="#main-content" className="skip-link">Bỏ qua, đến nội dung chính</a>
      <Header />
      {user?.mustChangePassword && (
        <div className="temp-password-banner" role="status">
          Bạn đang dùng mật khẩu tạm do quản trị viên tạo. <Link to="/ca-nhan">Đổi mật khẩu ngay →</Link>
        </div>
      )}
      <main id="main-content" className="page" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default MainLayout
