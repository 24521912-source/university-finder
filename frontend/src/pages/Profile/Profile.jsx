import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Building2, ChevronRight, Compass, Heart, Info, LockKeyhole, Mail, MapPin, Pencil, RefreshCw, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import api, { getErrorMessage } from '../../services/api'
import { INSTITUTION_TYPE_LABEL } from '../../utils/format'
import { ChangePasswordForm, EditProfileForm } from './ProfileForms'
import './Profile.css'

const tabs = [{ key: 'info', label: 'Thông tin cá nhân', icon: UserRound }, { key: 'favorites', label: 'Trường yêu thích', icon: Heart }]
const favoriteIds = user => [...new Set((Array.isArray(user?.favorites) ? user.favorites : []).map(item => typeof item === 'string' ? item : item?._id).filter(id => typeof id === 'string' && id))]
const roleLabel = role => ({ user: 'Thành viên', admin: 'Quản trị viên' })[role] || 'Chưa có thông tin'

function SchoolCard({ school }) {
  const [failedLogo, setFailedLogo] = useState(null)
  const logo = typeof school.logoUrl === 'string' && /^https?:\/\//i.test(school.logoUrl) ? school.logoUrl : null
  return <article className="up-school">
    <div className="up-school-heading"><div className="up-school-logo">{logo && failedLogo !== logo ? <img src={logo} alt="" loading="lazy" onError={() => setFailedLogo(logo)} /> : <Building2 aria-hidden="true" />}</div><span className="up-saved"><Heart size={14} aria-hidden="true" />Đã yêu thích</span></div>
    <span className="up-type">{INSTITUTION_TYPE_LABEL[school.institutionType] || 'Chưa rõ loại hình'}</span>
    <h3>{school.name || 'Chưa có tên trường'}</h3>
    {school.shortName && <p className="up-school-short">{school.shortName}</p>}
    <p className="up-school-address"><MapPin size={16} aria-hidden="true" />{school.district || 'Chưa có thông tin địa chỉ'}</p>
    {school.slug ? <Link className="up-button up-button-outline" to={`/truong/${encodeURIComponent(school.slug)}`}>Xem chi tiết <ArrowRight size={16} aria-hidden="true" /></Link> : <p className="up-muted">Chưa có đường dẫn chi tiết.</p>}
  </article>
}

