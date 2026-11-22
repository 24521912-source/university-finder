import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import ComingSoon from '../components/ComingSoon'
import Home from '../pages/Home/Home'
import Universities from '../pages/Universities/Universities'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import ForgotPassword from '../pages/PasswordReset/ForgotPassword'
import ResetPassword from '../pages/PasswordReset/ResetPassword'
import Profile from '../pages/Profile/Profile'
import UniversityDetail from '../pages/UniversityDetail/UniversityDetail'
import AdmissionPreview from '../pages/UniversityDetail/AdmissionPreview'
import AI from '../pages/AI/AI'
import Compare from '../pages/Compare/Compare'
import Admin from '../pages/Admin/Admin'
// Trang bản đồ kéo theo thư viện Leaflet (~150 kB): chỉ tải khi mở trang.
const MapPage = lazy(() => import('../pages/Map/MapPage'))

// Khai báo mọi trang của web. Làm xong chức năng nào thì thay <ComingSoon /> bằng trang thật.
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/truong" element={<Universities />} />
          <Route path="/truong/:slug/:section?" element={<UniversityDetail />} />
          <Route path="/demo/tuyen-sinh" element={<AdmissionPreview />} />
          <Route path="/ai-tu-van" element={<AI />} />
          <Route path="/so-sanh" element={<Compare />} />
          <Route path="/ban-do" element={<Suspense fallback={<p className="container" role="status">Đang tải bản đồ…</p>}><MapPage /></Suspense>} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/quen-mat-khau" element={<ForgotPassword />} />
          <Route path="/dat-lai-mat-khau" element={<ResetPassword />} />

          {/* Cần đăng nhập */}
          <Route path="/ca-nhan" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Chỉ admin */}
          <Route path="/admin/*" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />

          <Route path="*" element={<ComingSoon title="Không tìm thấy trang" message="Đường dẫn này không tồn tại." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
