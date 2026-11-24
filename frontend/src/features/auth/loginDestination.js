import { isAdmin } from '../../utils/roles.js'

// Chỉ nhận đường dẫn nội bộ đã biết và đúng quyền; không nhận URL từ bên ngoài.
export function loginDestination(user, from) {
  const fallback = isAdmin(user) ? '/admin' : '/profile'
  const path = from?.pathname
  if (typeof path !== 'string' || /[\\?#\s]/.test(path) || path.startsWith('//')) return fallback
  if (path === '/admin' || /^\/admin\/(universities|majors|tuition|admissions|users|ai-data)\/?$/.test(path)) return isAdmin(user) ? path : fallback
  const detailPath = /^\/truong\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/(?:tong-quan|nganh-dao-tao|diem-chuan|hoc-phi|co-so-vi-tri|lien-he))?$/.test(path)
  if (!['/', '/profile', '/ca-nhan', '/truong', '/ai-tu-van', '/so-sanh', '/ban-do'].includes(path) && !detailPath) return fallback
  return path
}
