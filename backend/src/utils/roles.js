// Quy tắc phân quyền dùng chung (middleware, quản lý tài khoản, test).
//
// superadmin  : quản trị cấp cao (tối đa MAX_SUPERADMINS, chỉ tạo bằng lệnh `npm run make-admin -- email --super`).
//               Nâng/hạ/khóa/xóa quản trị viên, trao/thu quyền "quản lý quản trị viên".
// admin + canManageAdmins : nâng user lên admin; hạ/khóa/xóa admin THƯỜNG (không có quyền này).
// admin       : sửa dữ liệu trường; tạo/khóa/xóa USER thường.
// user        : người dùng.
// Không ai thao tác lên chính mình hoặc lên quản trị cấp cao qua web.

const ADMIN_ROLES = ['admin', 'superadmin']
const MAX_SUPERADMINS = 2

const isAdmin = (user) => ADMIN_ROLES.includes(user?.role)
const isSuperadmin = (user) => user?.role === 'superadmin'
const canManageAdmins = (user) => isSuperadmin(user) || (user?.role === 'admin' && user.canManageAdmins === true)
const sameUser = (a, b) => a?._id && b?._id && String(a._id) === String(b._id)

// Trả về câu báo lỗi nếu actor KHÔNG được thao tác lên target, ngược lại null.
// action: 'status' (khóa/mở), 'delete', 'role', 'permissions'
function denyReason(actor, target, action, payload = {}) {
  if (!isAdmin(actor)) return 'Chỉ quản trị viên được thực hiện'
  if (sameUser(actor, target)) return 'Không thể tự thay đổi quyền, khóa hoặc xóa tài khoản của chính mình'
  if (isSuperadmin(target)) return 'Không thể thay đổi quản trị viên cấp cao trên web'

  if (action === 'permissions') {
    if (!isSuperadmin(actor)) return 'Chỉ quản trị viên cấp cao được trao hoặc thu quyền quản lý quản trị viên'
    if (target.role !== 'admin') return 'Chỉ trao quyền này cho quản trị viên'
    return null
  }

  if (action === 'role') {
    if (!['user', 'admin'].includes(payload.role)) return 'Vai trò không hợp lệ'
    if (!canManageAdmins(actor)) return 'Bạn không có quyền nâng hoặc hạ quản trị viên'
  }

  if (target.role === 'admin') {
    if (!canManageAdmins(actor)) return 'Bạn không có quyền thao tác lên quản trị viên'
    // Admin được trao quyền không được đụng admin khác cũng có quyền đó (tránh hạ quyền lẫn nhau).
    if (!isSuperadmin(actor) && target.canManageAdmins === true) return 'Chỉ quản trị viên cấp cao được thao tác lên quản trị viên này'
  }
  return null
}

module.exports = { ADMIN_ROLES, MAX_SUPERADMINS, isAdmin, isSuperadmin, canManageAdmins, denyReason }
