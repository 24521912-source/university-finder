import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LABELS } from '../features/recommendations/config'
import CompositeCalculator from './CompositeCalculator'

// children: thao tác thêm hiện ngay dưới danh sách xếp hạng (vd nút lưu lịch sử tư vấn).
function RecommendationResults({ results, preferences = {}, children }) {
  const [selected, setSelected] = useState([])
  const [openCalc, setOpenCalc] = useState(null)
  const chosen = results.ranked.filter((r) => selected.includes(r.slug))
  function toggle(slug) {
    setSelected((current) => current.includes(slug) ? current.filter((s) => s !== slug) : current.length < 3 ? [...current, slug] : current)
  }
  return (
    <section className="consult-results" aria-labelledby="results-title" aria-live="polite">
      <h2 id="results-title">Gợi ý phù hợp — bản thử nghiệm</h2>
      <p className="muted">Hiển thị {results.ranked.length}/{results.rankedCount} trường đủ dữ liệu xếp hạng. Điểm phù hợp không phải xác suất trúng tuyển.</p>
      <p className="consult-help">Độ phủ khác nhau có thể ảnh hưởng thứ tự: điểm cao với ít dữ liệu chưa thể hiện mức phù hợp toàn diện.</p>
      {!results.ranked.length && <div className="consult-notice" role="status">Chưa có trường đủ dữ liệu để xếp hạng theo lựa chọn hiện tại. Bạn có thể xem nhóm cần bổ sung dữ liệu hoặc thay đổi ngành / ngân sách / năm tham chiếu.</div>}
      {results.ranked.map((r, index) => <article key={r.slug} className="consult-result-card">
        <div className="consult-result-heading"><h3>{index + 1}. {r.name}</h3><div className="consult-score-badges"><strong>{r.score.toLocaleString('vi-VN')}/100 phù hợp</strong><span>Độ phủ {r.coverage}% ({r.evaluatedCount}/6 tiêu chí)</span></div></div>
        <p>Ngành phù hợp: <strong>{r.major}</strong></p>
        {r.relatedMajors?.length > 0 && <p className="consult-help">Trường còn các ngành liên quan: {r.relatedMajors.join(', ')}.</p>}
        <Link to={`/truong/${r.slug}`} className="btn btn-outline">Xem chi tiết trường →</Link>
        <p className="consult-help">Độ phủ tính theo mức ưu tiên bạn đã chọn. Học phí và điểm là dữ liệu tham chiếu trong seed dự án.</p>
        <dl className="consult-criteria">{Object.entries(r.criteria).map(([key, criterion]) => <div key={key}><dt>{LABELS[key]} {criterion.score !== null && <span className="badge">{criterion.score.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}/100</span>}</dt><dd>{criterion.score === null && <strong>Chưa đủ dữ liệu / không áp dụng. </strong>}{criterion.text} {criterion.source && <a href={criterion.source} target="_blank" rel="noreferrer">Xem nguồn</a>}</dd></div>)}</dl>
        <label className="consult-compare-choice"><input type="checkbox" checked={selected.includes(r.slug)} disabled={!selected.includes(r.slug) && selected.length >= 3} onChange={() => toggle(r.slug)} /> Chọn so sánh</label>
      </article>)}
      {results.ranked.length > 0 && <div className="consult-compare-bar"><p>Chọn 2–3 trường để so sánh ({chosen.length}/3).</p>{chosen.length >= 2 ? <Link className="btn btn-primary" to="/so-sanh" state={{ recommendations: chosen }}>So sánh {chosen.length} trường →</Link> : <button className="btn btn-primary" disabled>Chọn thêm trường</button>}</div>}
      {children}
      <div className="consult-missing-group">
        <h3>Cần bổ sung dữ liệu ({results.needsData.length})</h3>
        <p className="muted">Nhóm này không được chấm điểm tổng hoặc xếp hạng. Trường chưa có dữ liệu ngành cũng được giữ ở đây để tránh kết luận trường không đào tạo ngành bạn chọn.</p>
        {results.needsData.length === 0 ? <p>Không có trường trong nhóm này.</p> : <ul>{results.needsData.map((r) => <li key={r.slug}><details><summary>{r.name} — {r.reason}</summary><p>{r.major ? `Ngành ghi nhận: ${r.major}. ` : ''}Độ phủ dữ liệu: {r.coverage}%. Chưa đủ điều kiện xếp hạng.</p><ul>{Object.entries(r.criteria).map(([key, c]) => <li key={key}><strong>{LABELS[key]}: </strong>{c.text} {c.source && <a href={c.source} target="_blank" rel="noreferrer">Nguồn</a>}</li>)}</ul></details></li>)}</ul>}
      </div>
      {results.composite?.length > 0 && <div className="consult-composite-group">
        <h3>Trường xét tuyển tổng hợp — công thức riêng ({results.composite.length})</h3>
        <p className="muted">Các trường này dùng điểm thang 100 gộp ĐGNL, điểm thi THPT, học bạ, điểm cộng và ưu tiên, nên không xếp chung với bảng trên. Ước tính sơ bộ giả định bạn không có ĐGNL (×0,75), học bạ bằng điểm thi, chưa có điểm cộng/ưu tiên — hãy dùng máy tính để có kết quả sát hơn.</p>
        {results.composite.map((c) => <article key={c.slug} className="consult-result-card">
          <div className="consult-result-heading"><h3>{c.name}</h3></div>
          <p>Điểm chuẩn {c.year} (thang 100) các ngành liên quan, cao xuống thấp:</p>
          <ul className="composite-compare">{c.programs.map((p) => <li key={p.program}>
            <strong>{p.majors.join(', ')}</strong> — {p.program}: <strong>{p.cutoff.toLocaleString('vi-VN')}</strong>
            {!p.accepted ? <> — <span className="composite-badge hard">Không xét tổ hợp {preferences.combination}</span> (xét {p.combinations.join(', ')})</>
              : p.estimate !== null ? <> — ước tính của bạn {p.estimate.toLocaleString('vi-VN')}: <span className={`composite-badge ${p.status.level}`}>{p.status.label}</span></>
                : <> — {c.formula ? 'dùng máy tính bên dưới để ước tính' : 'chưa ước tính (chưa có hệ số công thức chính thức)'}</>}
            {' '}<a href={p.source} target="_blank" rel="noreferrer">Nguồn</a>
          </li>)}</ul>
          {c.formula && <button type="button" className="btn btn-outline" aria-expanded={openCalc === c.slug} onClick={() => setOpenCalc(openCalc === c.slug ? null : c.slug)}>{openCalc === c.slug ? 'Ẩn máy tính' : '🧮 Tính điểm chi tiết cho trường này'}</button>}
          {openCalc === c.slug && <CompositeCalculator formula={c.formula} combination={preferences.combination} subjectScores={preferences.subjectScores || ['', '', '']} programs={c.programs} />}
          <p className="consult-help">Nguồn công thức: {c.formulaSources.map((url, i) => <span key={url}>{i > 0 && ', '}<a href={url} target="_blank" rel="noreferrer">[{i + 1}]</a></span>)}. Chỉ tham khảo.</p>
        </article>)}
      </div>}
      <p className="consult-help">{results.excluded} trường bị loại do không khớp ngành đã ghi nhận hoặc loại trường đã chọn. Danh mục seed có thể chưa đầy đủ.</p>
    </section>
  )
}

export default RecommendationResults
