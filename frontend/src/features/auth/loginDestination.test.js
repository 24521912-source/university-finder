import test from 'node:test'
import assert from 'node:assert/strict'
import { loginDestination } from './loginDestination.js'
test('Điều hướng mặc định theo quyền', () => { assert.equal(loginDestination({ role: 'user' }), '/profile'); assert.equal(loginDestination({ role: 'admin' }), '/admin') })
test('Chỉ nhận state.from nội bộ, trang đã biết và đúng quyền', () => {
  for (const pathname of ['https://evil.example', '//evil.example', '/admin/users', '/admin', '/unknown', '/login', '/signup', '/\\evil']) assert.equal(loginDestination({ role: 'user' }, { pathname }), '/profile')
  for (const pathname of ['/profile', '/ca-nhan', '/truong/bach-khoa-tphcm']) assert.equal(loginDestination({ role: 'user' }, { pathname }), pathname)
  assert.equal(loginDestination({ role: 'admin' }, { pathname: '/admin/users' }), '/admin/users')
})

test('returns to the admissions checklist and year after login, ignoring unrelated query parameters', () => {
  const from = { pathname: '/truong/kinh-te-tphcm/tuyen-sinh', search: '?muc=ho-so&nam=2026&redirect=https://example.com' }
  assert.equal(loginDestination({ role: 'user' }, from), '/truong/kinh-te-tphcm/tuyen-sinh?muc=ho-so&nam=2026')
  assert.equal(loginDestination({ role: 'user' }, { pathname: '/demo/tuyen-sinh', search: '?muc=ho-so' }), '/demo/tuyen-sinh?muc=ho-so')
  assert.equal(loginDestination({ role: 'user' }, { pathname: '/truong/kinh-te-tphcm/unknown' }), '/profile')
})
