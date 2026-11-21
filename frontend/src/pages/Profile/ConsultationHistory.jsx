import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Compass, History, Info, Trash2 } from 'lucide-react'
import { deleteConsultation, listConsultations } from '../../services/consultations'
import { getErrorMessage } from '../../services/api'
import { describeCriteria } from '../../features/recommendations/consultation'

const formatDate = (iso) => new Date(iso).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })

// Danh sách các lần AI tư vấn đã lưu (WBS 6.7). Chỉ tải khi tab được mở lần đầu.
function ConsultationHistory({ active }) {
  const [state, setState] = useState({ status: 'idle', items: [] })
  const [attempt, setAttempt] = useState(0)
  const [removing, setRemoving] = useState(null)
  const [error, setError] = useState('')
  // state.attempt = lần tải đã xong gần nhất; khác attempt hiện tại nghĩa là cần tải (lần đầu hoặc bấm Thử lại).
  const shouldLoad = active && state.attempt !== attempt

  useEffect(() => {
    if (!shouldLoad) return
    const controller = new AbortController()
    listConsultations(controller.signal)
      .then((items) => { if (!controller.signal.aborted) setState({ status: 'ready', attempt, items }) })
      .catch((e) => { if (!controller.signal.aborted) setState({ status: 'error', attempt, items: [], message: getErrorMessage(e) }) })
    return () => controller.abort()
  }, [shouldLoad, attempt])

  async function remove(item) {
    if (!window.confirm(`Xóa lần tư vấn lúc ${formatDate(item.createdAt)}?`)) return
    setRemoving(item.id)
    setError('')
    try {
      await deleteConsultation(item.id)
      setState((s) => ({ ...s, items: s.items.filter((x) => x.id !== item.id) }))
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setRemoving(null)
    }
  }

  const heading = <div className="up-panel-heading"><div><h2>Lịch sử tư vấn</h2><p>Các lần AI tư vấn bạn đã lưu, mới nhất ở trên (tối đa 30 lần).</p></div>
    {state.items.length > 0 && <span className="up-type">{state.items.length} lần đã lưu</span>}</div>

  if (state.status !== 'ready' && state.status !== 'error') {
    return <>{heading}<div className="up-skeleton-grid" role="status" aria-label="Đang tải lịch sử tư vấn"><span /><span /></div></>
  }
  if (state.status === 'error') {
    return <>{heading}<div className="up-empty" role="alert"><Info size={32} aria-hidden="true" /><h3>Chưa tải được lịch sử tư vấn</h3><p>{state.message}</p>
      <button className="up-button up-button-primary" onClick={() => { setState({ status: 'idle', items: [] }); setAttempt((n) => n + 1) }}>Thử lại</button></div></>
  }
  if (!state.items.length) {
    return <>{heading}<div className="up-empty"><span className="up-empty-icon"><History size={30} aria-hidden="true" /></span><h3>Chưa có lần tư vấn nào được lưu</h3>
      <p>Sau khi AI gợi ý trường, bấm “Lưu kết quả tư vấn” để xem lại ở đây.</p>
      <Link className="up-button up-button-primary" to="/ai-tu-van">Tư vấn ngay <ArrowRight size={16} aria-hidden="true" /></Link></div></>
  }

  return <>
    {heading}
    {error && <p className="up-notice up-error" role="alert"><Info size={15} aria-hidden="true" />{error}</p>}
    <ol className="up-history">
      {state.items.map((item) => <li key={item.id} className="up-history-item">
        <div className="up-history-head">
          <div>
            <p className="up-history-date"><Compass size={15} aria-hidden="true" />{formatDate(item.createdAt)}</p>
            <ul className="up-history-tags">{describeCriteria(item.criteria).map((t) => <li key={t} className="up-type">{t}</li>)}</ul>
          </div>
          <button type="button" className="up-button up-button-outline" onClick={() => remove(item)} disabled={removing === item.id}
            aria-label={`Xóa lần tư vấn lúc ${formatDate(item.createdAt)}`}><Trash2 size={15} aria-hidden="true" />{removing === item.id ? 'Đang xóa…' : 'Xóa'}</button>
        </div>
        {item.results.length ? <ol className="up-history-results">
          {item.results.map((r) => <li key={r.slug}>
            <div><Link to={`/truong/${encodeURIComponent(r.slug)}`}>{r.name}</Link>{r.major && <small> — {r.major}</small>}</div>
            <strong>{r.matchScore.toLocaleString('vi-VN')}/100</strong>
          </li>)}
        </ol> : <p className="up-muted">Các trường trong lần tư vấn này không còn trong hệ thống.</p>}
      </li>)}
    </ol>
  </>
}

export default ConsultationHistory
