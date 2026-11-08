import { Fragment, useEffect, useState } from 'react'
import { useAuth } from '../../features/auth/AuthContext'
import { getErrorMessage } from '../../services/api'
import { deleteHistory, getHistory, listHistory, restoreHistory } from '../../services/history'
import { ROLE_LABEL, isSuperadmin } from '../../utils/roles'

const ACTION_LABEL = {
  create: 'Tạo mới', update: 'Sửa', delete: 'Xóa', status: 'Khóa / mở khóa', role: 'Đổi vai trò',
  permissions: 'Đổi quyền quản lý', restore: 'Khôi phục',
}
const ENTITY_LABEL = { university: 'Trường', user: 'Tài khoản' }
const FIELD_LABEL = {
  name: 'Tên', slug: 'Slug', shortName: 'Tên viết tắt', majors: 'Ngành', tuition: 'Học phí', admissions: 'Điểm chuẩn',
  address: 'Địa chỉ', contact: 'Liên hệ', description: 'Mô tả', dataLevel: 'Mức dữ liệu', sourceDomains: 'Tên miền nguồn',
  detailEvidence: 'Dữ liệu duyệt riêng', role: 'Vai trò', status: 'Trạng thái', deletedAt: 'Đã xóa',
  canManageAdmins: 'Quyền quản lý quản trị viên', fullName: 'Họ tên',
}

// Hiện giá trị ngắn gọn; mảng dài chỉ hiện số dòng.
function short(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return `${value.length} dòng`
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 120)
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  return String(value).slice(0, 120)
}

function Detail({ id }) {
  const [log, setLog] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getHistory(id).then(setLog).catch((e) => setError(getErrorMessage(e))) }, [id])
  if (error) return <p className="alert-error">{error}</p>
  if (!log) return <p className="muted admin-small">Đang tải…</p>
  const fields = log.changedFields?.length ? log.changedFields : Object.keys(log.after || log.before || {}).filter((k) => !['_id', '__v'].includes(k))
  return <table className="admin-table admin-diff">
    <thead><tr><th>Mục</th><th>Trước</th><th>Sau</th></tr></thead>
    <tbody>{fields.map((k) => <tr key={k}><td>{FIELD_LABEL[k] || k}</td><td>{short(log.before?.[k])}</td><td>{short(log.after?.[k])}</td></tr>)}</tbody>
  </table>
}

function HistoryAdmin() {
  const { user: me } = useAuth()
  const [filters, setFilters] = useState({ q: '', entity: '', action: '' })
  const [query, setQuery] = useState({ q: '', entity: '', action: '', page: 1 })
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [open, setOpen] = useState(null)
  const [busy, setBusy] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    listHistory(query, controller.signal)
      .then((d) => { setData(d); setError('') })
      .catch((e) => { if (!controller.signal.aborted) setError(getErrorMessage(e)) })
    return () => controller.abort()
  }, [query, reload])

  async function run(log, action, message) {
    setBusy(log._id)
    setError('')
    setNotice('')
    try {
      await action()
      setNotice(message)
      setReload((n) => n + 1)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  const restoreText = (log) => !log.hasBefore
    ? `Dòng này là "tạo mới". Khôi phục sẽ XÓA ${log.entity === 'university' ? 'trường' : 'tài khoản'} "${log.entityLabel}". Tiếp tục?`
    : `Đưa "${log.entityLabel}" về bản TRƯỚC thay đổi này? Mọi thay đổi sau đó trên đối tượng này sẽ bị ghi đè (vẫn khôi phục lại được từ lịch sử).`
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return <div>
    <p className="muted">Mỗi thay đổi của quản trị viên được lưu kèm bản trước / sau. Bấm “Khôi phục” để đưa đối tượng về bản trước thay đổi đó.</p>
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    {error && <div className="alert-error" role="alert">{error}</div>}

    <form className="admin-search" onSubmit={(e) => { e.preventDefault(); setQuery({ ...filters, page: 1 }) }}>
      <input className="input" type="search" placeholder="Tìm theo tên trường, email tài khoản hoặc người thực hiện" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
      <select className="input admin-select" aria-label="Lọc đối tượng" value={filters.entity} onChange={(e) => setFilters((f) => ({ ...f, entity: e.target.value }))}>
        <option value="">Mọi đối tượng</option>{Object.entries(ENTITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <select className="input admin-select" aria-label="Lọc thao tác" value={filters.action} onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}>
        <option value="">Mọi thao tác</option>{Object.entries(ACTION_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <button type="submit" className="btn btn-outline">Lọc</button>
    </form>

    {!data && !error && <p role="status">Đang tải…</p>}
    {data && <>
      <p className="muted">{data.total} dòng lịch sử</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Thời gian</th><th>Người thực hiện</th><th>Thao tác</th><th>Đối tượng</th><th>Thay đổi</th><th></th></tr></thead>
          <tbody>
            {data.items.map((log) => <Fragment key={log._id}>
              <tr>
                <td className="admin-small">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                <td>{log.actor?.fullName || '—'}<div className="muted admin-small">{log.actor?.email} · {ROLE_LABEL[log.actor?.role] || log.actor?.role}</div></td>
                <td>{ACTION_LABEL[log.action] || log.action}</td>
                <td>{ENTITY_LABEL[log.entity]}: <strong>{log.entityLabel || '—'}</strong></td>
                <td className="admin-small">{(log.changedFields || []).map((k) => FIELD_LABEL[k] || k).join(', ') || '—'}</td>
                <td><div className="admin-actions-cell">
                  <button type="button" className="btn btn-outline" onClick={() => setOpen(open === log._id ? null : log._id)}>{open === log._id ? 'Ẩn' : 'Xem'}</button>
                  <button type="button" className="btn btn-outline" disabled={busy === log._id}
                    onClick={() => window.confirm(restoreText(log)) && run(log, () => restoreHistory(log._id), `Đã khôi phục "${log.entityLabel}".`)}>Khôi phục</button>
                  {isSuperadmin(me) && <button type="button" className="btn admin-danger-link" disabled={busy === log._id}
                    onClick={() => window.confirm('Xóa dòng lịch sử này? Sau khi xóa sẽ không khôi phục được từ dòng này nữa.') && run(log, () => deleteHistory(log._id), 'Đã xóa dòng lịch sử.')}>Xóa</button>}
                </div></td>
              </tr>
              {open === log._id && <tr><td colSpan="6"><Detail id={log._id} /></td></tr>}
            </Fragment>)}
            {!data.items.length && <tr><td colSpan="6" className="muted">Chưa có lịch sử nào.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="admin-pager">
        <button type="button" className="btn btn-outline" disabled={query.page <= 1} onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}>← Trước</button>
        <span>Trang {query.page}/{pages}</span>
        <button type="button" className="btn btn-outline" disabled={query.page >= pages} onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}>Sau →</button>
      </div>
    </>}
  </div>
}

export default HistoryAdmin
