const mongoose = require('mongoose')

// Lịch sử AI tư vấn: lưu tiêu chí người dùng nhập và top trường trả về.
const consultationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    criteria: {
      majorCode: String,
      method: String,
      combination: String,
      score: Number,
      maxTuition: Number,
      district: String,
      institutionType: String,
      tags: [String],
    },
    results: [
      {
        university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
        matchScore: Number, // 0–100
        reasons: [String],
      },
    ],
  },
  { timestamps: true }
)

consultationSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('Consultation', consultationSchema)
