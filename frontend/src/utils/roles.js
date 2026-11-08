// Phân quyền phía giao diện: chỉ để ẩn/hiện nút. Backend (backend/src/utils/roles.js) mới là nơi kiểm tra thật.
export const ROLE_LABEL = { user: 'Người dùng', admin: 'Quản trị viên', superadmin: 'Quản trị cấp cao' }

export const isAdmin = (user) => user?.role === 'admin' || user?.role === 'superadmin'
export const isSuperadmin = (user) => user?.role === 'superadmin'
export const canManageAdmins = (user) => isSuperadmin(user) || (user?.role === 'admin' && user.canManageAdmins === true)

const same = (a, b) => !!(a && b) && String(a._id ?? a.id) === String(b._id ?? b.id)

// true nếu actor được thực hiện action lên target. Giống denyReason ở backend.
export function can(actor, target, action) {
  if (!isAdmin(actor) || same(actor, target) || isSuperadmin(target)) return false
  if (action === 'permissions') return isSuperadmin(actor) && target.role === 'admin'
  if (action === 'role' && !canManageAdmins(actor)) return false
  if (target.role === 'admin') {
    if (!canManageAdmins(actor)) return false
    if (!isSuperadmin(actor) && target.canManageAdmins === true) return false
  }
  return true
}
