// Hàm thuần cho bản đồ trường (WBS 4.9, 8.3): lọc, đổi dữ liệu thành điểm trên bản đồ, đọc tọa độ admin nhập.

export const HCMC_CENTER = [10.7769, 106.7009]

export const TYPE_STYLE = {
  public: { label: 'Công lập', color: '#1976d2' },
  private: { label: 'Tư thục', color: '#e65100' },
  international: { label: 'Quốc tế', color: '#7b1fa2' },
  other: { label: 'Khác', color: '#546e7a' },
}

// Bỏ dấu + chữ thường để tìm "bach khoa" ra "Bách khoa".
export const normalize = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().trim()

// items: dữ liệu GET /map/universities. filters: { q, type ('all' | institutionType), vnu (boolean) }
export function filterSchools(items, { q = '', type = 'all', vnu = false } = {}) {
  const query = normalize(q)
  return items.filter((u) => (type === 'all' || u.institutionType === type) &&
    (!vnu || u.belongsToUniversitySystem) &&
    (!query || [u.name, u.shortName, u.district].some((field) => normalize(field).includes(query))))
}

// Điểm trên bản đồ: trụ sở (id = slug) và cơ sở phụ (id = slug#số thứ tự, chấm nhỏ hơn).
export function toPoints(schools) {
  return schools.flatMap((u) => {
    const color = (TYPE_STYLE[u.institutionType] || TYPE_STYLE.other).color
    const href = `/truong/${encodeURIComponent(u.slug)}`
    const main = { id: u.slug, lat: u.lat, lng: u.lng, title: u.name, subtitle: u.address || u.district, href, color, kind: 'main' }
    const campuses = (u.campuses || []).map((c, i) => ({
      id: `${u.slug}#${i + 1}`, lat: c.lat, lng: c.lng, title: `${u.shortName || u.name} — ${c.name || `Cơ sở ${i + 1}`}`,
      subtitle: c.address, href, color, kind: 'campus',
    }))
    return [main, ...campuses]
  })
}

// GeoJSON [kinh độ, vĩ độ] -> { lat, lng } hoặc null.
export function fromGeo(location) {
  const [lng, lat] = location?.coordinates || []
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0) ? { lat, lng } : null
}

// Điểm cho bản đồ nhỏ ở trang chi tiết: trụ sở + các cơ sở có tọa độ.
export function detailPoints(u) {
  const color = (TYPE_STYLE[u?.institutionType] || TYPE_STYLE.other).color
  const main = fromGeo(u?.address?.location)
  const points = main ? [{ id: 'main', ...main, title: `Trụ sở — ${u.shortName || u.name}`, subtitle: u.address?.full, color, kind: 'main' }] : []
  for (const [i, c] of (u?.campuses || []).entries()) {
    const p = fromGeo(c.location)
    if (p) points.push({ id: `campus-${i}`, ...p, title: c.name || `Cơ sở ${i + 1}`, subtitle: c.address, color, kind: 'campus' })
  }
  return points
}

// Admin dán tọa độ dạng "10.8700, 106.8031" (vĩ độ, kinh độ — đúng thứ tự Google Maps hiện khi bấm chuột phải).
// Trả về { lat, lng }, null nếu bỏ trống, hoặc { error } nếu sai.
export function parseLatLng(text) {
  const raw = String(text ?? '').trim()
  if (!raw) return null
  const parts = raw.split(/[,;\s]+/).filter(Boolean)
  if (parts.length !== 2) return { error: 'Nhập đúng 2 số: vĩ độ, kinh độ (vd 10.8700, 106.8031)' }
  const [lat, lng] = parts.map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { error: 'Tọa độ phải là số, dùng dấu chấm cho phần thập phân' }
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return { error: 'Vĩ độ trong -90..90, kinh độ trong -180..180 (có thể bạn nhập ngược thứ tự)' }
  return { lat, lng }
}

export const formatLatLng = (location) => {
  const p = fromGeo(location)
  return p ? `${p.lat}, ${p.lng}` : ''
}
