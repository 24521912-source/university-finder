import test from 'node:test'
import assert from 'node:assert/strict'
import { loginDestination } from './loginDestination.js'
test('Điều hướng mặc định theo quyền', () => { assert.equal(loginDestination({ role: 'user' }), '/profile'); assert.equal(loginDestination({ role: 'admin' }), '/admin') })
test('Chỉ nhận state.from nội bộ, trang đã biết và đúng quyền', () => {
  for (const pathname of ['https://evil.example', '//evil.example', '/admin/users', '/admin', '/unknown', '/login', '/signup', '/\\evil']) assert.equal(loginDestination({ role: 'user' }, { pathname }), '/profile')
  for (const pathname of ['/profile', '/ca-nhan', '/truong/bach-khoa-tphcm']) assert.equal(loginDestination({ role: 'user' }, { pathname }), pathname)
  assert.equal(loginDestination({ role: 'admin' }, { pathname: '/admin/users' }), '/admin/users')
})

test('Quay lại đúng mục của trang trường, bỏ query lạ và mục không tồn tại', () => {
  const from = { pathname: '/truong/kinh-te-tphcm/hoc-phi', search: '?redirect=https://example.com' }
  assert.equal(loginDestination({ role: 'user' }, from), '/truong/kinh-te-tphcm/hoc-phi')
  for (const pathname of ['/truong/kinh-te-tphcm/unknown', '/truong/kinh-te-tphcm/tuyen-sinh', '/demo/tuyen-sinh']) {
    assert.equal(loginDestination({ role: 'user' }, { pathname }), '/profile')
  }
})

test('Quản trị cấp cao được điều hướng như quản trị viên', () => {
  assert.equal(loginDestination({ role: 'superadmin' }), '/admin')
  assert.equal(loginDestination({ role: 'superadmin' }, { pathname: '/admin/users' }), '/admin/users')
})
