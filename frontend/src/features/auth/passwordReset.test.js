import test from 'node:test'
import assert from 'node:assert/strict'
import { isResetToken, passwordProblem } from './passwordReset.js'

test('chỉ nhận mã đặt lại 64 ký tự hex thường', () => {
  assert.equal(isResetToken('ab'.repeat(32)), true)
  for (const token of [null, undefined, '', 'abc', 'AB'.repeat(32), 'ab'.repeat(32) + 'c', 'zz'.repeat(32)]) assert.equal(isResetToken(token), false)
})

test('mật khẩu mới phải đủ dài và nhập lại khớp', () => {
  assert.match(passwordProblem('12345', '12345'), /tối thiểu 6/)
  assert.match(passwordProblem('123456', '1234567'), /không khớp/)
  assert.equal(passwordProblem('123456', '123456'), '')
})
