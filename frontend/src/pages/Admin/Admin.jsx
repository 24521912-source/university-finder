import { useState } from 'react'
import { useAuth } from '../../features/auth/AuthContext'
import { ROLE_LABEL } from '../../utils/roles'
import DashboardAdmin from './DashboardAdmin'
import UniversitiesAdmin from './UniversitiesAdmin'
import AccountsAdmin from './AccountsAdmin'
import HistoryAdmin from './HistoryAdmin'
import './Admin.css'

const TABS = [
  { key: 'dashboard', label: 'Tổng quan', Component: DashboardAdmin },
  { key: 'universities', label: 'Dữ liệu trường', Component: UniversitiesAdmin },
  { key: 'accounts', label: 'Tài khoản', Component: AccountsAdmin },
  { key: 'history', label: 'Lịch sử', Component: HistoryAdmin },
]

// Trang quản trị: chia tab. Quyền chi tiết của từng thao tác do backend kiểm tra.
function Admin() {
  const { user } = useAuth()
  const [tab, setTab] = useState('dashboard')
  const Active = TABS.find((t) => t.key === tab).Component

  return (
    <div className="container admin-page">
      <h1 className="page-title">Quản trị</h1>
      <p className="muted">Bạn đang đăng nhập với vai trò <strong>{ROLE_LABEL[user?.role] || user?.role}</strong>
        {user?.role === 'admin' && user?.canManageAdmins ? ' (được quản lý quản trị viên)' : ''}.</p>
      <div className="admin-tabs" role="tablist" aria-label="Mục quản trị">
        {TABS.map((t) => <button key={t.key} type="button" role="tab" aria-selected={tab === t.key}
          className={tab === t.key ? 'is-active' : ''} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>
      <div role="tabpanel"><Active goTo={setTab} /></div>
    </div>
  )
}

export default Admin
