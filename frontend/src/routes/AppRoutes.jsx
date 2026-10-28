import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import ComingSoon from '../components/ComingSoon'
import Home from '../pages/Home/Home'
import Universities from '../pages/Universities/Universities'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'

// Khai báo mọi trang của web. Làm xong chức năng nào thì thay <ComingSoon /> bằng trang thật.
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/truong" element={<Universities />} />
          <Route path="/truong/:slug" element={<ComingSoon title="Chi tiết trường" />} />
          <Route path="/ai-tu-van" element={<ComingSoon title="AI tư vấn chọn trường" />} />
          <Route path="/so-sanh" element={<ComingSoon title="So sánh trường" />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />

          {/* Cần đăng nhập */}
          <Route path="/ca-nhan" element={<ProtectedRoute><ComingSoon title="Trang cá nhân" /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ComingSoon title="Trang cá nhân" /></ProtectedRoute>} />

          {/* Chỉ admin */}
          <Route path="/admin/*" element={<ProtectedRoute adminOnly><ComingSoon title="Trang quản trị" /></ProtectedRoute>} />

          <Route path="*" element={<ComingSoon title="Không tìm thấy trang" message="Đường dẫn này không tồn tại." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
