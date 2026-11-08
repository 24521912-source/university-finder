// Trả về câu báo lỗi, hoặc null nếu hợp lệ.
const OBJECT_ID = /^[a-f0-9]{24}$/i

function validateId(id) {
  return typeof id === 'string' && OBJECT_ID.test(id) ? null : 'ID lịch sử không hợp lệ'
}

module.exports = { validateId }
