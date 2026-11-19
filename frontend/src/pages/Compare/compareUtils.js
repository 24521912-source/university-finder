// Hàm thuần dùng cho trang so sánh (/so-sanh). Có test: compareUtils.test.js
import { LABELS } from '../../features/recommendations/config.js'
import { MAX_COMPARE } from '../../features/compare/useCompareList.js'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// "?truong=uit,bach-khoa-tphcm" -> ['uit', 'bach-khoa-tphcm'] (bỏ trùng, bỏ slug sai định dạng, tối đa 3)
export function readCompareSlugs(value) {
  const slugs = (value || '').split(',').map((slug) => slug.trim()).filter((slug) => SLUG.test(slug))
  return [...new Set(slugs)].slice(0, MAX_COMPARE)
}

// Kết quả AI hợp lệ để so sánh: 2–3 trường, mỗi trường có điểm và đủ các tiêu chí.
export function isValidAiComparison(recommendations) {
  return Array.isArray(recommendations) && recommendations.length >= 2 && recommendations.length <= 3 &&
    recommendations.every((r) => typeof r.score === 'number' && r.criteria && Object.keys(LABELS).every((k) => r.criteria[k]))
}

// slug của trường có học phí năm thấp nhất (chỉ khi có ít nhất 2 trường có dữ liệu để so).
export function lowestTuitionSlug(universities) {
  const withTuition = universities.filter((u) => u.annualTuitionFrom !== null)
  if (withTuition.length < 2) return null
  return withTuition.reduce((best, u) => (u.annualTuitionFrom < best.annualTuitionFrom ? u : best)).slug
}
