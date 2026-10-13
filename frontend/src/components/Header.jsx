import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/truong', label: 'Trường' },
  { to: '/ai-tu-van', label: 'AI tư vấn' },
  { to: '/ca-nhan', label: 'Cá nhân' },
]
const ADMIN_ITEM = { to: '/admin', label: 'Quản trị' }

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = user?.role === 'admin' ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M2 9l10-5 10 5-10 5-10-5z" />
              <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
            </svg>
          </span>
          UniMatch HCMC
        </Link>

        <div id="main-menu" className="nav-panel">
          <nav aria-label="Điều hướng chính">
            <ul className="nav-list">
              {items.map((item) => (
                <li key={item.to}>
                  {/* NavLink tự thêm class "active" và aria-current="page" cho trang hiện tại */}
                  <NavLink to={item.to} end={item.end}>{item.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            {user ? (
              <>
                <span className="header-user">{user.fullName}</span>
                <button type="button" className="btn btn-ghost" onClick={handleLogout}>Đăng xuất</button>
              </>
            ) : (
              <>
                <Link to="/dang-nhap" className="btn btn-ghost">Đăng nhập</Link>
                <Link to="/dang-ky" className="btn btn-light">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
