const University = require('../../models/University')
const Major = require('../../models/Major')
const httpError = require('../../utils/httpError')
const { annualTuitionFrom, filterAndSort } = require('./universities.search')

const UNIT_ORDER = ['year', 'semester', 'credit', 'program']

// Tóm tắt một trường cho thẻ UniversityCard ở frontend. Dùng chung cho danh sách, kết quả AI, yêu thích, so sánh.
// tuitionFrom: mức thấp nhất (> 0) theo đơn vị ưu tiên năm -> học kỳ -> tín chỉ -> trọn khóa (khác đơn vị không so được)
// scoreFrom:   điểm chuẩn thấp nhất thang 30 của năm gần nhất (null nếu trường không có điểm thang 30)
function toCard(u) {
  const fees = (u.tuition || []).filter((t) => t.amountMin > 0)
  const unit = UNIT_ORDER.find((x) => fees.some((t) => t.unit === x))
  const amount = unit ? Math.min(...fees.filter((t) => t.unit === unit).map((t) => t.amountMin)) : null

  const scores30 = (u.admissions || []).filter((a) => a.scale === 30)
  const latestYear = Math.max(...scores30.map((a) => a.year))
  const scoreFrom = scores30.length
    ? Math.min(...scores30.filter((a) => a.year === latestYear).map((a) => a.score))
    : null

  return {
    _id: u._id,
    slug: u.slug,
    name: u.name,
    shortName: u.shortName,
    institutionType: u.institutionType,
    belongsToUniversitySystem: u.belongsToUniversitySystem,
    district: u.address?.district ?? null,
    logoUrl: u.media?.logoUrl ?? null,
    favoriteCount: u.favoriteCount ?? 0,
    dataLevel: u.dataLevel,
    tuitionFrom: unit ? { amount, unit } : null,
    scoreFrom,
    majors: (u.majors || []).slice(0, 3).map((m) => m.name),
  }
}

// Các field toCard cần - dùng trong .select() để không tải cả document
const CARD_FIELDS =
  'slug name shortName institutionType belongsToUniversitySystem address.district media.logoUrl favoriteCount dataLevel ' +
  'tuition.amountMin tuition.unit admissions.score admissions.scale admissions.year majors.name'

// Trường có dữ liệu đầy đủ xếp trước, cùng mức thì theo tên.
const DEFAULT_SORT = { dataLevel: -1, name: 1 }

async function list() {
  const universities = await University.find().select(CARD_FIELDS).sort(DEFAULT_SORT).lean()
  return universities.map(toCard)
}

// ================= Tìm kiếm và lọc (WBS 5.4) =================

// Mã ngành cần lọc: một ngành cụ thể, hoặc mọi ngành thuộc một nhóm ngành. null = không lọc theo ngành.
async function majorCodesFor({ major, group }) {
  if (major) return [major]
  if (group) return Major.find({ fieldGroup: group }).distinct('code')
  return null
}

// filters: kết quả của validateSearch() -> { q, type, vnuOnly, group, major, district, maxTuition }
async function search(filters) {
  // Bước 1: MongoDB lọc các field so sánh bằng được.
  const where = {}
  if (filters.type) where.institutionType = filters.type
  if (filters.vnuOnly) where.belongsToUniversitySystem = true
  if (filters.district) where['address.district'] = filters.district

  const majorCodes = await majorCodesFor(filters)
  if (majorCodes) where['majors.code'] = { $in: majorCodes }

  const universities = await University.find(where).select(CARD_FIELDS).sort(DEFAULT_SORT).lean()

  // Bước 2: lọc tên không dấu + học phí quy đổi theo năm, rồi xếp kết quả khớp tên viết tắt lên đầu.
  const matched = filterAndSort(universities, filters)
  return { total: matched.length, items: matched.map(toCard) }
}

// Dữ liệu cho các ô chọn của bộ lọc: chỉ gồm khu vực / ngành mà ít nhất một trường đang có.
async function filterOptions() {
  const [districts, offeredCodes, majors] = await Promise.all([
    University.distinct('address.district'),
    University.distinct('majors.code'),
    Major.find().select('code name fieldGroup -_id').sort({ code: 1 }).lean(),
  ])

  const offered = new Set(offeredCodes)
  const groups = new Map() // tên nhóm ngành -> danh sách ngành
  for (const major of majors) {
    if (!offered.has(major.code)) continue
    const groupName = major.fieldGroup || 'Khác'
    if (!groups.has(groupName)) groups.set(groupName, [])
    groups.get(groupName).push({ code: major.code, name: major.name })
  }

  const byVietnamese = (a, b) => a.localeCompare(b, 'vi')
  return {
    districts: districts.filter(Boolean).sort(byVietnamese),
    majorGroups: [...groups.entries()]
      .sort(([a], [b]) => byVietnamese(a, b))
      .map(([name, list]) => ({ name, majors: list.sort((a, b) => byVietnamese(a.name, b.name)) })),
  }
}

