// Presentation fixtures only. Do not use these values as a school's admission policy.
export const DEMO_YEARS = [2026, 2025]

export const demoMethods = [
  {
    id: 'thpt', name: 'Điểm thi tốt nghiệp THPT', tag: 'Kết quả kỳ thi',
    audience: 'Thí sinh đã tốt nghiệp THPT, có kết quả thi của năm xét tuyển.',
    condition: 'Đạt ngưỡng đầu vào và đáp ứng yêu cầu của ngành đăng ký.',
    calculation: 'Tổng điểm 3 môn trong tổ hợp + điểm ưu tiên theo quy định áp dụng.',
    documents: 'Kết quả thi THPT; giấy tờ ưu tiên nếu có. Ngành có môn nhân hệ số sẽ cần công thức riêng.',
  },
  {
    id: 'dgnl', name: 'Điểm thi đánh giá năng lực', tag: 'Kỳ thi riêng',
    audience: 'Thí sinh có kết quả kỳ thi đánh giá năng lực được trường chấp nhận.',
    condition: 'Kết quả còn hiệu lực và đạt mức nhận hồ sơ của ngành.',
    calculation: 'Điểm bài thi được xét hoặc quy đổi theo công thức riêng của trường.',
    documents: 'Phiếu kết quả kỳ thi; thông tin định danh và giấy tờ ưu tiên nếu có.',
  },
  {
    id: 'direct', name: 'Tuyển thẳng & ưu tiên xét tuyển', tag: 'Hồ sơ thành tích',
    audience: 'Thí sinh thuộc nhóm đối tượng tuyển thẳng hoặc ưu tiên xét tuyển.',
    condition: 'Có thành tích phù hợp và minh chứng theo yêu cầu của từng nhóm đối tượng.',
    calculation: 'Xét điều kiện và hồ sơ thành tích; không áp dụng một mức điểm chung.',
    documents: 'Đơn đăng ký; giấy chứng nhận thành tích và các minh chứng theo từng đối tượng.',
  },
]

export const demoSteps = [
  { title: 'Chọn ngành & phương thức', description: 'Xem ngành quan tâm, kiểm tra điều kiện và chọn cách xét tuyển phù hợp.' },
  { title: 'Chuẩn bị hồ sơ', description: 'Đối chiếu giấy tờ với yêu cầu của từng phương thức trước khi nộp.' },
  { title: 'Đăng ký nguyện vọng', description: 'Kiểm tra thông tin cá nhân, mã ngành và thứ tự nguyện vọng trên hệ thống được hướng dẫn.' },
  { title: 'Theo dõi & xác nhận', description: 'Xem kết quả, hoàn thành xác nhận nhập học và bổ sung hồ sơ theo thông báo.' },
]

export const demoDocuments = ['Giấy tờ định danh', 'Học bạ / thông tin tốt nghiệp', 'Kết quả kỳ thi tương ứng', 'Minh chứng ưu tiên (nếu có)']

export function demoMilestones(year) {
  return [
    { date: `15/04/${year}`, title: 'Công bố thông tin tuyển sinh', description: 'Tìm hiểu ngành, phương thức và yêu cầu đầu vào.' },
    { date: `01/06–30/06/${year}`, title: 'Tiếp nhận hồ sơ theo phương thức riêng', description: 'Nộp minh chứng theo hướng dẫn của từng phương thức.' },
    { date: `15/07–30/07/${year}`, title: 'Đăng ký & điều chỉnh nguyện vọng', description: 'Kiểm tra mã ngành, thứ tự nguyện vọng và thông tin đăng ký.' },
    { date: `20/08/${year}`, title: 'Công bố kết quả xét tuyển', description: 'Tra cứu kết quả và đọc hướng dẫn dành cho thí sinh trúng tuyển.' },
    { date: `30/08/${year}`, title: 'Hoàn tất xác nhận nhập học', description: 'Thực hiện xác nhận và chuẩn bị hồ sơ nhập học.' },
  ]
}
