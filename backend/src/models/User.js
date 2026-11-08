const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }, // bcrypt hash, không lưu mật khẩu rõ
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    // Admin được quản trị cấp cao trao quyền nâng/hạ/khóa/xóa quản trị viên thường
    canManageAdmins: { type: Boolean, default: false },
    // locked: không đăng nhập / gọi API được. Mở khóa lại được.
    status: { type: String, enum: ['active', 'locked'], default: 'active' },
    // Xóa mềm: có giá trị = đã xóa (ẩn khỏi danh sách, không đăng nhập được), khôi phục được.
    deletedAt: { type: Date, default: null },
    // Tài khoản admin tạo hộ với mật khẩu tạm -> nhắc người dùng đổi mật khẩu.
    mustChangePassword: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Nhúng thẳng vào user: số trường có giới hạn (~70) nên mảng không phình vô hạn.
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'University' }],
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
