import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
    >
      {/* Hai icon chồng lên nhau, xoay qua lại khi đổi */}
      <Sun className="theme-icon theme-icon-sun" size={18} aria-hidden="true" />
      <Moon className="theme-icon theme-icon-moon" size={18} aria-hidden="true" />
    </button>
  )
}

export default ThemeToggle
