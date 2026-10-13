import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/truong', label: 'Trường' },
  { to: '/ai-tu-van', label: 'AI tư vấn' },
  { to: '/ca-nhan', label: 'Cá nhân' },
]

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = user?.role === 'admin' ? [...NAV_ITEMS, { to: '/admin', label: 'Quản trị' }] : NAV_ITEMS

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="brand">
          <span className="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true">
              <path d="M2 9l10-5 10 5-10 5-10-5z" />
              <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
            </svg>
          </span>
          UniMatch HCMC
        </Link>

        <nav className="main-nav" aria-label="Điều hướng chính">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="header-user">{user.fullName}</span>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/dang-nhap" className="btn btn-ghost">Đăng nhập</Link>
              <Link to="/dang-ky" className="btn btn-light">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
