// Ngành đại diện: gom các mã ngành liên quan để người dùng chọn một tên chung.
// Một mã có thể thuộc nhiều nhóm khi hợp lý (ví dụ Khoa học dữ liệu thuộc cả CNTT và Toán).
export const MAJOR_GROUPS = [
  { id: 'cntt', name: 'Công nghệ thông tin', aliases: ['it', 'cntt', 'khmt', 'ai', 'tri tue nhan tao', 'lap trinh', 'phan mem', 'may tinh', 'an ninh mang', 'du lieu', 'data', 'iot'],
    codes: ['7480101', '7480102', '7480103', '7480104', '7480106', '7480107', '7480108', '7480118', '7480201', '7480202', '7480203', '7480208', '7460108'] },
  { id: 'toan', name: 'Toán – Thống kê – Khoa học dữ liệu', aliases: ['toan', 'thong ke', 'data', 'du lieu', 'toan tin'],
    codes: ['7460101', '7460108', '7460112', '7460117', '7460201', '7310107', '7310108'] },
  { id: 'dien', name: 'Điện – Điện tử – Viễn thông – Bán dẫn', aliases: ['dien', 'dien tu', 'vien thong', 'vi mach', 'ban dan', 'chip', 'nang luong'],
    codes: ['7510301', '7510302', '7520201', '7520207', '75202A1', '74401A1', '7440107', '7510208'] },
  { id: 'tudonghoa', name: 'Tự động hóa – Robot – Cơ điện tử', aliases: ['tu dong hoa', 'robot', 'co dien tu', 'dieu khien', 'mechatronics'],
    codes: ['7510303', '7520216', '7510203', '7520114', '7510209'] },
  { id: 'cokhi', name: 'Cơ khí – Chế tạo máy – Nhiệt', aliases: ['co khi', 'che tao may', 'nhiet', 'bao duong'],
    codes: ['7510201', '7510202', '7520101', '7520103', '7510211', '7520115', '7510206'] },
  { id: 'oto', name: 'Ô tô – Hàng không – Tàu thủy', aliases: ['o to', 'oto', 'xe dien', 'hang khong', 'may bay', 'tau thuy', 'khong gian'],
    codes: ['7510205', '7520130', '7520141', '7520120', '7520121', '7520122'] },
  { id: 'congnghiep', name: 'Logistics – Quản lý công nghiệp', aliases: ['logistics', 'chuoi cung ung', 'quan ly cong nghiep', 'ky thuat cong nghiep', 'supply chain'],
    codes: ['7510605', '7510601', '7520117', '7520118'] },
  { id: 'hoa', name: 'Hóa học – Vật liệu', aliases: ['hoa', 'hoa hoc', 'vat lieu', 'in'],
    codes: ['7440112', '7510401', '7520301', '7440122', '7510402', '7520309', '7510801'] },
  { id: 'vatly', name: 'Vật lý – Hạt nhân', aliases: ['vat ly', 'ly', 'hat nhan'],
    codes: ['7440102', '7520401', '7520402', '7520403'] },
  { id: 'moitruong', name: 'Môi trường – Tài nguyên – Địa chất – Dầu khí', aliases: ['moi truong', 'tai nguyen', 'dia chat', 'dau khi', 'dat dai', 'hai duong'],
    codes: ['7440301', '7510406', '7520320', '7850101', '7850102', '7850103', '7850201', '7440201', '7520501', '7520604', '7440228', '7440206'] },
  { id: 'sinh', name: 'Sinh học – Công nghệ sinh học', aliases: ['sinh', 'sinh hoc', 'cong nghe sinh hoc', 'cnsh', 'y sinh', 'tham my'],
    codes: ['7420101', '7420201', '7420203', '7420204', '7420207', '7520212'] },
  { id: 'thucpham', name: 'Thực phẩm – Dinh dưỡng', aliases: ['thuc pham', 'dinh duong', 'an toan thuc pham'],
    codes: ['7540101', '7540106', '7720401', '7720402'] },
  { id: 'detmay', name: 'Dệt may – Gỗ nội thất', aliases: ['det may', 'may', 'thoi trang', 'go'],
    codes: ['7540204', '7540209', '7549002'] },
  { id: 'xaydung', name: 'Xây dựng – Giao thông', aliases: ['xay dung', 'cong trinh', 'giao thong', 'cau duong', 'kinh te xay dung', 'ha tang'],
    codes: ['7510102', '7510106', '7580201', '7580205', '7580211', '7580301', '7580302', '7840110'] },
  { id: 'kientruc', name: 'Kiến trúc – Quy hoạch – Nội thất', aliases: ['kien truc', 'quy hoach', 'noi that'],
    codes: ['7580101', '7580103', '7580104', '7580105', '7580108', '7580112'] },
  { id: 'yhoc', name: 'Y khoa – Răng Hàm Mặt – Y tế công cộng', aliases: ['y', 'y khoa', 'bac si', 'nha khoa', 'rang ham mat', 'y hoc co truyen', 'y te'],
    codes: ['7720101', '7720110', '7720115', '7720501', '7720701'] },
  { id: 'duoc', name: 'Dược', aliases: ['duoc', 'duoc hoc', 'hoa duoc'],
    codes: ['7720201', '7720202', '7720203'] },
  { id: 'dieuduong', name: 'Điều dưỡng – Kỹ thuật y học', aliases: ['dieu duong', 'ho sinh', 'xet nghiem', 'hinh anh y hoc', 'phuc hoi chuc nang', 'ky thuat y sinh'],
    codes: ['7720301', '7720302', '7720502', '7720601', '7720602', '7720603', '7520212'] },
  { id: 'thuy', name: 'Thú y – Nông nghiệp', aliases: ['thu y', 'nong nghiep'],
    codes: ['7640101', '7620114'] },
  { id: 'qtkd', name: 'Quản trị kinh doanh', aliases: ['qtkd', 'quan tri', 'kinh doanh', 'nhan su', 'nhan luc', 'kinh doanh quoc te', 'su kien', 'bat dong san', 'httt quan ly'],
    codes: ['7340101', '7340120', '7340121', '7340404', '7340408', '7340412', '7340116', '7340405', '7340406'] },
  { id: 'marketing', name: 'Marketing – Thương mại điện tử', aliases: ['marketing', 'mkt', 'digital marketing', 'thuong mai dien tu', 'tmdt', 'e-commerce'],
    codes: ['7340114', '7340115', '7340122'] },
  { id: 'taichinh', name: 'Tài chính – Ngân hàng – Bảo hiểm', aliases: ['tai chinh', 'ngan hang', 'tcnh', 'fintech', 'bao hiem'],
    codes: ['7340201', '7340204', '7340205', '7340206'] },
  { id: 'ketoan', name: 'Kế toán – Kiểm toán', aliases: ['ke toan', 'kiem toan'],
    codes: ['7340301', '7340302'] },
  { id: 'kinhte', name: 'Kinh tế', aliases: ['kinh te', 'kinh te quoc te', 'kinh te so', 'dau tu'],
    codes: ['7310101', '7310102', '7310104', '7310106', '7310109'] },
  { id: 'luat', name: 'Luật', aliases: ['luat', 'luat kinh te', 'phap luat'],
    codes: ['7380101', '7380107'] },
  { id: 'truyenthong', name: 'Báo chí – Truyền thông – Quan hệ công chúng', aliases: ['truyen thong', 'bao chi', 'pr', 'quan he cong chung', 'media'],
    codes: ['7320104', '7320105', '7320106', '7320108', '7320101'] },
  { id: 'ngonngu', name: 'Ngôn ngữ – Văn học', aliases: ['ngon ngu', 'tieng anh', 'ngon ngu anh', 'tieng trung', 'tieng nhat', 'tieng han', 'tieng phap', 'tieng nga', 'tieng duc', 'tay ban nha', 'italia', 'van hoc'],
    codes: ['7220101', '7220201', '7220202', '7220203', '7220204', '7220209', '7220210', '7229030', '7220104', '7220205', '7220206', '7220208', '7229020'] },
  { id: 'quocte', name: 'Quan hệ quốc tế – Khu vực học – Quản lý công', aliases: ['quan he quoc te', 'quoc te hoc', 'dong phuong hoc', 'viet nam hoc', 'nhat ban hoc', 'han quoc hoc', 'chinh tri', 'quan ly cong'],
    codes: ['7310206', '7310601', '7310608', '7310620', '7310630', '7310201', '7340403', '7310613', '7310614', '73106a1'] },
  { id: 'xahoi', name: 'Tâm lý – Xã hội học – Công tác xã hội', aliases: ['tam ly', 'xa hoi hoc', 'cong tac xa hoi', 'dia ly', 'nhan hoc'],
    codes: ['7310301', '7310401', '7310403', '7310501', '7760101', '7760103', '7310302'] },
  { id: 'nhanvan', name: 'Lịch sử – Triết học – Văn hóa học', aliases: ['lich su', 'triet hoc', 'van hoa hoc', 'ton giao', 'nghe thuat hoc', 'han nom'],
    codes: ['7229010', '7229001', '7229009', '7229040', '7210213', '7220104'] },
  { id: 'thongtin', name: 'Thông tin – Thư viện – Lưu trữ', aliases: ['thu vien', 'luu tru', 'quan ly thong tin'],
    codes: ['7320201', '7320205', '7320303'] },
  { id: 'supham', name: 'Sư phạm – Giáo dục', aliases: ['su pham', 'giao vien', 'giao duc', 'mam non', 'tieu hoc'],
    codes: ['7140101', '7140103', '7140114', '7140201', '7140202', '7140203', '7140204', '7140205', '7140206', '7140208', '7140209', '7140210', '7140211', '7140212', '7140213', '7140217', '7140218', '7140219', '7140231', '7140232', '7140233', '7140234', '7140246', '7140247', '7140249', '7140107'] },
  { id: 'thietke', name: 'Thiết kế – Đồ họa – Mỹ thuật số', aliases: ['thiet ke', 'do hoa', 'design', 'thoi trang', 'my thuat so', 'nghe thuat so'],
    codes: ['7210402', '7210403', '7210404', '7210408', '7210409'] },
  { id: 'nghethuat', name: 'Nghệ thuật biểu diễn – Điện ảnh', aliases: ['am nhac', 'thanh nhac', 'piano', 'dien anh', 'dien vien', 'dao dien'],
    codes: ['7210205', '7210208', '7210234', '7210235', '7210302', '7210303'] },
  { id: 'dulich', name: 'Du lịch – Khách sạn – Nhà hàng – Thể thao', aliases: ['du lich', 'khach san', 'nha hang', 'lu hanh', 'the thao'],
    codes: ['7810101', '7810103', '7810201', '7810202', '7810301'] },
]

