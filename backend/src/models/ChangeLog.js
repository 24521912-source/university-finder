const mongoose = require('mongoose')

// Lịch sử thay đổi do quản trị viên thực hiện: lưu bản trước / sau để xem lại và khôi phục.
// Dùng collection admin_logs có sẵn trên Atlas.
const changeLogSchema = new mongoose.Schema(
  {
    actor: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      email: String,
      fullName: String,
      role: String,
    },
    // create | update | delete | status | role | permissions | restore
    action: { type: String, required: true },
    entity: { type: String, enum: ['university', 'user'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    entityLabel: String, // tên trường / email để dễ đọc
    before: { type: mongoose.Schema.Types.Mixed, default: null }, // null = trước đó chưa có
    after: { type: mongoose.Schema.Types.Mixed, default: null }, // null = đã bị xóa hẳn
    restoredFrom: { type: mongoose.Schema.Types.ObjectId, default: null }, // log được khôi phục (action restore)
    changedFields: [String], // field cấp ngoài cùng khác nhau giữa before / after
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'admin_logs', minimize: false }
)

changeLogSchema.index({ createdAt: -1 })
changeLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 })

module.exports = mongoose.model('ChangeLog', changeLogSchema)
