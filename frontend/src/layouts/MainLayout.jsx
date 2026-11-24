import { Suspense, useLayoutEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { titleForPath } from '../utils/pageTitle'
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
  // Tiêu đề tab theo trang. useLayoutEffect chạy trước useEffect của trang con,
  // nên trang chi tiết trường (useDocumentTitle) vẫn ghi đè được bằng tên trường.
  useLayoutEffect(() => {
    document.title = titleForPath(pathname)
  }, [pathname])
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
          {/* Các trang được tải riêng khi mở tới: header/footer vẫn hiện trong lúc chờ */}
          <Suspense fallback={<p className="container" role="status">Đang tải trang…</p>}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default MainLayout