export const normalize = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/**
 * Tìm gợi ý cho ô nhập ngành: nhóm ngành trước, rồi ngành cụ thể.
 * Trả về [{ type: 'group'|'major', id, label, detail, codes }]
 */
export function searchMajors(query, majors, limit = 10) {
  const q = normalize(query)
  const groupItems = MAJOR_GROUPS.map((g) => ({ type: 'group', id: g.id, label: g.name, detail: `${g.codes.length} ngành liên quan`, codes: g.codes, keys: [g.name, ...g.aliases].map(normalize) }))
  const majorItems = majors.map((m) => ({ type: 'major', id: m.code, label: m.name, detail: m.code, codes: [m.code], keys: [normalize(m.name), m.code] }))
  if (!q) return groupItems.slice(0, limit).map(strip)
  const rank = (item) => {
    let best = Infinity
    for (const k of item.keys) {
      if (k === q) best = Math.min(best, 0)
      else if (k.startsWith(q)) best = Math.min(best, 1)
      else if (k.split(' ').some((w) => w.startsWith(q))) best = Math.min(best, 2)
      else if (q.length >= 3 && k.includes(q)) best = Math.min(best, 3)
    }
    return best
  }
  return [...groupItems, ...majorItems]
    .map((item) => ({ item, r: rank(item) }))
    .filter((x) => x.r < Infinity)
    .sort((a, b) => a.r - b.r || (a.item.type === 'group' ? -1 : 1) - (b.item.type === 'group' ? -1 : 1) || a.item.label.localeCompare(b.item.label, 'vi'))
    .slice(0, limit)
    .map((x) => strip(x.item))
}

// eslint-disable-next-line no-unused-vars
const strip = ({ keys, ...rest }) => rest
