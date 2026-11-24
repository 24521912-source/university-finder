const test = require('node:test')
const assert = require('node:assert/strict')
const { passwordError } = require('../src/utils/passwordPolicy')
const { validateRegister, validatePasswordChange, validateResetPassword } = require('../src/modules/auth/auth.validation')
const { validateCreate } = require('../src/modules/accounts/accounts.validation')

const TOKEN = 'ab'.repeat(32)

test('Chặn mật khẩu quá phổ biến, lặp ký tự hoặc dãy liên tiếp (không phân biệt hoa thường)', () => {
  for (const password of ['123456', '12345678', '1234567890', '987654', '000000', 'aaaaaaa', 'abcdef',
    'Password', 'PASSWORD123', 'qwerty', 'Qwerty123', 'matkhau123', 'iloveyou', ' admin123 ', 'unimatch']) {
    assert.match(passwordError(password), /quá phổ biến/, password)
  }
})

test('Mật khẩu đủ mạnh thì cho qua; quá ngắn hoặc sai kiểu thì báo độ dài', () => {
  for (const password of ['UniMatch@2026!', 'test-only-password', 'new-pass', 'Hoa sen 2026']) assert.equal(passwordError(password), null, password)
  for (const password of ['12345', '', undefined, null, { $ne: '' }, ['abcdefgh']]) assert.match(passwordError(password), /tối thiểu 6 ký tự/)
})

test('Không cho trùng email hoặc phần trước @', () => {
  assert.match(passwordError('tu.nguyen', { email: 'Tu.Nguyen@example.org' }), /trùng với email/)
  assert.match(passwordError('tu.nguyen@example.org', { email: 'tu.nguyen@example.org' }), /trùng với email/)
  assert.equal(passwordError('tu.nguyen-2026', { email: 'tu.nguyen@example.org' }), null)
})

test('Áp dụng cho đăng ký, đổi mật khẩu, đặt lại mật khẩu và admin tạo tài khoản', () => {
  const base = { fullName: 'Test', email: 'test@example.org' }
  assert.match(validateRegister({ ...base, password: '123456' }), /^Mật khẩu quá phổ biến/)
  assert.equal(validateRegister({ ...base, password: 'UniMatch@2026!' }), null)
  assert.match(validatePasswordChange({ currentPassword: 'old-secret', newPassword: 'password1' }), /^Mật khẩu mới quá phổ biến/)
  assert.match(validatePasswordChange({ currentPassword: 'same-secret', newPassword: 'same-secret' }), /phải khác/)
  assert.match(validateResetPassword({ token: TOKEN, password: '11111111' }), /^Mật khẩu mới quá phổ biến/)
  assert.equal(validateResetPassword({ token: TOKEN, password: 'UniMatch@2026!' }), null)
  assert.match(validateCreate({ ...base, password: 'abc123' }), /^Mật khẩu tạm quá phổ biến/)
  assert.equal(validateCreate({ ...base, password: 'K7mPq9xR' }), null)
})
