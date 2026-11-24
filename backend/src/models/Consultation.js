const mongoose = require('mongoose')

// Lịch sử AI tư vấn: lưu tiêu chí người dùng nhập và top trường trả về.
const consultationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    criteria: {
      majorCode: String,
      majorLabel: String, // tên ngành / nhóm ngành người dùng chọn
      method: String,
      combination: String,
      score: Number,
      maxTuition: Number, // đồng/năm, null = không quan trọng
      district: String,
      institutionType: String,
      vnuhcm: String, // only | exclude | any
      tags: [String],
    },
    results: [
      {
        university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
        major: String, // ngành đại diện được chấm điểm
        matchScore: Number, // 0–100
        coverage: Number, // 0–100, độ phủ dữ liệu
        reasons: [String],
      },
    ],
  },
  { timestamps: true }
)

consultationSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('Consultation', consultationSchema)
