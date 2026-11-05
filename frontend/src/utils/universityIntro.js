// Tóm tắt phần Giới thiệu trang chi tiết trường, chỉ dựa trên dữ liệu đã có trong hồ sơ.
// Không thêm xếp hạng hay tuyên bố nào không có trong dữ liệu.
import catalog from '../../../database/seeds/majors.json'
import { INSTITUTION_TYPE_LABEL } from './format'

const FIELD_GROUP = new Map(catalog.map((m) => [m.code, m.fieldGroup]))
const plain = (value) => typeof value === 'string' && value.trim() ? value.trim() : null

export function introBadges(u, profile) {
  const badges = []
  if (u.belongsToUniversitySystem === true && plain(u.universitySystem)) badges.push(`Thành viên ${u.universitySystem.trim()}`)
  if (INSTITUTION_TYPE_LABEL[u.institutionType]) badges.push(INSTITUTION_TYPE_LABEL[u.institutionType])
  const year = profile.foundedYear
  if (Number.isInteger(year) && year > 1000) {
    const age = new Date().getFullYear() - year
    badges.push(age > 0 ? `Thành lập ${year} · ${age} năm` : `Thành lập ${year}`)
  }
  return badges
}

// Nhóm ngành có nhiều ngành đào tạo nhất (theo danh mục ngành của Bộ GD&ĐT).
export function strengthGroups(u, data, limit = 3) {
  const source = data.majors.length ? data.majors : (Array.isArray(u.majors) ? u.majors : [])
  const counts = new Map()
  for (const code of new Set(source.map((m) => m?.code))) {
    const group = FIELD_GROUP.get(code)
    if (group) counts.set(group, (counts.get(group) || 0) + 1)
  }
  // Nhóm chỉ có 1 ngành chưa đủ gọi là thế mạnh; nhóm đứng đầu luôn được giữ.
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'vi'))
    .filter(([, count], i) => i === 0 || count >= 2).slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

// Dữ liệu `program` mỗi trường ghi một kiểu ("Tiêu chuẩn (mã XT 106)", "Tiên tiến: Marketing [mã ...]"...).
// Gom về các loại chương trình dễ hiểu; tên không khớp loại nào (thường là tên ngành) thì bỏ qua.
const PROGRAM_KINDS = [
  ['Liên kết quốc tế', /liên kết|partnership|\b(bcu|uon)\b|\d\s*\+\s*\d|co-operative/i],
  ['Tài năng / Elite', /tài năng|elite|honors?\b/i],
  ['Tiên tiến', /tiên tiến|advanced program/i],
  ['Chất lượng cao', /chất lượng cao|\bclc\b|high[- ]quality/i],
  ['Tiếng Anh', /^(chương trình )?tiếng anh\s*($|[(:])|giảng dạy (hoàn toàn )?bằng tiếng anh|english[- ]taught|global standard/i],
  ['Định hướng Nhật Bản', /việt nhật|định hướng nhật/i],
  ['Tiêu chuẩn', /tiêu chuẩn|chương trình chuẩn|\(chuẩn\)|^chuẩn\b|đại trà|standard program/i],
]

export function programKinds(programs) {
  const found = new Set()
  for (const p of programs) {
    const kind = PROGRAM_KINDS.find(([, re]) => re.test(p))
    if (kind) found.add(kind[0])
  }
  // Tiêu chuẩn trước, liên kết quốc tế sau cùng.
  return PROGRAM_KINDS.map(([label]) => label).filter((label) => found.has(label)).reverse()
}

// Các ngành có điểm chuẩn cao nhất, chỉ so trong cùng một phương thức, năm và thang điểm.
export function topMajors(data, limit = 3) {
  if (data.admissionGroups?.length) {
    const rows = [...data.admissionGroups].sort((a, b) => b.score - a.score).slice(0, limit)
    return {
      label: `${rows[0].kind.label} · ${rows[0].year} · thang ${rows[0].scale}`,
      rows: rows.map((g) => ({ key: `${g.examCode}-${g.program}`, name: g.groupName.replace(/\s*\(.*\)\s*$/, ''), score: g.score, scale: g.scale, sourceUrl: g.sourceUrl })),
    }
  }
  const buckets = new Map()
  for (const a of data.admissions) {
    const key = `${a.kind.key}|${a.year}|${a.scale}`
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(a)
  }
  // Ưu tiên năm mới nhất, sau đó nhóm có nhiều ngành nhất.
  const best = [...buckets.values()].sort((x, y) => y[0].year - x[0].year || y.length - x.length)[0]
  if (!best) return null
  const names = new Map(data.majors.map((m) => [m.code, m.name]))
  const perMajor = new Map()
  for (const a of best) if (!perMajor.has(a.majorCode) || a.score > perMajor.get(a.majorCode).score) perMajor.set(a.majorCode, a)
  const rows = [...perMajor.values()].sort((a, b) => b.score - a.score).slice(0, limit)
  return {
    label: `${best[0].kind.label} · ${best[0].year} · thang ${best[0].scale}`,
    rows: rows.map((a) => ({ key: a.majorCode, name: names.get(a.majorCode) || a.majorCode, score: a.score, scale: a.scale, sourceUrl: a.sourceUrl })),
  }
}
