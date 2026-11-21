const University = require('../../models/University')

// Tọa độ GeoJSON lưu [kinh độ, vĩ độ]. Trả về { lat, lng } nếu hợp lệ, ngược lại null.
function toLatLng(location) {
  const [lng, lat] = location?.coordinates || []
  const ok = typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) &&
    Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0)
  return ok ? { lat, lng } : null
}

const MAP_FIELDS = 'slug name shortName institutionType belongsToUniversitySystem address media.logoUrl campuses dataLevel'

// Dữ liệu bản đồ (WBS 5.7): trường có tọa độ trụ sở -> items (kèm cơ sở phụ có tọa độ);
// trường chưa có tọa độ -> missing để giao diện / admin biết cần bổ sung.
async function universities() {
  const docs = await University.find().select(MAP_FIELDS).sort({ name: 1 }).lean()
  const items = []
  const missing = []
  for (const u of docs) {
    const base = {
      slug: u.slug,
      name: u.name,
      shortName: u.shortName ?? null,
      district: u.address?.district ?? null,
    }
    const point = toLatLng(u.address?.location)
    if (!point) {
      missing.push(base)
      continue
    }
    items.push({
      ...base,
      ...point,
      institutionType: u.institutionType,
      belongsToUniversitySystem: u.belongsToUniversitySystem === true,
      address: u.address?.full ?? null,
      logoUrl: u.media?.logoUrl ?? null,
      dataLevel: u.dataLevel,
      campuses: (u.campuses || [])
        .map((c) => ({ name: c.name ?? null, address: c.address ?? null, ...toLatLng(c.location) }))
        .filter((c) => c.lat !== undefined),
    })
  }
  return { items, missing }
}

module.exports = { universities, toLatLng }
