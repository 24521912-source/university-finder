import { useEffect, useState } from 'react'
import { useAuth } from '../../features/auth/AuthContext'
import { getErrorMessage } from '../../services/api'
import { createAccount, deleteAccount, listAccounts, setAccountPermissions, setAccountRole, setAccountStatus } from '../../services/accounts'
import { ROLE_LABEL, can } from '../../utils/roles'

// Mật khẩu tạm dễ đọc qua điện thoại: bỏ các ký tự dễ nhầm (0/O, 1/l/I).
function tempPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

function CreateAccountForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: tempPassword() })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const account = await createAccount(form)
      onCreated(account, form.password)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return <form className="admin-section" onSubmit={submit}>
    <h2 className="admin-subtitle">Tạo tài khoản hộ người dùng</h2>
    <p className="muted admin-small">Dùng khi người dùng nhờ đăng ký giúp (vd gọi điện). Tài khoản luôn là người dùng thường; lần đầu đăng nhập sẽ được nhắc đổi mật khẩu.</p>
    {error && <div className="alert-error" role="alert">{error}</div>}
    <div className="admin-grid">
      <label className="admin-field"><span>Họ và tên *</span><input className="input" required maxLength={100} value={form.fullName} onChange={set('fullName')} /></label>
      <label className="admin-field"><span>Email *</span><input className="input" type="email" required value={form.email} onChange={set('email')} /></label>
      <label className="admin-field"><span>Mật khẩu tạm * (tối thiểu 6 ký tự)</span>
        <span className="admin-inline"><input className="input" required minLength={6} value={form.password} onChange={set('password')} />
          <button type="button" className="btn btn-outline" onClick={() => setForm((f) => ({ ...f, password: tempPassword() }))}>Tạo lại</button></span></label>
    </div>
    <div className="admin-inline">
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang tạo…' : 'Tạo tài khoản'}</button>
      <button type="button" className="btn btn-outline" onClick={onCancel}>Hủy</button>
    </div>
  </form>
}

function AccountsAdmin() {
  const { user: me } = useAuth()
  const [filters, setFilters] = useState({ q: '', role: '', status: '' })
  const [query, setQuery] = useState({ q: '', role: '', status: '', page: 1 })
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    listAccounts(query, controller.signal)
      .then((d) => { setData(d); setError('') })
      .catch((e) => { if (!controller.signal.aborted) setError(getErrorMessage(e)) })
    return () => controller.abort()
  }, [query, reload])

  async function run(account, action, message) {
    setBusy(account._id)
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

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return <div>
    <div className="admin-head">
      <p className="muted">Khóa có hiệu lực ngay: người bị khóa không đăng nhập hoặc dùng tiếp phiên cũ được.</p>
      {!creating && <button type="button" className="btn btn-primary" onClick={() => { setNotice(''); setCreating(true) }}>+ Tạo tài khoản hộ</button>}
    </div>
    {creating && <CreateAccountForm onCancel={() => setCreating(false)} onCreated={(account, password) => {
      setCreating(false)
      setNotice(`Đã tạo tài khoản ${account.email}. Mật khẩu tạm: ${password} — hãy báo cho người dùng, thông báo này sẽ không hiện lại.`)
      setReload((n) => n + 1)
    }} />}
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    {error && <div className="alert-error" role="alert">{error}</div>}

    <form className="admin-search" onSubmit={(e) => { e.preventDefault(); setQuery({ ...filters, page: 1 }) }}>
      <input className="input" type="search" placeholder="Tìm theo tên hoặc email" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
      <select className="input admin-select" aria-label="Lọc vai trò" value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}>
        <option value="">Mọi vai trò</option>{Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <select className="input admin-select" aria-label="Lọc trạng thái" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
        <option value="">Mọi trạng thái</option><option value="active">Đang hoạt động</option><option value="locked">Đã khóa</option>
      </select>
      <button type="submit" className="btn btn-outline">Lọc</button>
    </form>

    {!data && !error && <p role="status">Đang tải…</p>}
    {data && <>
      <p className="muted">{data.total} tài khoản</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Tài khoản</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
          <tbody>
            {data.items.map((a) => {
              const isMe = String(a._id) === String(me?.id)
              const disabled = busy === a._id
              return <tr key={a._id}>
                <td><strong>{a.fullName}</strong>{isMe && <span className="badge admin-badge-me">Bạn</span>}<div className="muted admin-small">{a.email}</div>
                  {a.mustChangePassword && <div className="admin-small admin-warn">Chưa đổi mật khẩu tạm</div>}</td>
                <td>{ROLE_LABEL[a.role] || a.role}{a.role === 'admin' && a.canManageAdmins && <div className="admin-small muted">+ quản lý quản trị viên</div>}</td>
                <td>{a.status === 'locked' ? <span className="badge admin-badge-locked">Đã khóa</span> : <span className="badge badge-green">Hoạt động</span>}</td>
                <td className="admin-small">{a.createdAt ? new Date(a.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                <td><div className="admin-actions-cell">
                  {can(me, a, 'status') && (a.status === 'locked'
                    ? <button type="button" className="btn btn-outline" disabled={disabled} onClick={() => run(a, () => setAccountStatus(a._id, 'active'), `Đã mở khóa ${a.email}.`)}>Mở khóa</button>
                    : <button type="button" className="btn btn-outline" disabled={disabled} onClick={() => run(a, () => setAccountStatus(a._id, 'locked'), `Đã khóa ${a.email}.`)}>Khóa</button>)}
                  {can(me, a, 'role') && (a.role === 'user'
                    ? <button type="button" className="btn btn-outline" disabled={disabled} onClick={() => window.confirm(`Nâng ${a.email} lên quản trị viên?`) && run(a, () => setAccountRole(a._id, 'admin'), `${a.email} đã là quản trị viên.`)}>Nâng lên quản trị</button>
                    : <button type="button" className="btn btn-outline" disabled={disabled} onClick={() => window.confirm(`Hạ ${a.email} xuống người dùng?`) && run(a, () => setAccountRole(a._id, 'user'), `${a.email} đã về người dùng thường.`)}>Hạ xuống người dùng</button>)}
                  {can(me, a, 'permissions') && <label className="admin-check-inline"><input type="checkbox" checked={a.canManageAdmins} disabled={disabled}
                    onChange={(e) => run(a, () => setAccountPermissions(a._id, e.target.checked), e.target.checked ? `Đã trao quyền quản lý quản trị viên cho ${a.email}.` : `Đã thu quyền quản lý quản trị viên của ${a.email}.`)} /> Quản lý quản trị viên</label>}
                  {can(me, a, 'delete') && <button type="button" className="btn admin-danger-link" disabled={disabled} onClick={() => window.confirm(`Xóa tài khoản ${a.email}? Tài khoản sẽ không đăng nhập được (có thể khôi phục sau).`) && run(a, () => deleteAccount(a._id), `Đã xóa ${a.email}.`)}>Xóa</button>}
                  {!['status', 'role', 'permissions', 'delete'].some((x) => can(me, a, x)) && <span className="muted admin-small">—</span>}
                </div></td>
              </tr>
            })}
            {!data.items.length && <tr><td colSpan="5" className="muted">Không có tài khoản nào khớp.</td></tr>}
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

export default AccountsAdmin
