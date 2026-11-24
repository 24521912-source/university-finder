// Tiêu đề tab trình duyệt cho từng trang. Phải khớp đường dẫn trong routes/AppRoutes.jsx.
export const SITE_NAME = 'UniMatch HCMC'
export const DEFAULT_TITLE = `${SITE_NAME} — Tìm trường đại học tại TP.HCM`

const TITLES = {
  '/': null,
  '/truong': 'Danh sách trường đại học',
  '/ai-tu-van': 'AI tư vấn chọn trường',
  '/so-sanh': 'So sánh trường đại học',
  '/ban-do': 'Bản đồ trường đại học',
  '/dang-nhap': 'Đăng nhập',
  '/login': 'Đăng nhập',
  '/dang-ky': 'Đăng ký',
  '/signup': 'Đăng ký',
  '/quen-mat-khau': 'Quên mật khẩu',
  '/dat-lai-mat-khau': 'Đặt lại mật khẩu',
  '/ca-nhan': 'Trang cá nhân',
  '/profile': 'Trang cá nhân',
}

export function formatTitle(title) {
  return title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE
}

// Tiêu đề theo đường dẫn. Trang chi tiết trường tạm hiện "Thông tin trường",
// tải xong thì trang đó tự đổi sang tên trường (useDocumentTitle).
export function titleForPath(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (path in TITLES) return formatTitle(TITLES[path])
  if (/^\/truong\/[^/]+(\/[^/]+)?$/.test(path)) return formatTitle('Thông tin trường')
  if (path === '/admin' || path.startsWith('/admin/')) return formatTitle('Quản trị')
  return formatTitle('Không tìm thấy trang')
}
