const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }, // bcrypt hash, không lưu mật khẩu rõ
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // Nhúng thẳng vào user: số trường có giới hạn (~70) nên mảng không phình vô hạn.
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'University' }],
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
