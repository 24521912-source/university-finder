import { Link, useLocation } from 'react-router-dom'
import { LABELS } from '../../features/recommendations/config'
import './Compare.css'

function Compare() {
  const { state } = useLocation()
  const recommendations = state?.recommendations
  const valid = Array.isArray(recommendations) && recommendations.length >= 2 && recommendations.length <= 3 &&
    recommendations.every((r) => typeof r.score === 'number' && r.criteria && Object.keys(LABELS).every((k) => r.criteria[k]))
  return (
    <div className="container compare-page">
      <h1 className="page-title">So sánh trường được gợi ý</h1>
      <p className="page-subtitle">Bản thử nghiệm — điểm phù hợp không phải xác suất trúng tuyển.</p>
      {!valid ? <div className="compare-empty"><p>Chưa có lựa chọn so sánh. Hãy tạo gợi ý và chọn 2–3 trường. Lựa chọn không được lưu lâu dài.</p><Link to="/ai-tu-van" className="btn btn-primary">Đến trang tư vấn</Link></div> : <>
        <p className="muted">Cùng tiêu chí và thông tin đầu vào của lần tư vấn. Độ phủ khác nhau có thể ảnh hưởng thứ tự; dữ liệu thiếu không được gán 0.</p>
        <div className="compare-scroll" role="region" aria-label="Bảng so sánh trường" tabIndex={0}>
          <table className="compare-table">
            <caption>Dữ liệu tham chiếu từ bộ seed của dự án; chỉ đánh giá chương trình chuẩn.</caption>
            <thead><tr><th scope="col">Tiêu chí</th>{recommendations.map((r) => <th scope="col" key={r.slug}>{r.name}<br /><small>{r.major}</small></th>)}</tr></thead>
            <tbody>
              {Object.entries(LABELS).map(([key, label]) => <tr key={key}><th scope="row">{label}</th>{recommendations.map((r) => { const c = r.criteria[key]; return <td key={r.slug}>{c.score === null ? <strong>Chưa đủ dữ liệu / không áp dụng</strong> : <strong>{c.score.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}/100</strong>}<p>{c.text}</p>{c.source && <a href={c.source} target="_blank" rel="noreferrer">Xem nguồn</a>}</td> })}</tr>)}
              <tr><th scope="row">Điểm phù hợp tổng</th>{recommendations.map((r) => <td key={r.slug}><strong>{r.score.toLocaleString('vi-VN')}/100</strong></td>)}</tr>
              <tr><th scope="row">Độ phủ dữ liệu</th>{recommendations.map((r) => <td key={r.slug}>{r.coverage}% — {r.evaluatedCount}/6 tiêu chí; {r.usedWeight}/{r.totalWeight} trọng số ban đầu</td>)}</tr>
            </tbody>
          </table>
        </div>
        <Link to="/ai-tu-van" className="btn btn-outline">Tư vấn lại</Link>
      </>}
    </div>
  )
}

export default Compare
