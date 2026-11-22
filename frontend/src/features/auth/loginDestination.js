import { isAdmin } from '../../utils/roles.js'

// Chỉ nhận đường dẫn nội bộ đã biết và đúng quyền; không nhận URL từ bên ngoài.
export function loginDestination(user, from) {
  const fallback = isAdmin(user) ? '/admin' : '/profile'
  const path = from?.pathname
  if (typeof path !== 'string' || /[\\?#\s]/.test(path) || path.startsWith('//')) return fallback
  if (path === '/admin' || /^\/admin\/(universities|majors|tuition|admissions|users|ai-data)\/?$/.test(path)) return isAdmin(user) ? path : fallback
  const detailPath = /^\/truong\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/(?:tong-quan|nganh-dao-tao|diem-chuan|tuyen-sinh|hoc-phi|co-so-vi-tri|lien-he))?$/.test(path)
  const previewPath = path === '/demo/tuyen-sinh'
  if (!['/', '/profile', '/ca-nhan', '/truong', '/ai-tu-van', '/so-sanh', '/ban-do'].includes(path) && !detailPath && !previewPath) return fallback
  const query = new URLSearchParams(typeof from.search === 'string' ? from.search : '')
  const preserved = new URLSearchParams()
  if (previewPath || path.endsWith('/tuyen-sinh')) {
    if (['phuong-thuc', 'moc-thoi-gian', 'huong-dan', 'ho-so'].includes(query.get('muc'))) preserved.set('muc', query.get('muc'))
    if (/^\d{4}$/.test(query.get('nam') || '')) preserved.set('nam', query.get('nam'))
  }
  return path + (preserved.size ? `?${preserved}` : '')
}
