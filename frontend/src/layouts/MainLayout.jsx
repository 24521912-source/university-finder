import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Khung chung mọi trang: skip-link + header + nội dung trang (Outlet) + footer.
// Mỗi trang tự đặt đúng một <h1> bên trong <main>.
function MainLayout() {
  return (
    <>
      <a href="#main-content" className="skip-link">Bỏ qua, đến nội dung chính</a>
      <Header />
      <main id="main-content" className="page" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default MainLayout
