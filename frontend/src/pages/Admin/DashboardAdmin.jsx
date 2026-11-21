import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../../services/dashboard'
import { getErrorMessage } from '../../services/api'
import { coverageRows, trendBars, typeRows } from './dashboardView'

const ACTION_LABEL = { create: 'Tạo', update: 'Sửa', delete: 'Xóa', status: 'Khóa / mở', role: 'Đổi vai trò', permissions: 'Đổi quyền', restore: 'Khôi phục' }
const ENTITY_LABEL = { university: 'Trường', user: 'Tài khoản' }
const vn = (n) => Number(n || 0).toLocaleString('vi-VN')
const formatTime = (iso) => new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })

function Stat({ label, value, note }) {
  return <div className="dash-stat"><p>{label}</p><strong>{vn(value)}</strong>{note && <small>{note}</small>}</div>
}

// Thanh ngang một màu: giá trị ghi bằng chữ bên cạnh, màu chỉ để nhìn tỉ lệ.
function BarList({ rows, unit = 'trường' }) {
  return <ul className="dash-bars">
    {rows.map((r) => <li key={r.key} title={`${r.label}: ${vn(r.value)}/${vn(r.total)} ${unit} (${r.pct}%)`}>
      <span className="dash-bar-label">{r.label}</span>
      <span className="dash-bar-track" aria-hidden="true"><span className="dash-bar-fill" style={{ width: `${r.pct}%` }} /></span>
      <span className="dash-bar-value">{vn(r.value)}/{vn(r.total)} <small>({r.pct}%)</small></span>
    </li>)}
  </ul>
}

function TrendChart({ trend }) {
  const { max, bars } = trendBars(trend)
  return <figure className="dash-trend">
    <div className="dash-trend-plot" role="img" aria-label={`Số lần lưu tư vấn mỗi ngày trong ${bars.length} ngày gần nhất, cao nhất ${max} lần/ngày`}>
      <span className="dash-trend-max">{vn(max)}</span>
      {bars.map((b) => <div key={b.date} className="dash-trend-col" title={`${b.label}: ${vn(b.count)} lần`}>
        <span className="dash-trend-bar" style={{ height: `${b.pct}%` }} />
      </div>)}
    </div>
    <div className="dash-trend-axis" aria-hidden="true">{bars.map((b, i) => <span key={b.date}>{i % 2 === bars.length % 2 ? b.label : ''}</span>)}</div>
    <details className="dash-table">
      <summary>Xem dạng bảng</summary>
      <table className="admin-table"><thead><tr><th>Ngày</th><th>Số lần lưu</th></tr></thead>
        <tbody>{bars.map((b) => <tr key={b.date}><td>{b.label}</td><td>{vn(b.count)}</td></tr>)}</tbody></table>
    </details>
  </figure>
}

// Tab Tổng quan của trang quản trị (WBS 7.2): số liệu chỉ đọc, tải lại bằng nút.
function DashboardAdmin({ goTo }) {
  const [state, setState] = useState({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getDashboard(controller.signal)
      .then((data) => { if (!controller.signal.aborted) setState({ status: 'ready', data }) })
      .catch((e) => { if (!controller.signal.aborted) setState({ status: 'error', message: getErrorMessage(e) }) })
    return () => controller.abort()
  }, [attempt])

  const reload = () => { setState({ status: 'loading' }); setAttempt((n) => n + 1) }
  if (state.status === 'loading') return <p role="status">Đang tải số liệu…</p>
  if (state.status === 'error') return <div className="alert-error" role="alert">{state.message} <button type="button" className="btn btn-outline" onClick={reload}>Thử lại</button></div>

  const d = state.data
  return <div className="dash">
    <div className="dash-head">
      <p className="muted admin-small">Cập nhật lúc {formatTime(d.generatedAt)}</p>
      <button type="button" className="btn btn-outline" onClick={reload}>Tải lại</button>
    </div>

    <div className="dash-stats">
      <Stat label="Trường đại học" value={d.universities.total} note={`${vn(d.universities.vnuhcm)} trường thuộc ĐHQG-HCM`} />
      <Stat label="Ngành trong danh mục" value={d.majorCount} />
      <Stat label="Tài khoản" value={d.users.total} note={`+${vn(d.users.newLast30Days)} trong 30 ngày · ${vn(d.users.locked)} đang khóa`} />
      <Stat label="Lượt lưu tư vấn" value={d.consultations.total} note={`${vn(d.consultations.last7Days)} lượt trong 7 ngày`} />
    </div>

    <div className="dash-grid">
      <section className="admin-section">
        <h2 className="dash-title">Độ đầy đủ dữ liệu trường</h2>
        <p className="muted admin-small">Số trường đã có từng loại thông tin. Thanh ngắn là phần cần bổ sung trước.</p>
        <BarList rows={coverageRows(d)} />
        <button type="button" className="btn btn-outline dash-link" onClick={() => goTo?.('universities')}>Sửa dữ liệu trường →</button>
      </section>

      <section className="admin-section">
        <h2 className="dash-title">Lượt lưu tư vấn — 14 ngày gần nhất</h2>
        <p className="muted admin-small">Mỗi cột là số lần người dùng bấm “Lưu kết quả tư vấn” trong ngày (giờ Việt Nam).</p>
        <TrendChart trend={d.consultations.trend} />
      </section>

      <section className="admin-section">
        <h2 className="dash-title">Trường theo loại hình</h2>
        <BarList rows={typeRows(d)} />
        <h3 className="dash-subtitle">Tài khoản theo vai trò</h3>
        <ul className="dash-pairs">
          <li><span>Người dùng</span><strong>{vn(d.users.byRole.user)}</strong></li>
          <li><span>Quản trị viên</span><strong>{vn(d.users.byRole.admin)}</strong></li>
          <li><span>Quản trị cấp cao</span><strong>{vn(d.users.byRole.superadmin)}</strong></li>
        </ul>
      </section>

      <section className="admin-section">
        <h2 className="dash-title">Được yêu thích nhiều nhất</h2>
        {d.topFavorites.length ? <ol className="dash-rank">
          {d.topFavorites.map((u) => <li key={u.slug}><Link to={`/truong/${encodeURIComponent(u.slug)}`}>{u.shortName || u.name}</Link><strong>♥ {vn(u.favoriteCount)}</strong></li>)}
        </ol> : <p className="muted admin-small">Chưa có lượt yêu thích nào.</p>}

        <h3 className="dash-subtitle">Thay đổi gần đây</h3>
        {d.recentChanges.length ? <ul className="dash-changes">
          {d.recentChanges.map((c) => <li key={c.id}>
            <span><strong>{ACTION_LABEL[c.action] || c.action}</strong> {ENTITY_LABEL[c.entity] || c.entity}: {c.entityLabel || '—'}</span>
            <small>{c.actor || 'Không rõ'} · {formatTime(c.createdAt)}</small>
          </li>)}
        </ul> : <p className="muted admin-small">Chưa có thay đổi nào.</p>}
        <button type="button" className="btn btn-outline dash-link" onClick={() => goTo?.('history')}>Xem toàn bộ lịch sử →</button>
      </section>
    </div>
  </div>
}

export default DashboardAdmin