// ================= So sánh trường (WBS 5.6) =================

const COMPARE_FIELDS =
  'slug name shortName institutionType belongsToUniversitySystem foundedYear favoriteCount ' +
  'address.district contact.website overview.studentCount media.logoUrl ' +
  'majors.code majors.name tuition.amountMin tuition.amountMax tuition.unit tuition.academicYear ' +
  'admissions.year admissions.method admissions.score admissions.scale dormitory.available scholarships.name'

// Khoảng học phí cho TỪNG đơn vị (năm, học kỳ, tín chỉ, khóa) — các đơn vị khác nhau không gộp được.
// Ví dụ: [{ unit: 'semester', min: 20900000, max: 20900000 }, { unit: 'year', min: 84000000, max: 140000000 }]
function tuitionRanges(u) {
  const fees = (u.tuition || []).filter((t) => t.amountMin > 0)
  return UNIT_ORDER
    .map((unit) => {
      const sameUnit = fees.filter((t) => t.unit === unit)
      if (!sameUnit.length) return null
      return {
        unit,
        min: Math.min(...sameUnit.map((t) => t.amountMin)),
        max: Math.max(...sameUnit.map((t) => t.amountMax ?? t.amountMin)),
      }
    })
    .filter(Boolean)
}

// Điểm chuẩn thấp nhất - cao nhất của năm gần nhất, theo một phương thức và thang điểm.
function scoreRange(u, method, scale) {
  const rows = (u.admissions || []).filter((a) => a.method === method && a.scale === scale)
  if (!rows.length) return null

  const year = Math.max(...rows.map((a) => a.year))
  const scores = rows.filter((a) => a.year === year).map((a) => a.score)
  return { year, scale, min: Math.min(...scores), max: Math.max(...scores) }
}

// Một cột của bảng so sánh. Field chưa có dữ liệu trả null để frontend hiện "Chưa có dữ liệu".
function toComparison(u) {
  return {
    slug: u.slug,
    name: u.name,
    shortName: u.shortName ?? null,
    logoUrl: u.media?.logoUrl ?? null,
    institutionType: u.institutionType,
    belongsToUniversitySystem: u.belongsToUniversitySystem === true,
    district: u.address?.district ?? null,
    foundedYear: u.foundedYear ?? null,
    website: u.contact?.website ?? null,
    studentCount: u.overview?.studentCount ?? null,
    favoriteCount: u.favoriteCount ?? 0,
    majorCount: (u.majors || []).length,
    majors: (u.majors || []).map((m) => m.name),
    tuition: tuitionRanges(u), // [] nếu chưa có dữ liệu
    annualTuitionFrom: annualTuitionFrom(u),
    examScore: scoreRange(u, 'high_school_exam', 30),
    competencyScore: scoreRange(u, 'competency_assessment', 1200),
    dormitory: u.dormitory?.available ?? null,
    scholarshipCount: (u.scholarships || []).length,
  }
}

// slugs: 2–3 slug đã kiểm tra bởi validateCompare(). Trả về đúng thứ tự người dùng chọn.
async function compare(slugs) {
  const found = await University.find({ slug: { $in: slugs } }).select(COMPARE_FIELDS).lean()
  const bySlug = new Map(found.map((u) => [u.slug, u]))

  const missing = slugs.filter((slug) => !bySlug.has(slug))
  if (missing.length) throw httpError(404, `Không tìm thấy trường: ${missing.join(', ')}`)

  return slugs.map((slug) => toComparison(bySlug.get(slug)))
}

// ================= Chi tiết + dữ liệu AI =================

// Chỉ các trường công khai phục vụ trang chi tiết. Không thay đổi truy vấn danh sách.
const DETAIL_FIELDS = 'slug name shortName institutionType belongsToUniversitySystem universitySystem ' +
  'foundedYear description favoriteCount overview contact address campuses media majors tuition admissions ' +
  'facilities scholarships dormitory studentLife careerOpportunities detailEvidence'

async function detail(slug) {
  if (typeof slug !== 'string' || slug.length > 150 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null
  return University.findOne({ slug }).select(DETAIL_FIELDS).lean()
}

// Dữ liệu trang AI tư vấn cần để chấm điểm: đọc trực tiếp MongoDB nên admin sửa là thấy ngay.
const RECOMMENDATION_FIELDS = 'slug name shortName institutionType belongsToUniversitySystem dataLevel sourceDomains address.district majors tuition admissions'

async function recommendationData() {
  return University.find().select(`${RECOMMENDATION_FIELDS} -_id`).sort({ name: 1 }).lean()
}

module.exports = {
  list, search, filterOptions, compare, detail, recommendationData,
  toCard, toComparison, CARD_FIELDS,
}
