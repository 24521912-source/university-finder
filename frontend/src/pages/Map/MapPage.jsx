import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LeafletMap from '../../components/LeafletMap'
import { getMapUniversities } from '../../services/map'
import { getErrorMessage } from '../../services/api'
import { TYPE_STYLE, filterSchools, toPoints } from '../../features/map/mapData'
import './MapPage.css'

// Trang bản đồ trường (WBS 4.9, 8.3). ?truong=<slug> mở sẵn trường đó (link từ trang chi tiết).
function MapPage() {
  const [state, setState] = useState({ status: 'loading', items: [], missing: [] })
  const [attempt, setAttempt] = useState(0)
  const [params, setParams] = useSearchParams()
  const [filters, setFilters] = useState({ q: '', type: 'all', vnu: false })
  const selected = params.get('truong')

  useEffect(() => {
    const controller = new AbortController()
    getMapUniversities(controller.signal)
      .then((data) => { if (!controller.signal.aborted) setState({ status: 'ready', items: data.items || [], missing: data.missing || [] }) })
      .catch((e) => { if (!controller.signal.aborted) setState({ status: 'error', items: [], missing: [], message: getErrorMessage(e) }) })
    return () => controller.abort()
  }, [attempt])

  const visible = useMemo(() => filterSchools(state.items, filters), [state.items, filters])
  const points = useMemo(() => toPoints(visible), [visible])
  const select = useCallback((id) => setParams({ truong: id.split('#')[0] }, { replace: true }), [setParams])
  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }))

  return (
    <div className="container map-page">
      <h1 className="page-title">Bản đồ trường đại học</h1>
      <p className="page-subtitle">Vị trí trụ sở và cơ sở đào tạo của các trường tại TP.HCM. Bấm vào một điểm hoặc tên trường để xem chi tiết.</p>

      {state.status === 'error' && <div className="alert-error" role="alert">{state.message}{' '}
        <button type="button" className="btn btn-outline" onClick={() => { setState({ status: 'loading', items: [], missing: [] }); setAttempt((n) => n + 1) }}>Thử lại</button></div>}

      <div className="map-layout">
        <aside className="map-sidebar" aria-label="Lọc và danh sách trường trên bản đồ">
          <label className="map-label" htmlFor="map-search">Tìm trường</label>
          <input id="map-search" className="input" type="search" placeholder="Tên, viết tắt hoặc quận (vd: bach khoa, UIT)"
            value={filters.q} onChange={(e) => setFilter('q', e.target.value)} />
          <div className="map-types" role="group" aria-label="Loại trường">
            {[['all', 'Tất cả'], ...Object.entries(TYPE_STYLE).map(([k, v]) => [k, v.label])].map(([key, label]) =>
              <button key={key} type="button" aria-pressed={filters.type === key} className={filters.type === key ? 'is-active' : ''}
                onClick={() => setFilter('type', key)}>
                {key !== 'all' && <span className="map-dot" style={{ background: TYPE_STYLE[key].color }} aria-hidden="true" />}{label}
              </button>)}
          </div>
          <label className="map-check"><input type="checkbox" checked={filters.vnu} onChange={(e) => setFilter('vnu', e.target.checked)} /> Chỉ trường thuộc ĐHQG-HCM</label>

          <p className="map-count" aria-live="polite">
            {state.status === 'loading' ? 'Đang tải…' : `${visible.length} trường trên bản đồ`}
          </p>
          <ul className="map-list">
            {visible.map((u) => <li key={u.slug}>
              <button type="button" className={selected === u.slug ? 'is-active' : ''} aria-current={selected === u.slug ? 'true' : undefined} onClick={() => select(u.slug)}>
                <span className="map-dot" style={{ background: (TYPE_STYLE[u.institutionType] || TYPE_STYLE.other).color }} aria-hidden="true" />
                <span><strong>{u.shortName || u.name}</strong><small>{u.shortName ? u.name : ''}{u.district ? `${u.shortName ? ' · ' : ''}${u.district}` : ''}</small></span>
              </button>
            </li>)}
            {state.status === 'ready' && !visible.length && <li className="map-empty">Không có trường nào khớp bộ lọc.</li>}
          </ul>

          {state.missing.length > 0 && <details className="map-missing">
            <summary>Chưa có tọa độ ({state.missing.length} trường)</summary>
            <p>Các trường này chưa có vị trí trong dữ liệu nên chưa hiện trên bản đồ. Quản trị viên bổ sung tại trang Quản trị → sửa trường → ô Tọa độ trụ sở.</p>
            <ul>{state.missing.map((u) => <li key={u.slug}><Link to={`/truong/${encodeURIComponent(u.slug)}`}>{u.shortName || u.name}</Link>{u.district && <small> — {u.district}</small>}</li>)}</ul>
          </details>}
        </aside>

        <div className="map-canvas">
          <LeafletMap points={points} selectedId={selected} onSelect={select} label="Bản đồ vị trí các trường đại học" />
          <p className="map-note">Chấm lớn: trụ sở. Chấm nhỏ: cơ sở khác. Vị trí lấy từ dữ liệu của dự án, có thể chưa chính xác tuyệt đối.</p>
        </div>
      </div>
    </div>
  )
}

export default MapPage
