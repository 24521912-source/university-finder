import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { MAX_COMPARE, MIN_COMPARE } from '../../features/compare/useCompareList'
import { isValidAiComparison, readCompareSlugs } from './compareUtils'
import AiCompareTable from './AiCompareTable'
import UniversityCompareTable from './UniversityCompareTable'
import './Compare.css'

// Trang /so-sanh có 2 chế độ:
// 1. Từ trang AI tư vấn: so sánh trường được gợi ý (dữ liệu trong location.state).
// 2. Từ trang danh sách trường: /so-sanh?truong=a,b,c -> gọi API so sánh.
function Compare() {
  const { state } = useLocation()
  const [params] = useSearchParams()
  const slugs = readCompareSlugs(params.get('truong'))

  if (isValidAiComparison(state?.recommendations)) return <AiCompareTable recommendations={state.recommendations} />
  if (slugs.length >= MIN_COMPARE) return <UniversityCompareTable key={slugs.join(',')} slugs={slugs} />

  return (
    <div className="container compare-page">
      <h1 className="page-title">So sánh trường đại học</h1>
      <div className="compare-empty">
        <p>Chưa có trường nào để so sánh. Hãy chọn {MIN_COMPARE}–{MAX_COMPARE} trường ở trang danh sách (nút “+ So sánh” trên mỗi thẻ trường), hoặc tạo gợi ý ở trang AI tư vấn.</p>
        <div className="compare-actions">
          <Link to="/truong" className="btn btn-primary">Chọn trường để so sánh</Link>
          <Link to="/ai-tu-van" className="btn btn-outline">Đến trang AI tư vấn</Link>
        </div>
      </div>
    </div>
  )
}

export default Compare
