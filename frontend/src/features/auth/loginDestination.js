// Chỉ nhận đường dẫn nội bộ đã biết và đúng quyền; không nhận URL từ bên ngoài.
export function loginDestination(user, from) {
  const fallback = user?.role === 'admin' ? '/admin' : '/profile'
  const path = from?.pathname
  if (typeof path !== 'string' || /[\\?#\s]/.test(path) || path.startsWith('//')) return fallback
  if (path === '/admin' || /^\/admin\/(universities|majors|tuition|admissions|users|ai-data)\/?$/.test(path)) return user?.role === 'admin' ? path : fallback
  return ['/', '/profile', '/ca-nhan', '/truong', '/ai-tu-van', '/so-sanh'].includes(path) || /^\/truong\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path) ? path : fallback
}
