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
// Chuẩn hóa để so: bỏ _id lồng, bỏ giá trị rỗng ('' / null / false / mảng rỗng) và sắp key theo tên.
// Nhờ vậy form thêm ô trống hay đổi thứ tự field không bị báo là "thay đổi".
function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort()
      .filter((k) => k !== '_id' && !isEmpty(value[k]))
      .map((k) => [k, normalize(value[k])]))
  }
  return value
}
const isEmpty = (v) => v === '' || v === null || v === undefined || v === false || (Array.isArray(v) && !v.length)
const same = (a, b) => JSON.stringify(isEmpty(a) ? null : normalize(a)) === JSON.stringify(isEmpty(b) ? null : normalize(b))

function changedFields(before, after) {
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})])
  return [...keys].filter((k) => !IGNORED.includes(k) && !same(before?.[k], after?.[k]))
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
