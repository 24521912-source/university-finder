const University = require('../../models/University')

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

async function list() {
  const universities = await University.find().select(CARD_FIELDS).sort({ dataLevel: -1, name: 1 }).lean()
  return universities.map(toCard)
}

// Chỉ các trường công khai phục vụ trang chi tiết. Không thay đổi truy vấn danh sách.
const DETAIL_FIELDS = 'slug name shortName institutionType belongsToUniversitySystem universitySystem ' +
  'foundedYear description favoriteCount overview contact address campuses media majors tuition admissions ' +
  'facilities scholarships dormitory studentLife careerOpportunities detailEvidence'

async function detail(slug) {
  if (typeof slug !== 'string' || slug.length > 150 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null
  return University.findOne({ slug }).select(DETAIL_FIELDS).lean()
}

// Dữ liệu trang AI tư vấn cần để chấm điểm: đọc trực tiếp MongoDB nên admin sửa là thấy ngay.
const RECOMMENDATION_FIELDS = 'slug name shortName institutionType belongsToUniversitySystem dataLevel address.district majors tuition admissions'

async function recommendationData() {
  return University.find().select(`${RECOMMENDATION_FIELDS} -_id`).sort({ name: 1 }).lean()
}

module.exports = { list, detail, recommendationData, toCard, CARD_FIELDS }
