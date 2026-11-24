// Chuyển số liệu GET /admin/dashboard thành các dòng hiển thị (tách khỏi JSX để test được).

const TYPE_LABEL = { public: 'Công lập', private: 'Tư thục', international: 'Quốc tế', other: 'Khác' }
const COVERAGE_LABEL = {
  majors: 'Có danh sách ngành',
  admissions: 'Có điểm chuẩn',
  verifiedForAI: 'Có điểm chuẩn đã xác minh cho AI',
  tuition: 'Có học phí',
  coordinates: 'Có tọa độ bản đồ',
  logo: 'Có logo',
}

export const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0)

// Thanh ngang: { key, label, value, total, pct }. Độ đầy đủ xếp theo thứ tự cố định để admin quen vị trí.
export function coverageRows(data) {
  const total = data?.universities?.total || 0
  return Object.entries(COVERAGE_LABEL).map(([key, label]) => {
    const value = data?.coverage?.[key] || 0
    return { key, label, value, total, pct: percent(value, total) }
  })
}

export function typeRows(data) {
  const total = data?.universities?.total || 0
  return Object.entries(TYPE_LABEL)
    .map(([key, label]) => ({ key, label, value: data?.universities?.byType?.[key] || 0, total }))
    .filter((r) => r.value > 0)
    .map((r) => ({ ...r, pct: percent(r.value, total) }))
}

// "2026-11-21" -> "21/11"
export const shortDate = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

// Cột biểu đồ 14 ngày: chiều cao theo % của ngày cao nhất (tối thiểu 1 để trục không bằng 0).
export function trendBars(trend = []) {
  const max = Math.max(1, ...trend.map((d) => d.count))
  return { max, bars: trend.map((d) => ({ ...d, label: shortDate(d.date), pct: (d.count / max) * 100 })) }
}
