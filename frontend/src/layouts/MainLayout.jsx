import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Khung chung mọi trang: header + nội dung trang (Outlet) + footer
function MainLayout() {
  return (
    <>
      <Header />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default MainLayout
