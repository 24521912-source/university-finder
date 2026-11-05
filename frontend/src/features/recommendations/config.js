// Trọng số và quy tắc chỉ áp dụng cho prototype, không phải mô hình dự báo trúng tuyển.
export const WEIGHTS = { major: 30, admission: 25, tuition: 15, geography: 15, quality: 10, scholarship: 5 }
export const LABELS = {
  major: 'Ngành phù hợp', admission: 'Điểm tham chiếu', tuition: 'Học phí',
  geography: 'Khu vực', quality: 'Chất lượng / xếp hạng', scholarship: 'Chính sách học bổng',
}
export const ACADEMIC_YEAR = '2026-2027'
export const ADMISSION_SLOPE = 500
export const PRIORITIES = ['Học phí thấp', 'Gần nhà', 'Cơ sở vật chất tốt', 'Cơ hội việc làm cao', 'Học bổng', 'Danh tiếng tốt', 'Học thuật mạnh', 'Nhiều hoạt động sinh viên', 'Thực hành nhiều']

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
// Những điểm tổng hợp/quy đổi UEH, UIT, HCMUS, IUH, UEL, HCMUTE không được dùng.
export const ADMISSION_SOURCES = {
  'van-lang': {
    url: 'https://www.vlu.edu.vn/news/truong-dai-hoc-van-lang-cong-bo-diem-chuan-trung-tuyen-dai-hoc-chinh-quy-nam-2026',
    year: 2026, methods: ['high_school_exam', 'competency_assessment'],
  },
  'quoc-te-dhqg': {
    url: 'https://tuyensinh.hcmiu.edu.vn/tuyen-sinh/muc-diem-trung-tuyen-vao-cac-nganh-nhom-nganh-cac-phuong-thuc-xet-tuyen-nam-2025/',
    year: 2025, methods: ['high_school_exam', 'competency_assessment'],
  },
  'ton-duc-thang': {
    url: 'https://admission.tdtu.edu.vn/sites/admission/files/Tuyen-sinh/2026/TB-Diemtrungtuyen/PL2-Diem-trung-tuyen-DH-2026-PT2-TanHung.pdf',
    year: 2026, methods: ['competency_assessment'],
  },
}
