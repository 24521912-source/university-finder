const Major = require('../../models/Major')

// Danh mục ngành (mã Bộ GD&ĐT, tên, nhóm ngành) đọc từ MongoDB.
async function list() {
  return Major.find().select('code name fieldGroup -_id').sort({ code: 1 }).lean()
}

module.exports = { list }
