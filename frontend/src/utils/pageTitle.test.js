import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_TITLE, formatTitle, titleForPath } from './pageTitle.js'

test('trang chủ dùng tiêu đề mặc định, trang khác thêm tên trang phía trước', () => {
  assert.equal(titleForPath('/'), DEFAULT_TITLE)
  assert.equal(titleForPath('/truong'), 'Danh sách trường đại học — UniMatch HCMC')
  assert.equal(titleForPath('/ai-tu-van'), 'AI tư vấn chọn trường — UniMatch HCMC')
  assert.equal(titleForPath('/login'), titleForPath('/dang-nhap'))
})

test('bỏ dấu / cuối đường dẫn', () => {
  assert.equal(titleForPath('/ban-do/'), titleForPath('/ban-do'))
})

test('trang chi tiết trường, quản trị và đường dẫn lạ', () => {
  assert.equal(titleForPath('/truong/cong-nghe-thong-tin-dhqg/hoc-phi'), 'Thông tin trường — UniMatch HCMC')
  assert.equal(titleForPath('/truong/uit/hoc-phi/thua'), 'Không tìm thấy trang — UniMatch HCMC')
  assert.equal(titleForPath('/admin/users'), 'Quản trị — UniMatch HCMC')
  assert.equal(titleForPath('/administrator'), 'Không tìm thấy trang — UniMatch HCMC')
  assert.equal(titleForPath('/khong-ton-tai'), 'Không tìm thấy trang — UniMatch HCMC')
})

test('formatTitle không có tên thì trả tiêu đề mặc định', () => {
  assert.equal(formatTitle(''), DEFAULT_TITLE)
  assert.equal(formatTitle('Trường Đại học Công nghệ Thông tin'), 'Trường Đại học Công nghệ Thông tin — UniMatch HCMC')
})
