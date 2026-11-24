// Trọng số chấm điểm phù hợp theo 4 tiêu chí; không phải mô hình dự báo trúng tuyển.
export const WEIGHTS = { major: 30, admission: 25, tuition: 15, geography: 15 }
// Người dùng xếp hạng ưu tiên 1–5 (1 = quan trọng nhất) -> trọng số. 0 = không quan tâm.
export const RANK_WEIGHTS = { 1: 1, 2: 0.75, 3: 0.55, 4: 0.4, 5: 0.3 }
export const DEFAULT_PRIORITIES = { major: 1, admission: 2, tuition: 3, geography: 4 }
export function weightsFromPriorities(priorities = DEFAULT_PRIORITIES) {
  return Object.fromEntries(Object.keys(WEIGHTS).map((k) => [k, RANK_WEIGHTS[priorities[k]] ?? 0]))
}
export const LABELS = {
  major: 'Ngành phù hợp', admission: 'Điểm tham chiếu', tuition: 'Học phí',
  geography: 'Khu vực',
}
export const ACADEMIC_YEAR = '2026-2027'
// Chỉ dùng điểm chuẩn năm này; dữ liệu năm cũ vẫn lưu nhưng không hiển thị/so sánh.
export const ADMISSION_YEAR = 2026
// Tổ hợp xét tuyển THPT -> 3 môn (mỗi môn thang 10, tổng thang 30).
export const COMBINATIONS = {
  A00: ['Toán', 'Vật lí', 'Hóa học'],
  A01: ['Toán', 'Vật lí', 'Tiếng Anh'],
  A02: ['Toán', 'Vật lí', 'Sinh học'],
  B00: ['Toán', 'Hóa học', 'Sinh học'],
  B08: ['Toán', 'Sinh học', 'Tiếng Anh'],
  C00: ['Ngữ văn', 'Lịch sử', 'Địa lí'],
  C01: ['Ngữ văn', 'Toán', 'Vật lí'],
  C02: ['Ngữ văn', 'Toán', 'Hóa học'],
  D01: ['Toán', 'Ngữ văn', 'Tiếng Anh'],
  D07: ['Toán', 'Hóa học', 'Tiếng Anh'],
  D08: ['Toán', 'Sinh học', 'Tiếng Anh'],
  D09: ['Toán', 'Lịch sử', 'Tiếng Anh'],
  D10: ['Toán', 'Địa lí', 'Tiếng Anh'],
  D14: ['Ngữ văn', 'Lịch sử', 'Tiếng Anh'],
  D15: ['Ngữ văn', 'Địa lí', 'Tiếng Anh'],
  X06: ['Toán', 'Vật lí', 'Tin học'],
  X25: ['Toán', 'Tiếng Anh', 'Giáo dục kinh tế và pháp luật'],
  X26: ['Toán', 'Tiếng Anh', 'Tin học'],
}
export const ADMISSION_SLOPE = 500

// Nguồn đáng tin của từng trường nằm trong database: university.sourceDomains.
// Điểm chuẩn được AI dùng để so điểm: admissions[].verifiedForAI = true (admin bật trên trang /admin).
export const UNCERTAIN_MAJORS = {
  'khoa-hoc-tu-nhien-dhqg': ['7480103', '7480104'],
}
