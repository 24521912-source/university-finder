const bcrypt = require('bcryptjs')
const User = require('../../models/User')
const httpError = require('../../utils/httpError')
const { denyReason } = require('../../utils/roles')

const PAGE_SIZE = 20
// Không bao giờ trả passwordHash.
const FIELDS = 'fullName email role canManageAdmins status deletedAt mustChangePassword createdAt createdBy'
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const toAccount = (u) => ({
  _id: String(u._id),
  fullName: u.fullName,
  email: u.email,
  role: u.role,
  canManageAdmins: u.canManageAdmins === true,
  status: u.status || 'active',
  deleted: !!u.deletedAt,
  mustChangePassword: u.mustChangePassword === true,
  createdAt: u.createdAt,
})

async function list({ q = '', role = '', status = '', page = 1 } = {}) {
  const p = Math.max(1, Math.min(1000, Number.parseInt(page, 10) || 1))
  const filter = { deletedAt: null }
  const text = String(q).trim().slice(0, 100)
  if (text) filter.$or = ['fullName', 'email'].map((f) => ({ [f]: { $regex: escapeRegex(text), $options: 'i' } }))
  if (['user', 'admin', 'superadmin'].includes(role)) filter.role = role
  if (['active', 'locked'].includes(status)) filter.status = status === 'active' ? { $ne: 'locked' } : 'locked'
  const [items, total] = await Promise.all([
    User.find(filter).select(FIELDS).sort({ createdAt: -1 }).skip((p - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    User.countDocuments(filter),
  ])
  return { items: items.map(toAccount), page: p, pageSize: PAGE_SIZE, total }
}

async function create(actor, { fullName, email, password }) {
  email = email.trim().toLowerCase()
  if (await User.exists({ email })) throw httpError(409, 'Email đã được đăng ký')
  const user = await User.create({
    fullName: fullName.trim(), email, passwordHash: await bcrypt.hash(password, 10),
    role: 'user', mustChangePassword: true, createdBy: actor._id,
  })
  return toAccount(user)
}

// Đọc tài khoản đích rồi kiểm tra quyền của actor trước mọi thay đổi.
async function loadTarget(actor, id, action, payload) {
  const target = await User.findOne({ _id: id, deletedAt: null }).select(FIELDS).lean()
  if (!target) throw httpError(404, 'Không tìm thấy tài khoản')
  const reason = denyReason(actor, target, action, payload)
  if (reason) throw httpError(403, reason)
  return target
}

// Cập nhật có điều kiện: tài khoản phải còn đúng vai trò lúc kiểm tra quyền (tránh 2 người sửa cùng lúc).
async function apply(target, update) {
  const user = await User.findOneAndUpdate({ _id: target._id, role: target.role, deletedAt: null }, update,
    { returnDocument: 'after', runValidators: true }).select(FIELDS).lean()
  if (!user) throw httpError(409, 'Tài khoản vừa bị thay đổi bởi người khác, vui lòng tải lại')
  return toAccount(user)
}

async function setStatus(actor, id, { status }) {
  return apply(await loadTarget(actor, id, 'status'), { status })
}

async function setRole(actor, id, { role }) {
  const target = await loadTarget(actor, id, 'role', { role })
  // Hạ xuống user thì thu luôn quyền quản lý quản trị viên.
  return apply(target, role === 'user' ? { role, canManageAdmins: false } : { role })
}

async function setPermissions(actor, id, { canManageAdmins }) {
  return apply(await loadTarget(actor, id, 'permissions'), { canManageAdmins })
}

// Xóa mềm: giữ dữ liệu để khôi phục; tài khoản không đăng nhập được, ẩn khỏi danh sách.
async function remove(actor, id) {
  return apply(await loadTarget(actor, id, 'delete'), { deletedAt: new Date() })
}

module.exports = { list, create, setStatus, setRole, setPermissions, remove, toAccount }