function Profile() {
  const { user, setUser } = useAuth()
  const [activeTab, setActiveTab] = useState('info')
  const [refresh, setRefresh] = useState(0)
  const [profileState, setProfileState] = useState({ status: 'loading' })
  const [schoolsState, setSchoolsState] = useState({ key: null, status: 'loading', schools: [] })
  const [schoolAttempt, setSchoolAttempt] = useState(0)
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const tabId = useId()
  const idsKey = JSON.stringify(favoriteIds(user))
  const ids = JSON.parse(idsKey)
  const accountId = user?.id

  useEffect(() => {
    const controller = new AbortController()
    api.get('/auth/me', { signal: controller.signal }).then(({ data }) => {
      if (!data.user || data.user.id !== accountId) throw new Error('Thông tin tài khoản trả về không hợp lệ.')
      if (!controller.signal.aborted) {
        setUser(data.user)
        setProfileState({ status: 'ready', refreshed: refresh > 0 })
      }
    }).catch(error => {
      if (!controller.signal.aborted) setProfileState({ status: 'error', message: error.response || error.request ? getErrorMessage(error) : error.message })
    })
    return () => controller.abort()
  }, [accountId, refresh, setUser])

  useEffect(() => {
    const requestedIds = JSON.parse(idsKey)
    if (!requestedIds.length) return
    const controller = new AbortController()
    api.get('/universities', { signal: controller.signal }).then(({ data }) => {
      if (!Array.isArray(data)) throw new Error('Danh sách trường trả về không hợp lệ.')
      if (!controller.signal.aborted) setSchoolsState({ key: idsKey, attempt: schoolAttempt, status: 'ready', schools: data.filter(school => school && requestedIds.includes(school._id)) })
    }).catch(error => {
      if (!controller.signal.aborted) setSchoolsState({ key: idsKey, attempt: schoolAttempt, status: 'error', schools: [], message: error.response || error.request ? getErrorMessage(error) : error.message })
    })
    return () => controller.abort()
  }, [idsKey, schoolAttempt])

  function refreshProfile() {
    setProfileState({ status: 'loading' })
    setRefresh(value => value + 1)
  }
  function onTabKey(event, index) {
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : null
    if (next === null) return
    event.preventDefault()
    setActiveTab(tabs[next].key)
    document.getElementById(`${tabId}-${tabs[next].key}`)?.focus()
  }

  const name = user?.fullName?.trim() || 'Chưa có tên'
  const initials = user?.fullName?.trim().split(/\s+/).filter(Boolean).slice(-2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase('vi-VN') || '?'
  const schoolsLoading = ids.length > 0 && (schoolsState.key !== idsKey || schoolsState.attempt !== schoolAttempt || schoolsState.status === 'loading')
  const schoolsError = ids.length > 0 && !schoolsLoading && schoolsState.status === 'error'
  const schools = ids.length ? schoolsState.schools : []

  return <div className="user-profile"><div className="up-shell">
    <nav className="up-breadcrumb" aria-label="Đường dẫn"><Link to="/">Trang chủ</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">Cá nhân</span></nav>
    <div className="up-page-heading"><div><p className="up-eyebrow">KHÔNG GIAN CỦA BẠN</p><h1>Hồ sơ cá nhân</h1><p>Thông tin của bạn, hành trình đại học của bạn.</p></div><span className="up-platform"><ShieldCheck size={17} aria-hidden="true" />Tài khoản UniMatch</span></div>

    <section className="up-profile-card" aria-label="Hồ sơ tài khoản">
      <div className="up-banner"><span><BookOpen size={18} aria-hidden="true" />Cùng bạn chọn trường, định hướng tương lai.</span></div>
      <div className="up-identity"><div className="up-avatar" aria-label={`Ảnh đại diện bằng chữ cái tên ${name}`}>{initials}</div><div className="up-identity-text"><span className="up-role"><ShieldCheck size={13} aria-hidden="true" />{roleLabel(user?.role)}</span><h2>{name}</h2><p><Mail size={16} aria-hidden="true" />{user?.email || 'Chưa có email'}</p></div><div className="up-edit">{!editing && <button className="up-button up-button-outline" onClick={() => { setNotice(''); setEditing(true) }}><Pencil size={16} aria-hidden="true" />Chỉnh sửa hồ sơ</button>}</div></div>
      {editing && <div className="up-edit-panel"><EditProfileForm user={user} onCancel={() => setEditing(false)} onSaved={(updated) => { setUser(updated); setEditing(false); setNotice('Đã cập nhật họ tên.') }} /></div>}
      {notice && <p className="up-notice up-success" role="status">{notice}</p>}
    </section>

    <div className="up-summary"><section className="up-stat" aria-label="Thống kê yêu thích"><span className="up-icon up-icon-heart"><Heart aria-hidden="true" /></span><div><p>Trường đã yêu thích</p><strong>{profileState.status === 'loading' ? <span className="up-count-loading" aria-label="Đang tải số lượng">—</span> : ids.length.toLocaleString('vi-VN')}</strong><small>{profileState.status === 'error' ? 'Theo phiên đăng nhập gần nhất' : 'Được lưu trong tài khoản của bạn'}</small></div><button aria-label="Xem trường yêu thích" className="up-icon-button" onClick={() => setActiveTab('favorites')}><ArrowRight size={20} aria-hidden="true" /></button></section><aside className="up-discover"><span className="up-icon"><Compass aria-hidden="true" /></span><div><h2>Tìm ngôi trường phù hợp</h2><p>Khám phá thêm lựa chọn cho hành trình sắp tới.</p></div><Link className="up-button up-button-primary" to="/truong">Khám phá trường <ArrowRight size={16} aria-hidden="true" /></Link></aside></div>

    <section className="up-workspace" aria-label="Chi tiết tài khoản">
      <div className="up-tabs" role="tablist" aria-label="Nội dung hồ sơ">{tabs.map(({ key, label, icon: Icon }, index) => <button key={key} id={`${tabId}-${key}`} role="tab" aria-selected={activeTab === key} aria-controls={`${tabId}-${key}-panel`} tabIndex={activeTab === key ? 0 : -1} onClick={() => setActiveTab(key)} onKeyDown={event => onTabKey(event, index)}><Icon size={18} aria-hidden="true" />{label}{key === 'favorites' && profileState.status !== 'loading' && <span className="up-tab-count">{ids.length}</span>}</button>)}</div>
      {profileState.status === 'error' && <div className="up-notice up-error" role="alert"><Info size={18} aria-hidden="true" /><div><strong>Chưa thể làm mới hồ sơ</strong><p>{profileState.message} Thông tin đang hiển thị là từ phiên đăng nhập gần nhất.</p></div><button className="up-button up-button-outline" onClick={refreshProfile}>Thử lại</button></div>}
      {profileState.refreshed && <p className="up-refresh-status" role="status">Đã tải lại thông tin tài khoản từ máy chủ.</p>}
      <div id={`${tabId}-info-panel`} role="tabpanel" aria-labelledby={`${tabId}-info`} hidden={activeTab !== 'info'} tabIndex={0}>
        <div className="up-panel-heading"><div><h2>Thông tin cá nhân</h2><p>Thông tin gắn với tài khoản đăng nhập của bạn.</p></div><button className="up-button up-refresh" onClick={refreshProfile} disabled={profileState.status === 'loading'}><RefreshCw size={16} aria-hidden="true" />{profileState.status === 'loading' ? 'Đang tải…' : 'Tải lại'}</button></div>
        {profileState.status === 'loading' ? <div className="up-skeleton-grid" role="status" aria-label="Đang tải thông tin tài khoản"><span /><span /><span /></div> : <dl className="up-fields"><div><dt><UserRound size={16} aria-hidden="true" />Họ và tên</dt><dd>{name}</dd></div><div><dt><Mail size={16} aria-hidden="true" />Địa chỉ email</dt><dd>{user?.email || 'Chưa có email'}</dd></div><div><dt><ShieldCheck size={16} aria-hidden="true" />Vai trò tài khoản</dt><dd><span className="up-role">{roleLabel(user?.role)}</span></dd></div></dl>}
        <div className="up-security"><span className="up-icon"><LockKeyhole aria-hidden="true" /></span><div><h3>Bảo mật tài khoản</h3><p>Đổi mật khẩu đăng nhập. Cần nhập mật khẩu hiện tại để xác nhận.</p></div>{!changingPassword && <button className="up-button up-button-outline" onClick={() => { setNotice(''); setChangingPassword(true) }}>Đổi mật khẩu</button>}</div>
        {changingPassword && <div className="up-edit-panel"><ChangePasswordForm onCancel={() => setChangingPassword(false)} onDone={() => { setChangingPassword(false); setNotice('Đã đổi mật khẩu. Lần đăng nhập sau dùng mật khẩu mới.') }} /></div>}
      </div>
      <div id={`${tabId}-favorites-panel`} role="tabpanel" aria-labelledby={`${tabId}-favorites`} hidden={activeTab !== 'favorites'} tabIndex={0}>
        <div className="up-panel-heading"><div><h2>Trường yêu thích</h2><p>Những ngôi trường bạn muốn tìm hiểu thêm.</p></div>{ids.length > 0 && <span className="up-type">{ids.length} trường đã lưu</span>}</div>
        {profileState.status === 'loading' || schoolsLoading ? <div className="up-school-grid up-school-skeleton" role="status" aria-label="Đang tải trường yêu thích"><span /><span /><span /></div> : schoolsError ? <div className="up-empty" role="alert"><Info size={32} aria-hidden="true" /><h3>Chưa tải được trường yêu thích</h3><p>{schoolsState.message}</p><button className="up-button up-button-primary" onClick={() => setSchoolAttempt(value => value + 1)}>Thử lại</button></div> : !ids.length ? <div className="up-empty"><span className="up-empty-icon"><Heart size={30} aria-hidden="true" /></span><h3>Danh sách yêu thích còn trống</h3><p>Khám phá các trường đại học và tìm những lựa chọn phù hợp với bạn.</p><Link className="up-button up-button-primary" to="/truong">Khám phá trường <ArrowRight size={16} aria-hidden="true" /></Link></div> : <><div className="up-school-grid">{schools.map(school => <SchoolCard key={school._id} school={school} />)}</div>{schools.length < ids.length && <p className="up-notice" role="status"><Info size={18} aria-hidden="true" />{ids.length - schools.length} trường đã lưu hiện không có trong danh sách công khai. Số lượng đã lưu được giữ nguyên theo tài khoản.</p>}<p className="up-favorites-note"><Info size={15} aria-hidden="true" />Hiện chưa hỗ trợ thêm hoặc bỏ yêu thích trên website.</p></>}
      </div>
    </section>
    <p className="up-footer-note"><ShieldCheck size={15} aria-hidden="true" />Không gian cá nhân dành riêng cho tài khoản của bạn.</p>
  </div></div>
}

export default Profile
