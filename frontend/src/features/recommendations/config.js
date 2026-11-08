// Trọng số và quy tắc chỉ áp dụng cho prototype, không phải mô hình dự báo trúng tuyển.
export const WEIGHTS = { major: 30, admission: 25, tuition: 15, geography: 15, quality: 10, scholarship: 5 }
// Người dùng xếp hạng ưu tiên 1–5 (1 = quan trọng nhất) -> trọng số. 0 = không quan tâm.
export const RANK_WEIGHTS = { 1: 1, 2: 0.75, 3: 0.55, 4: 0.4, 5: 0.3 }
export const DEFAULT_PRIORITIES = { major: 1, admission: 2, tuition: 3, geography: 4, quality: 5, scholarship: 5 }
export function weightsFromPriorities(priorities = DEFAULT_PRIORITIES) {
  return Object.fromEntries(Object.keys(WEIGHTS).map((k) => [k, RANK_WEIGHTS[priorities[k]] ?? 0]))
}
export const LABELS = {
  major: 'Ngành phù hợp', admission: 'Điểm tham chiếu', tuition: 'Học phí',
  geography: 'Khu vực', quality: 'Chất lượng / xếp hạng', scholarship: 'Chính sách học bổng',
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

// Danh sách nguồn theo DATA_NOTES.md. Có URL chưa đủ: bản ghi còn phải qua
// kiểm tra mã ngành, chương trình, phương thức, năm, thang điểm và các ngoại lệ.
export const SOURCES = {
  'kinh-te-tphcm': ['ueh.edu.vn'],
  'cong-nghiep-tphcm': ['iuh.edu.vn'],
  'cong-nghe-thong-tin-dhqg': ['uit.edu.vn'],
  'khoa-hoc-tu-nhien-dhqg': ['hcmus.edu.vn'],
  'kinh-te-luat-dhqg': ['uel.edu.vn'],
  'mo-tphcm': ['ou.edu.vn'],
  'quoc-te-dhqg': ['hcmiu.edu.vn'],
  'su-pham-ky-thuat-tphcm': ['hcmute.edu.vn'],
  'ton-duc-thang': ['tdtu.edu.vn'],
  'y-duoc-tphcm': ['ump.edu.vn'],
  'van-lang': ['vlu.edu.vn'],
  'cong-nghe-tphcm': ['hutech.edu.vn'],
}
export const UNCERTAIN_MAJORS = {
  'khoa-hoc-tu-nhien-dhqg': ['7480103', '7480104'],
}

// Chỉ các nguồn xác định là phương thức riêng trong DATA_NOTES được so điểm.
// Những điểm tổng hợp/quy đổi UEH, IUH, HCMUTE không được dùng.
// UIT, HCMUS: điểm chuẩn xét tuyển tổng hợp 2026 do CHÍNH TRƯỜNG công bố ở thang 30.
// HCMUS tính trên thang 30 (80% THPT + 20% học bạ, hoặc ĐGNL quy đổi); UIT = thang 100 × 0,3
// (47,5% THPT + 47,5% ĐGNL + 5% học bạ; không thi ĐGNL thì quy đổi bách phân vị từ THPT).
// Với thí sinh không thi ĐGNL và học bạ xấp xỉ điểm thi, tổng 3 môn so được gần đúng.
export const ADMISSION_SOURCES = {
  'cong-nghe-thong-tin-dhqg': {
    url: 'https://www.uit.edu.vn/bai-viet/truong-dai-hoc-cong-nghe-thong-tin-cong-bo-diem-chuan-trung-tuyen-nam-2026',
    year: 2026, methods: ['high_school_exam'],
    caveat: 'Điểm xét tuyển tổng hợp (THPT + ĐGNL + học bạ) trường quy đổi về thang 30; so gần đúng với tổng 3 môn.',
  },
  'khoa-hoc-tu-nhien-dhqg': {
    url: 'https://tuyensinh.hcmus.edu.vn/2026-diem-chuan/',
    year: 2026, methods: ['high_school_exam'],
    caveat: 'Điểm xét tuyển tổng hợp thang 30 (80% THPT + 20% học bạ, đã gồm điểm cộng/ưu tiên); so gần đúng với tổng 3 môn.',
  },
  'van-lang': {
    url: 'https://www.vlu.edu.vn/news/truong-dai-hoc-van-lang-cong-bo-diem-chuan-trung-tuyen-dai-hoc-chinh-quy-nam-2026',
    year: 2026, methods: ['high_school_exam', 'competency_assessment'],
  },
  'ton-duc-thang': {
    url: 'https://admission.tdtu.edu.vn/sites/admission/files/Tuyen-sinh/2026/TB-Diemtrungtuyen/PL2-Diem-trung-tuyen-DH-2026-PT2-TanHung.pdf',
    year: 2026, methods: ['competency_assessment'],
  },
}
