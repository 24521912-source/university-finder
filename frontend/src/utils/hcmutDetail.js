// Bằng chứng đã duyệt riêng HCMUT; dùng để kiểm tra dữ liệu API, không thay thế API.
// Không import vào AI và không thay đổi SOURCES dùng chung.
import evidence from './hcmutDetailEvidence.json' with { type: 'json' }

export const isHcmut = university => university?.slug === evidence.slug
export const hcmutSources = Object.fromEntries(Object.entries(evidence.sources).map(([key, source]) => [key, source.url]))
const objects = value => Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : []
const approvedFields = (item, approved, fields) => approved && fields.every(key => item[key] === approved[key])

export function hcmutProfile(university) {
  if (!isHcmut(university)) return null
  const approved = evidence.profile
  const campuses = objects(university.campuses).filter(item => approved.campuses.some(campus => approvedFields(item, campus, ['_id', 'name', 'address'])))
  return {
    foundedYear: university.foundedYear === approved.foundedYear ? university.foundedYear : null,
    address: university.address?.full === approved.address ? university.address.full : null,
    phone: university.contact?.phone === approved.phone ? university.contact.phone : null,
    universitySystem: university.belongsToUniversitySystem === true && university.universitySystem === approved.universitySystem ? university.universitySystem : null,
    campuses,
    map: null,
  }
}

export function hcmutContent(university) {
  if (!isHcmut(university)) return null
  const result = {}
  for (const key of ['facilities', 'scholarships', 'studentLife', 'careerOpportunities']) {
    result[key] = objects(university[key]).filter(item => evidence.content[key].some(approved => approvedFields(item, approved, Object.keys(approved))))
  }
  result.dormitory = approvedFields(university.dormitory || {}, evidence.content.dormitory, ['available', 'description']) ? university.dormitory : {}
  return result
}

export function hcmutDetailData(university) {
  if (!isHcmut(university)) return null
  const records = objects(university.admissions)
  const accepted = []
  for (const record of records) {
    const approved = evidence.records.find(item => item.id === record._id)
    const code = typeof record.program === 'string' ? record.program.match(/mã XT (\d{3})/)?.[1] : null
    const group = evidence.groups[code]
    if (!approved || !group || code === '112' || record.method !== 'other' || record.sourceUrl !== hcmutSources.cutoffs ||
        !approvedFields(record, approved, ['majorCode', 'program', 'score', 'year', 'scale']) || record.year !== 2026 || record.scale !== 100 ||
        !Number.isFinite(record.score) || record.score < 0 || record.score > 100 || group.imageScore !== group.htmlScore || record.score !== group.imageScore) continue
    accepted.push({ ...record, examCode: code, groupName: group.title, kind: { key: 'combined', label: 'Xét tuyển tổng hợp HCMUT' } })
  }
  const grouped = new Map()
  for (const record of accepted) {
    const key = `${record.year}|${record.examCode}|${record.program}`
    if (!grouped.has(key)) grouped.set(key, { ...record, majorCode: null, majorMappingVerified: false })
  }
  const admissionGroups = [...grouped.values()]
  const tuition = objects(university.tuition).filter(record => evidence.tuition.some(approved => approvedFields(record, approved, Object.keys(approved)))).map(record => ({
    ...record,
    cohort: 2026,
    restrictedDiscount: record._id === evidence.tuition[3]._id,
  }))
  const annualMinimum = tuition.length ? tuition.reduce((lowest, fee) => fee.amountMin < lowest.amountMin ? fee : lowest) : null
  const minimumScores = admissionGroups.length ? [admissionGroups.reduce((lowest, group) => group.score < lowest.score ? group : lowest)] : []
  return {
    majors: [], // Chưa xác minh 32 ánh xạ mã ngành quốc gia, không tự mở chúng.
    admissions: accepted,
    admissionGroups,
    tuition,
    annualMinimum,
    minimumScores,
    methods: admissionGroups.length ? [{ label: 'Xét tuyển tổng hợp HCMUT', year: 2026, scale: 100, sourceUrl: hcmutSources.admissionMethod }] : [],
    hiddenAdmissions: records.length - accepted.length,
    hiddenMajors: objects(university.majors).length,
    hiddenTuition: objects(university.tuition).length - tuition.length,
  }
}
