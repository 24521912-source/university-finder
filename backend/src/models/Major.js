const mongoose = require('mongoose')

// Danh mục ngành dùng chung: mã ngành theo Bộ GD&ĐT, mọi trường tham chiếu bằng `code`.
const majorSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    fieldGroup: { type: String, trim: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Major', majorSchema)
