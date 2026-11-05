// Presentation fixtures only. Do not use these values as a school's admission policy.
export const DEMO_YEARS = [2026, 2025]

export const demoMethods = [
  {
    id: 'thpt', name: 'Điểm thi tốt nghiệp THPT', tag: 'Kết quả kỳ thi',
    audience: 'Thí sinh đã tốt nghiệp THPT, có kết quả thi trong năm xét tuyển.',
    requirements: ['Tổng 3 môn từ 18/30 điểm, chưa cộng điểm ưu tiên.', 'Chọn một tổ hợp mẫu: A00, A01 hoặc D01.'],
    scope: 'Nhóm Kinh tế, Kinh doanh và Công nghệ thông tin (minh họa).',
    calculation: 'Điểm xét tuyển mẫu = Môn 1 + Môn 2 + Môn 3. Không nhân hệ số trong ví dụ này.',
    example: 'Tổ hợp A01: Toán 8 + Vật lý 7,5 + Tiếng Anh 8 = 23,5/30 điểm.',
    priority: 'Ví dụ chưa tính điểm ưu tiên hoặc điểm cộng. Dữ liệu thật cần nêu rõ đối tượng, mức cộng và cách tính.',
    period: ['15/07', '30/07'], deadline: '30/07',
    portal: 'Hệ thống đăng ký nguyện vọng chung (kênh minh họa).',
    separateRegistration: 'Không cần nộp đăng ký riêng cho trường trong ví dụ này.',
    registration: ['Chọn đúng mã trường, mã ngành và tổ hợp xét tuyển.', 'Sắp xếp thứ tự nguyện vọng, kiểm tra thông tin và hoàn thành lệ phí trên hệ thống.', 'Theo dõi kết quả và xác nhận nhập học khi có thông báo.'],
    caution: '18/30 là ngưỡng nhận đăng ký mẫu, không phải điểm chuẩn trúng tuyển.',
  },
  {
    id: 'dgnl', name: 'Điểm thi đánh giá năng lực', tag: 'Kỳ thi riêng',
    audience: 'Thí sinh đã tốt nghiệp THPT, có kết quả ĐGNL ĐHQG-HCM trong năm xét tuyển.',
    requirements: ['Điểm thi từ 600/1.200 trở lên.', 'Chỉ dùng kết quả cùng năm; không dùng kết quả kỳ thi khác trong ví dụ này.'],
    scope: 'Nhóm Kinh tế và Công nghệ thông tin; chưa áp dụng cho ngành năng khiếu trong ví dụ.',
    calculation: 'Công thức minh họa: điểm quy đổi thang 30 = điểm ĐGNL / 40. Đây không phải công thức xác nhận của trường.',
    example: '960/1.200 điểm ĐGNL → 960 / 40 = 24/30 điểm theo công thức mẫu.',
    priority: 'Chưa đưa điểm ưu tiên vào ví dụ; không dùng phép quy đổi mẫu này để dự đoán kết quả thật.',
    period: ['01/06', '30/06'], deadline: '30/06',
    portal: 'Cổng đăng ký riêng của trường, sau đó hệ thống nguyện vọng chung (kênh minh họa).',
    separateRegistration: 'Có. Cần khai kết quả kỳ thi với trường trước, rồi đăng ký nguyện vọng.',
    registration: ['Khai mã dự thi, điểm và thông tin cá nhân trên cổng riêng trước hạn 30/06.', 'Kiểm tra kết quả tiếp nhận; đăng ký nguyện vọng trên hệ thống chung từ 15/07 đến 30/07.', 'Theo dõi kết quả và thực hiện xác nhận theo hướng dẫn.'],
    caution: 'Nộp kết quả cho trường chưa thay thế bước đăng ký nguyện vọng trong ví dụ này.',
  },
  {
    id: 'direct', name: 'Tuyển thẳng theo thành tích', tag: 'Hồ sơ thành tích',
    audience: 'Nhóm đối tượng mẫu: thí sinh có giải học sinh giỏi cấp quốc gia và tốt nghiệp THPT trong năm xét tuyển.',
    requirements: ['Có giải Nhất, Nhì hoặc Ba ở môn phù hợp với ngành mẫu.', 'Thành tích trong vòng 2 năm tính đến năm đăng ký (giả định cho demo).'],
    scope: 'Giải Toán → ngành Toán kinh tế; giải Tin học → ngành Công nghệ thông tin (ánh xạ minh họa).',
    calculation: 'Xét điều kiện thành tích và ngành tương ứng, không tính tổng điểm 3 môn trong ví dụ này.',
    example: 'Giải Nhì môn Tin học + đáp ứng điều kiện tốt nghiệp → thuộc nhóm đủ điều kiện đăng ký ngành Công nghệ thông tin trong demo.',
    priority: 'Đây là ví dụ tuyển thẳng; không gộp với phương thức ưu tiên xét tuyển hoặc điểm cộng.',
    period: ['01/06', '30/06'], deadline: '30/06',
    portal: 'Cổng đăng ký tuyển thẳng của trường (kênh minh họa).',
    separateRegistration: 'Có. Đăng ký theo đợt tuyển thẳng và chờ trường xác nhận điều kiện.',
    registration: ['Chọn nhóm thành tích và ngành tương ứng trên cổng riêng.', 'Khai thông tin giải thưởng trong thời gian 01/06 đến 30/06.', 'Theo dõi phản hồi và bước xác nhận trúng tuyển theo thông báo.'],
    caution: 'Các loại giải, thời hạn thành tích và ngành tương ứng ở đây đều là giả định; phải xác minh lại khi bổ sung dữ liệu thật.',
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
