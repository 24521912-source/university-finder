// Bằng chứng đã duyệt riêng cho từng trường, lưu trong MongoDB (field detailEvidence, trả về qua API chi tiết).
// Trường nào có detailEvidence thì trang chi tiết chỉ hiện các giá trị khớp đúng bản đã duyệt và kèm link nguồn.
// Hiện có: Bách khoa (bach-khoa-tphcm), Công nghệ Thông tin (cong-nghe-thong-tin-dhqg).
// Dùng để kiểm tra dữ liệu API, không thay thế API. Không import vào AI và không thay đổi SOURCES dùng chung.
export const evidenceOf = university => {
  const evidence = university?.detailEvidence
  return evidence && typeof evidence === 'object' && evidence.slug === university.slug ? evidence : null
}

export const hasEvidence = university => !!evidenceOf(university)
export const objects = value => Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : []
export const approvedFields = (item, approved, fields) => !!approved && fields.every(key => item[key] === approved[key])

export function evidenceSources(university) {
  const evidence = evidenceOf(university)
  return evidence ? Object.fromEntries(Object.entries(evidence.sources || {}).map(([key, source]) => [key, source?.url])) : {}
}

export function evidenceProfile(university) {
  const evidence = evidenceOf(university)
  if (!evidence?.profile) return null
  const approved = evidence.profile
  const campuses = objects(university.campuses).filter(item => objects(approved.campuses).some(campus => approvedFields(item, campus, ['_id', 'name', 'address'])))
  return {
    foundedYear: university.foundedYear === approved.foundedYear ? university.foundedYear : null,
    address: university.address?.full === approved.address ? university.address.full : null,
    phone: university.contact?.phone === approved.phone ? university.contact.phone : null,
    universitySystem: university.belongsToUniversitySystem === true && university.universitySystem === approved.universitySystem ? university.universitySystem : null,
    campuses,
    map: null,
  }
}

export function evidenceContent(university) {
  const evidence = evidenceOf(university)
  if (!evidence?.content) return null
  const result = {}
  for (const key of ['facilities', 'scholarships', 'studentLife', 'careerOpportunities']) {
    result[key] = objects(university[key]).filter(item => objects(evidence.content[key]).some(approved => approvedFields(item, approved, Object.keys(approved))))
  }
  result.dormitory = approvedFields(university.dormitory || {}, evidence.content.dormitory, ['available', 'description']) ? university.dormitory : {}
  return result
}
