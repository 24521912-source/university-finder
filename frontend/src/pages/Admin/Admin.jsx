import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Building2, ChevronLeft, ChevronRight, Database, GraduationCap, LayoutDashboard, LogOut, Search, ShieldCheck, Users, Wallet } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { getAdminData } from '../../services/admin'
import { getErrorMessage } from '../../services/api'
import { INSTITUTION_TYPE_LABEL } from '../../utils/format'
import './Admin.css'

const menus = [
  ['overview', 'Tổng quan', LayoutDashboard], ['universities', 'Quản lý trường đại học', Building2],
  ['majors', 'Quản lý ngành đào tạo', GraduationCap], ['tuition', 'Quản lý học phí', Wallet],
  ['admissions', 'Quản lý điểm chuẩn', BookOpen], ['users', 'Quản lý người dùng', Users], ['ai-data', 'Quản lý dữ liệu AI', Database],
]
const labels = { year: 'năm', semester: 'học kỳ', credit: 'tín chỉ', program: 'khóa', high_school_exam: 'THPT', competency_assessment: 'ĐGNL', transcript: 'Học bạ', direct: 'Tuyển thẳng', other: 'Khác / tổng hợp — xem nguồn' }
const value = input => input === null || input === undefined || input === '' ? 'Chưa có' : String(input)
const money = input => typeof input === 'number' ? `${input.toLocaleString('vi-VN')} đ` : 'Chưa có'
function Source({ url }) {
  let safe = false
  try { const parsed = new URL(url); safe = ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password } catch { /* Không dựng link cho URL không hợp lệ. */ }
  return safe ? <a href={url} target="_blank" rel="noreferrer">Xem nguồn ↗</a> : <span>Chưa có nguồn hợp lệ</span>
}
function columns(section) {
  const university = ['Trường', row => <><strong>{row.universityName}</strong><small>{row.universitySlug}</small></>]
  return {
    universities: [['Tên trường', r => <><strong>{r.name}</strong><small>{r.shortName}</small></>], ['Loại hình', r => INSTITUTION_TYPE_LABEL[r.institutionType] || value(r.institutionType)], ['Địa chỉ', r => value(r.address?.full || r.address?.district)], ['Hồ sơ', r => <Link to={`/truong/${r.slug}`}>Xem chi tiết ↗</Link>]],
    majors: [['Mã ngành', r => r.code], ['Tên ngành', r => r.name], ['Nhóm ngành', r => value(r.fieldGroup)]],
    tuition: [university, ['Chương trình / phạm vi', r => <><strong>{value(r.program)}</strong><small>{r.note}</small></>], ['Năm học / ngành', r => <>{r.academicYear}<small>{r.majorCode || 'Theo phạm vi chương trình'}</small></>], ['Học phí', r => <>{money(r.amountMin)}{r.amountMax !== undefined && r.amountMax !== r.amountMin ? ` – ${money(r.amountMax)}` : ''}<small>/{labels[r.unit] || value(r.unit)}</small></>], ['Nguồn', r => <Source url={r.sourceUrl} />]],
    admissions: [university, ['Ngành / chương trình', r => <><strong>{r.majorCode}</strong><small>{r.program}</small><small>{r.combinations?.join(', ')}</small></>], ['Phương thức', r => r.universitySlug === 'bach-khoa-tphcm' && r.method === 'other' && r.scale === 100 ? 'Xét tuyển tổng hợp HCMUT' : labels[r.method] || value(r.method)], ['Điểm / thang', r => <><strong>{r.score} / {r.scale}</strong><small>Năm {r.year}</small></>], ['Nguồn', r => <Source url={r.sourceUrl} />]],
    users: [['Họ tên', r => r.fullName], ['Email', r => r.email], ['Vai trò', r => r.role === 'admin' ? 'Admin' : r.role === 'user' ? 'User' : value(r.role)], ['Ngày tạo', r => r.createdAt && Number.isFinite(Date.parse(r.createdAt)) ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Chưa có']],
    'ai-data': [['Trường / nguồn', r => <><strong>{r.slug}</strong><small>{r.domains.join(', ')}</small></>], ['Nguồn điểm tham chiếu', r => r.admission ? <><Source url={r.admission.url} /><small>{r.admission.year} · {r.admission.methods.map(m => labels[m] || m).join(', ')}</small></> : 'Chưa cấu hình'], ['Mã ngành còn bất định', r => r.uncertainMajors.join(', ') || 'Không liệt kê trong cấu hình']],
  }[section] || []
}
function AdminPage({ section }) {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [attempt, setAttempt] = useState(0)
  const [resource, setResource] = useState({ status: 'loading' })
  const key = JSON.stringify([section, search, page, attempt])
  useEffect(() => {
    const controller = new AbortController()
    getAdminData(section, { q: search, page, limit: 15 }, controller.signal).then(data => {
      if (!controller.signal.aborted) setResource({ key, status: 'ready', data })
    }).catch(error => {
      if (!controller.signal.aborted) setResource({ key, status: 'error', message: getErrorMessage(error), forbidden: [401, 403].includes(error.response?.status) })
    })
    return () => controller.abort()
  }, [section, search, page, attempt, key])
  const status = resource.key === key ? resource.status : 'loading'
  const data = resource.data
  const cols = columns(section)
  return <>
    <div className="ad-content-heading"><div><p>KHÔNG GIAN QUẢN TRỊ</p><h1>{menus.find(m => m[0] === section)?.[1]}</h1><span>Dữ liệu hệ thống · Chế độ chỉ đọc</span></div><span className="ad-readonly"><ShieldCheck size={15} aria-hidden="true" />Chỉ xem dữ liệu</span></div>
    {section !== 'overview' && <form className="ad-search" onSubmit={e => { e.preventDefault(); setSearch(query.trim()); setPage(1) }} role="search"><label htmlFor="ad-query"><Search size={18} aria-hidden="true" /><span className="ad-sr-only">Tìm trong mục hiện tại</span></label><input id="ad-query" maxLength={100} value={query} onChange={e => setQuery(e.target.value)} placeholder={section === 'users' ? 'Tìm theo tên hoặc email…' : 'Tìm theo tên, mã hoặc chương trình…'} /><button type="submit">Tìm kiếm</button></form>}
    {status === 'loading' ? <div className="ad-loading" role="status"><span /><span /><span /><p>Đang tải dữ liệu quản trị…</p></div> : status === 'error' ? <div className="ad-state" role="alert"><ShieldCheck size={30} aria-hidden="true" /><h2>{resource.forbidden ? 'Không có quyền truy cập' : 'Chưa tải được dữ liệu'}</h2><p>{resource.message}</p>{resource.forbidden ? <Link to="/login">Đăng nhập lại</Link> : <button onClick={() => setAttempt(a => a + 1)}>Thử lại</button>}</div> : section === 'overview' ? <>
      <div className="ad-stats">{[['universities', 'Trường đại học', Building2], ['majors', 'Ngành trong danh mục', GraduationCap], ['users', 'Tài khoản', Users], ['tuition', 'Bản ghi học phí', Wallet], ['admissions', 'Bản ghi điểm chuẩn', BookOpen]].map(([key, label, Icon]) => <article key={key}><span className="ad-stat-icon"><Icon size={22} aria-hidden="true" /></span><p>{label}</p><strong>{typeof data[key] === 'number' ? data[key].toLocaleString('vi-VN') : 'Chưa có dữ liệu'}</strong></article>)}</div>
      <section className="ad-overview-note"><h2>Quản trị dữ liệu UniMatch HCMC</h2><p>Các thống kê được truy vấn từ MongoDB. Số ngành là số document trong danh mục ngành chung, không phải tổng số ngành của tất cả trường.</p><p>Học phí và điểm chuẩn được giữ nguyên năm, đơn vị, chương trình và nguồn tham chiếu. Có dữ liệu trong database không đồng nghĩa dữ liệu đã được xác minh để AI sử dụng.</p><Link to="/admin/universities">Xem danh sách trường <ChevronRight size={15} aria-hidden="true" /></Link></section>
    </> : <section className="ad-data-card">
      <div className="ad-table-heading"><h2>Danh sách dữ liệu</h2><span>{data.total.toLocaleString('vi-VN')} bản ghi</span></div>
      {section === 'ai-data' && <p className="ad-provenance">{data.provenance} Năm tham chiếu cấu hình: {data.academicYear}.</p>}
      {['tuition', 'admissions'].includes(section) && <p className="ad-provenance">Dữ liệu gốc để rà soát. Giữ nguyên phạm vi chương trình, năm và nguồn; không tự xác nhận ánh xạ mã ngành hoặc quy đổi thang điểm.</p>}
      {!data.items.length ? <div className="ad-state"><Database size={30} aria-hidden="true" /><h2>Chưa có kết quả</h2><p>{search ? 'Thử từ khóa khác để tìm dữ liệu.' : 'Chưa có dữ liệu trong mục này.'}</p></div> : <div className="ad-table-scroll" tabIndex={0} role="region" aria-label="Bảng dữ liệu quản trị"><table><thead><tr>{cols.map(([label]) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{data.items.map((row, i) => <tr key={row._id || row.slug || i}>{cols.map(([label, render]) => <td key={label}>{render(row)}</td>)}</tr>)}</tbody></table></div>}
      <div className="ad-pagination"><span>Trang {page} / {Math.max(1, data.totalPages)}</span><div><button aria-label="Trang trước" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} aria-hidden="true" /></button><button aria-label="Trang sau" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} aria-hidden="true" /></button></div></div>
    </section>}
  </>
}
export default function Admin() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const section = location.pathname.replace(/^\/admin\/?/, '').replace(/\/$/, '') || 'overview'
  return <div className="admin-dashboard"><aside className="ad-sidebar"><Link to="/admin" className="ad-brand"><GraduationCap size={28} aria-hidden="true" /><span>UniMatch HCMC<small>TRANG QUẢN TRỊ</small></span></Link><nav aria-label="Điều hướng quản trị">{menus.map(([key, label, Icon]) => <NavLink key={key} end to={key === 'overview' ? '/admin' : `/admin/${key}`}><Icon size={19} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav><Link className="ad-back" to="/profile"><ArrowLeft size={17} aria-hidden="true" />Về trang cá nhân</Link></aside><div className="ad-body"><header className="ad-header"><span><ShieldCheck size={18} aria-hidden="true" />Khu vực dành cho Admin</span><div><span className="ad-account"><strong>{user?.fullName}</strong><small>{user?.email}</small></span><button onClick={() => { logout(); navigate('/login', { replace: true }) }}><LogOut size={17} aria-hidden="true" /><span>Đăng xuất</span></button></div></header><main className="ad-main">{menus.some(m => m[0] === section) ? <AdminPage key={section} section={section} /> : <div className="ad-state"><h1>Không tìm thấy mục quản trị</h1><Link to="/admin">Về tổng quan</Link></div>}</main></div></div>
}
