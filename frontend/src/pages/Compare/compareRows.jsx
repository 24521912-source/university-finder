import { formatMoney, formatTuitionRange, INSTITUTION_TYPE_LABEL } from '../../utils/format'
import MajorList from './MajorList'

// Mỗi dòng của bảng so sánh: nhãn + cách hiển thị giá trị của một trường.
// render(u) trả về null khi trường chưa có dữ liệu -> bảng hiện "Chưa có dữ liệu".
// u: một phần tử của GET /universities/compare (xem docs/API_CONTRACT.md).

const yesNo = (value) => (value === null || value === undefined ? null : value ? 'Có' : 'Không')

// Chỉ hiện link http(s) để tránh link "javascript:" lọt vào từ dữ liệu.
const isHttpUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)

function scoreText(score) {
  if (!score) return null
  const range = score.min === score.max ? score.min : `${score.min} – ${score.max}`
  return `${range} điểm (năm ${score.year}, thang ${score.scale})`
}

export const COMPARE_ROWS = [
  { key: 'type', label: 'Loại trường', render: (u) => INSTITUTION_TYPE_LABEL[u.institutionType] ?? null },
  { key: 'vnu', label: 'Thuộc ĐHQG-HCM', render: (u) => yesNo(u.belongsToUniversitySystem) },
  { key: 'district', label: 'Khu vực (trụ sở)', render: (u) => u.district },
  { key: 'founded', label: 'Năm thành lập', render: (u) => u.foundedYear },
  {
    key: 'tuition',
    label: 'Học phí',
    render: (u) => (u.tuition.length ? (
      <ul className="compare-list">{u.tuition.map((range) => <li key={range.unit}>{formatTuitionRange(range)}</li>)}</ul>
    ) : null),
  },
  {
    key: 'annualTuition',
    label: 'Học phí thấp nhất / năm (ước tính)',
    // isLowest: trường có học phí năm thấp nhất trong các trường đang so sánh
    render: (u, { isLowest }) => (u.annualTuitionFrom === null ? null : (
      <>
        {formatMoney(u.annualTuitionFrom)}/năm {isLowest && <span className="badge badge-green">Thấp nhất</span>}
      </>
    )),
  },
  { key: 'examScore', label: 'Điểm chuẩn THPT', render: (u) => scoreText(u.examScore) },
  { key: 'competencyScore', label: 'Điểm chuẩn ĐGNL', render: (u) => scoreText(u.competencyScore) },
  { key: 'majorCount', label: 'Số ngành đào tạo', render: (u) => u.majorCount || null },
  { key: 'majors', label: 'Ngành đào tạo', render: (u) => (u.majors.length ? <MajorList majors={u.majors} /> : null) },
  { key: 'dormitory', label: 'Ký túc xá', render: (u) => yesNo(u.dormitory) },
  { key: 'scholarships', label: 'Học bổng', render: (u) => (u.scholarshipCount ? `${u.scholarshipCount} chương trình` : null) },
  { key: 'favorites', label: 'Lượt yêu thích', render: (u) => u.favoriteCount.toLocaleString('vi-VN') },
  {
    key: 'website',
    label: 'Website',
    render: (u) => (isHttpUrl(u.website) ? <a href={u.website} target="_blank" rel="noreferrer">{u.website.replace(/^https?:\/\//i, '')}</a> : null),
  },
]
