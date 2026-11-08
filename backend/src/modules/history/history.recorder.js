// Ghi một dòng lịch sử. Các module khác gọi record(...) sau mỗi thay đổi của quản trị viên.
const ChangeLog = require('../../models/ChangeLog')

// Không bao giờ lưu mật khẩu (kể cả dạng mã hóa) vào lịch sử.
const SECRET = ['passwordHash', '__v']
function snapshot(doc) {
  if (!doc) return null
  const plain = JSON.parse(JSON.stringify(typeof doc.toObject === 'function' ? doc.toObject() : doc))
  for (const key of SECRET) delete plain[key]
  return plain
}

const IGNORED = ['_id', 'createdAt', 'updatedAt']
function changedFields(before, after) {
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})])
  return [...keys].filter((k) => !IGNORED.includes(k) && JSON.stringify(before?.[k] ?? null) !== JSON.stringify(after?.[k] ?? null))
}

async function record({ actor, action, entity, entityId, entityLabel, before = null, after = null, restoredFrom = null }) {
  const b = snapshot(before)
  const a = snapshot(after)
  return ChangeLog.create({
    actor: actor ? { _id: actor._id, email: actor.email, fullName: actor.fullName, role: actor.role } : undefined,
    action, entity, entityId, entityLabel, before: b, after: a, restoredFrom, changedFields: changedFields(b, a),
  })
}

module.exports = { record, snapshot, changedFields }
