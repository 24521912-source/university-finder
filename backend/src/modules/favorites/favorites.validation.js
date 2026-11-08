// Trả về câu báo lỗi, hoặc null nếu hợp lệ (cùng kiểu với auth.validation.js).
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validateSlug(slug) {
  if (typeof slug !== 'string' || slug.length > 150 || !SLUG.test(slug)) return 'Đường dẫn trường không hợp lệ'
  return null
}

module.exports = { validateSlug }
