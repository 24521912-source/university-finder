import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { isAdmin } from '../utils/roles'

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/truong', label: 'Trường' },
  { to: '/ai-tu-van', label: 'AI tư vấn' },
  { to: '/ban-do', label: 'Bản đồ' },
  { to: '/ca-nhan', label: 'Cá nhân' },
]
const ADMIN_ITEM = { to: '/admin', label: 'Quản trị' }

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = isAdmin(user) ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS
  const [menuOpen, setMenuOpen] = useState(false) // chỉ có tác dụng < 960px (CSS luôn hiện menu trên máy tính)
  const toggleRef = useRef(null)

  // Escape đóng menu và trả focus về nút menu (keydown + event.key)
  useEffect(() => {
    if (!menuOpen) return
    function handleKeyDown(event) {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  function handleLogout() {
    closeMenu()
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M2 9l10-5 10 5-10 5-10-5z" />
              <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
            </svg>
          </span>
          UniMatch HCMC
        </Link>

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <div id="main-menu" className={`nav-panel${menuOpen ? ' is-open' : ''}`}>
          <nav aria-label="Điều hướng chính">
            <ul className="nav-list">
              {items.map((item) => (
                <li key={item.to}>
                  {/* NavLink tự thêm class "active" và aria-current="page" cho trang hiện tại */}
                  <NavLink to={item.to} end={item.end} onClick={closeMenu}>{item.label}</NavLink>
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
                <Link to="/dang-nhap" className="btn btn-ghost" onClick={closeMenu}>Đăng nhập</Link>
                <Link to="/dang-ky" className="btn btn-light" onClick={closeMenu}>Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
