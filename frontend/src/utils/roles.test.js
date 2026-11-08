import test from 'node:test'
import assert from 'node:assert/strict'
import { can, isAdmin } from './roles.js'

// Phải khớp backend/src/utils/roles.js (denyReason). Backend vẫn kiểm tra lại.
test('giao diện ẩn/hiện nút đúng quyền', () => {
  const sup = { _id: 's', role: 'superadmin' }
  const granted = { _id: 'g', role: 'admin', canManageAdmins: true }
  const admin = { _id: 'a', role: 'admin' }
  const user = { _id: 'u', role: 'user' }
  assert(isAdmin(sup) && isAdmin(admin) && !isAdmin(user))
  assert(!can(admin, admin, 'status'))
  assert(!can(sup, { _id: 's2', role: 'superadmin' }, 'status'))
  assert(can(admin, user, 'status') && !can(admin, user, 'role') && !can(admin, { _id: 'a2', role: 'admin' }, 'status'))
  assert(can(granted, user, 'role') && can(granted, admin, 'delete') && !can(granted, { _id: 'g2', role: 'admin', canManageAdmins: true }, 'status'))
  assert(!can(granted, admin, 'permissions') && can(sup, admin, 'permissions') && !can(sup, user, 'permissions'))
  assert(!can({ id: 'a', role: 'admin' }, admin, 'status'), 'so sánh được user.id (AuthContext) với _id')
})
