// Chuyển kết quả tư vấn trên trang AI thành dữ liệu gửi lên API lưu lịch sử (POST /consultations),
// và các hàm hiển thị lại tiêu chí đã lưu ở trang Cá nhân.

export const MAX_SAVED_RESULTS = 5

const METHOD_LABEL = { high_school_exam: 'Điểm THPT', competency_assessment: 'ĐGNL ĐHQG-HCM' }
const TYPE_LABEL = { public: 'Công lập', private: 'Tư thục', international: 'Quốc tế', other: 'Khác' }
const VNUHCM_LABEL = { only: 'Chỉ trường thuộc ĐHQG', exclude: 'Ngoài ĐHQG' }

// preferences: tiêu chí đã dùng để chấm (điểm THPT đã cộng 3 môn). results: kết quả của recommend().
export function toConsultationPayload(preferences, results) {
  const budget = Number(preferences.budget)
  return {
    criteria: {
      majorCode: String(preferences.majorCodes?.[0] ?? preferences.majorCode ?? ''),
      majorLabel: preferences.major?.label || preferences.major?.name || undefined,
      method: preferences.method,
      combination: preferences.method === 'high_school_exam' ? preferences.combination : undefined,
      score: Number(preferences.score),
      maxTuition: preferences.budget === 'any' || !(budget > 0) ? null : budget,
      district: preferences.district,
      institutionType: preferences.institutionType,
      vnuhcm: preferences.vnuhcm,
    },
    results: (results?.ranked || []).slice(0, MAX_SAVED_RESULTS).map((r) => ({
      slug: r.slug,
      major: r.major || undefined,
      matchScore: r.score,
      coverage: r.coverage,
      // Lý do đề xuất: các tiêu chí đã chấm được, giữ nguyên câu giải thích của thuật toán.
      reasons: Object.values(r.criteria || {}).filter((c) => c.score !== null && c.text).map((c) => c.text).slice(0, 6),
    })),
  }
}

const vnNumber = (n, digits = 2) => Number(n).toLocaleString('vi-VN', { maximumFractionDigits: digits })

// Tóm tắt tiêu chí đã lưu thành các nhãn ngắn để hiện trên thẻ lịch sử.
export function describeCriteria(c = {}) {
  const scale = c.method === 'high_school_exam' ? 30 : 1200
  return [
    c.majorLabel || (c.majorCode ? `Mã ngành ${c.majorCode}` : null),
    METHOD_LABEL[c.method] ? `${METHOD_LABEL[c.method]}${c.combination ? ` ${c.combination}` : ''}: ${vnNumber(c.score)}/${scale}` : null,
    c.maxTuition ? `Học phí ≤ ${vnNumber(c.maxTuition / 1e6, 1)} tr/năm` : null,
    c.district || null,
    TYPE_LABEL[c.institutionType] || null,
    VNUHCM_LABEL[c.vnuhcm] || null,
  ].filter(Boolean)
}
