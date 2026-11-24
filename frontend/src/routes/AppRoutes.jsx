import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import ComingSoon from '../components/ComingSoon'
import Home from '../pages/Home/Home'

// Trang chủ tải ngay; các trang khác tách thành file riêng, chỉ tải khi mở tới
// (MainLayout bọc <Suspense> quanh nội dung trang). Trang bản đồ còn kéo theo Leaflet (~150 kB).
const Universities = lazy(() => import('../pages/Universities/Universities'))
const UniversityDetail = lazy(() => import('../pages/UniversityDetail/UniversityDetail'))
const AdmissionPreview = lazy(() => import('../pages/UniversityDetail/AdmissionPreview'))
const AI = lazy(() => import('../pages/AI/AI'))
const Compare = lazy(() => import('../pages/Compare/Compare'))
const MapPage = lazy(() => import('../pages/Map/MapPage'))
const Login = lazy(() => import('../pages/Login/Login'))
const Register = lazy(() => import('../pages/Register/Register'))
const ForgotPassword = lazy(() => import('../pages/PasswordReset/ForgotPassword'))
const ResetPassword = lazy(() => import('../pages/PasswordReset/ResetPassword'))
const Profile = lazy(() => import('../pages/Profile/Profile'))
const Admin = lazy(() => import('../pages/Admin/Admin'))

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
          <Route path="/ban-do" element={<MapPage />} />
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
