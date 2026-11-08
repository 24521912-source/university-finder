import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { getErrorMessage } from '../../services/api'
import UniversityCard from '../../components/UniversityCard'
import { useFavorites } from '../../features/favorites/useFavorites'
import { filterUniversities, PAGE_SIZE, paginate } from './universitySearch'
import './Universities.css'

const TYPE_OPTIONS = [['all', 'Tất cả'], ['public', 'Công lập'], ['private', 'Tư thục']]

function Universities() {
  const { isFavorite, toggle, countOf, error: favoriteError } = useFavorites()
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [params, setParams] = useSearchParams()

  // Trạng thái lưu trên URL để giữ khi quay lại / chia sẻ link.
  const query = params.get('q') || ''
  const type = ['public', 'private'].includes(params.get('loai')) ? params.get('loai') : 'all'
  const vnuOnly = params.get('dhqg') === '1'
  const page = Math.max(1, Number.parseInt(params.get('trang'), 10) || 1)

  useEffect(() => {
    api
      .get('/universities')
      .then((response) => setUniversities(response.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  function update(changes, { resetPage = true } = {}) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(changes)) {
        if (value === '' || value === null || value === false || value === 'all') next.delete(key)
        else next.set(key, value === true ? '1' : String(value))
      }
      if (resetPage) next.delete('trang')
      return next
    }, { replace: true })
  }

  const filtered = useMemo(() => filterUniversities(universities, { query, type, vnuOnly }), [universities, query, type, vnuOnly])
  const { items, totalPages, current } = paginate(filtered, page)

  function goTo(p) {
    update({ trang: p === 1 ? '' : p }, { resetPage: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container">
      <h1 className="page-title">Danh sách trường đại học TP.HCM</h1>
      <p className="page-subtitle">Khám phá và tìm kiếm các trường đại học phù hợp với nhu cầu của bạn.</p>

      <div className="uni-toolbar">
        <div className="uni-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input
            type="search" className="input" aria-label="Tìm trường"
            placeholder="Tìm theo tên hoặc tên viết tắt: UIT, công nghệ thông tin, bach khoa…"
            value={query} onChange={(e) => update({ q: e.target.value })}
          />
        </div>
        <div className="uni-filters">
          <div className="uni-type" role="group" aria-label="Loại trường">
            {TYPE_OPTIONS.map(([value, label]) => (
              <button key={value} type="button" aria-pressed={type === value} className={type === value ? 'selected' : ''} onClick={() => update({ loai: value })}>{label}</button>
            ))}
          </div>
          <label className="uni-vnu">
            <input type="checkbox" checked={vnuOnly} onChange={(e) => update({ dhqg: e.target.checked })} />
            Chỉ trường thuộc ĐHQG-HCM
          </label>
        </div>
      </div>

      {error && <div className="alert-error" role="alert">{error}</div>}

      {loading ? (
        <p className="muted">Đang tải…</p>
      ) : (
        <>
          <p className="muted" aria-live="polite">
            {filtered.length === universities.length ? `${universities.length} trường` : `Tìm thấy ${filtered.length}/${universities.length} trường`}
            {totalPages > 1 && ` · Trang ${current}/${totalPages}`}
          </p>
          {filtered.length === 0 ? (
            <div className="uni-empty">
              <p>Không tìm thấy trường phù hợp.</p>
              <button type="button" className="btn btn-outline" onClick={() => setParams({}, { replace: true })}>Xóa bộ lọc</button>
            </div>
          ) : (
            <>{favoriteError && <div className="alert-error" role="alert">{favoriteError}</div>}<div className="card-grid">
              {items.map((university) => (
                <UniversityCard key={university._id} university={{ ...university, favoriteCount: countOf(university) }} isFavorite={isFavorite(university)} onToggleFavorite={toggle} />
              ))}
            </div></>
          )}
          {totalPages > 1 && <Pagination current={current} total={totalPages} onChange={goTo} />}
        </>
      )}
    </div>
  )
}

function Pagination({ current, total, onChange }) {
  // Hiện trang đầu, cuối và 1 trang mỗi bên trang hiện tại; chỗ trống bằng "…".
  const pages = []
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) pages.push(p)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }
  return (
    <nav className="uni-pagination" aria-label={`Phân trang, ${PAGE_SIZE} trường mỗi trang`}>
      <button type="button" disabled={current === 1} onClick={() => onChange(current - 1)} aria-label="Trang trước">‹</button>
      {pages.map((p, i) => p === '…'
        ? <span key={`gap-${i}`} className="uni-page-gap">…</span>
        : <button key={p} type="button" className={p === current ? 'selected' : ''} aria-current={p === current ? 'page' : undefined} onClick={() => onChange(p)}>{p}</button>)}
      <button type="button" disabled={current === total} onClick={() => onChange(current + 1)} aria-label="Trang sau">›</button>
    </nav>
  )
}

export default Universities
