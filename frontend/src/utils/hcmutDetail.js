// Điểm chuẩn và học phí đã duyệt riêng của Bách khoa (HCMUT): xét tuyển tổng hợp theo mã xét tuyển, thang 100.
// Chỉ áp dụng khi detailEvidence có nhóm mã xét tuyển (groups) và bản ghi đã duyệt (records); trường khác dùng detailData chung.
import { approvedFields, evidenceOf, evidenceSources, objects } from './detailEvidence.js'

export function hcmutDetailData(university) {
  const evidence = evidenceOf(university)
  if (!evidence?.groups || !Array.isArray(evidence.records) || !Array.isArray(evidence.tuition)) return null
  const sources = evidenceSources(university)
  const records = objects(university.admissions)
  const accepted = []
  for (const record of records) {
    const approved = evidence.records.find(item => item.id === record._id)
    const code = typeof record.program === 'string' ? record.program.match(/mã XT (\d{3})/)?.[1] : null
    const group = evidence.groups[code]
    if (!approved || !group || code === '112' || record.method !== 'other' || record.sourceUrl !== sources.cutoffs ||
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
    methods: admissionGroups.length ? [{ label: 'Xét tuyển tổng hợp HCMUT', year: 2026, scale: 100, sourceUrl: sources.admissionMethod }] : [],
    hiddenAdmissions: records.length - accepted.length,
    hiddenMajors: objects(university.majors).length,
    hiddenTuition: objects(university.tuition).length - tuition.length,
  }
}
