import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Khóa cho hiệu ứng chuyển trang: chỉ đổi khi sang trang khác hẳn.
// Đổi tab trong cùng một trường (/truong/:slug/:section) hay trong /admin thì giữ nguyên, không tải lại.
function pageKey(pathname) {
  const parts = pathname.split('/')
  return parts[1] === 'truong' ? parts.slice(0, 3).join('/') : `/${parts[1]}`
}

// Khung chung mọi trang: skip-link + header + nội dung trang (Outlet) + footer.
// Mỗi trang tự đặt đúng một <h1> bên trong <main>.
function MainLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()
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
        <div key={pageKey(pathname)} className="page-enter">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  )
}

export default MainLayout
