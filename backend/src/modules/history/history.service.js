const ChangeLog = require('../../models/ChangeLog')
const University = require('../../models/University')
const User = require('../../models/User')
const httpError = require('../../utils/httpError')
const { denyReason } = require('../../utils/roles')
const { record } = require('./history.recorder')

const PAGE_SIZE = 30
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// Field tài khoản được khôi phục. Không đụng mật khẩu, email.
const USER_FIELDS = ['fullName', 'role', 'canManageAdmins', 'status', 'deletedAt']
const USER_SELECT = 'fullName email role canManageAdmins status deletedAt mustChangePassword createdAt createdBy'

async function list({ entity = '', action = '', q = '', page = 1 } = {}) {
  const p = Math.max(1, Math.min(1000, Number.parseInt(page, 10) || 1))
  const filter = {}
  if (['university', 'user'].includes(entity)) filter.entity = entity
  if (typeof action === 'string' && /^[a-z]{1,20}$/.test(action)) filter.action = action
  const text = String(q).trim().slice(0, 100)
  if (text) filter.$or = ['entityLabel', 'actor.email'].map((f) => ({ [f]: { $regex: escapeRegex(text), $options: 'i' } }))
  const [items, total] = await Promise.all([
    // Danh sách không kèm before/after (có thể rất lớn); xem chi tiết bằng get(id).
    ChangeLog.find(filter).select('-before -after').sort({ createdAt: -1 }).skip((p - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    ChangeLog.countDocuments(filter),
  ])
  return { items, page: p, pageSize: PAGE_SIZE, total }
}

async function get(id) {
  const log = await ChangeLog.findById(id).lean()
  if (!log) throw httpError(404, 'Không tìm thấy dòng lịch sử')
  return log
}

// Đưa trường về đúng bản "before" của dòng lịch sử (giữ nguyên _id của trường và từng dòng con).
async function restoreUniversity(actor, log) {
  const current = await University.findById(log.entityId).lean()
  let after = null
  if (!log.before) {
    // Dòng lịch sử là "tạo mới" -> khôi phục = xóa trường đã tạo.
    if (!current) throw httpError(409, 'Trường này hiện không còn trong database')
    await University.deleteOne({ _id: log.entityId })
  } else if (current) {
    await University.replaceOne({ _id: log.entityId }, log.before, { runValidators: true })
    after = await University.findById(log.entityId).lean()
  } else {
    after = (await University.create(log.before)).toObject()
  }
  return { current, after, label: log.before?.name || current?.name || log.entityLabel }
}

// Tài khoản: chỉ khôi phục vai trò / quyền / trạng thái / xóa mềm / họ tên, và chỉ khi người khôi phục có quyền.
async function restoreUser(actor, log) {
  const current = await User.findById(log.entityId).select(USER_SELECT).lean()
  if (!current) throw httpError(404, 'Tài khoản không còn trong database')
  const desired = log.before
    ? Object.fromEntries(USER_FIELDS.map((k) => [k, log.before[k] ?? (k === 'deletedAt' ? null : k === 'canManageAdmins' ? false : undefined)]).filter(([, v]) => v !== undefined))
    : { deletedAt: new Date() } // dòng "tạo hộ" -> khôi phục = xóa mềm tài khoản đã tạo
  if (desired.role === 'superadmin') throw httpError(403, 'Không khôi phục quyền quản trị cấp cao trên web')

  const changed = (k) => k in desired && JSON.stringify(desired[k] ?? null) !== JSON.stringify(current[k] ?? null)
  const checks = []
  if (changed('role')) checks.push(['role', { role: desired.role }])
  if (changed('canManageAdmins')) checks.push(['permissions'])
  if (changed('status')) checks.push(['status'])
  if (changed('deletedAt')) checks.push(['delete'])
  if (changed('fullName') && !checks.length) checks.push(['status'])
  if (!checks.length) throw httpError(409, 'Tài khoản đang giống hệt bản cần khôi phục')
  // Kiểm tra quyền trên cả trạng thái hiện tại và trạng thái sau khôi phục (vd khôi phục thành admin có quyền quản lý).
  for (const [action, payload] of checks) {
    const reason = denyReason(actor, current, action, payload) || denyReason(actor, { ...current, ...desired }, action, payload)
    if (reason) throw httpError(403, reason)
  }
  if (desired.canManageAdmins && desired.role !== 'admin') desired.canManageAdmins = false

  const after = await User.findOneAndUpdate({ _id: current._id, role: current.role }, desired, { returnDocument: 'after', runValidators: true }).select(USER_SELECT).lean()
  if (!after) throw httpError(409, 'Tài khoản vừa bị thay đổi bởi người khác, vui lòng tải lại')
  return { current, after, label: current.email }
}

async function restore(actor, id) {
  const log = await get(id)
  const { current, after, label } = log.entity === 'university' ? await restoreUniversity(actor, log) : await restoreUser(actor, log)
  const entry = await record({ actor, action: 'restore', entity: log.entity, entityId: log.entityId, entityLabel: label, before: current, after, restoredFrom: log._id })
  return { restored: true, logId: String(entry._id) }
}

async function remove(id) {
  const log = await ChangeLog.findByIdAndDelete(id).lean()
  if (!log) throw httpError(404, 'Không tìm thấy dòng lịch sử')
  return { deleted: true }
}

module.exports = { list, get, restore, remove }
