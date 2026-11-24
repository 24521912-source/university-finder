import { useCallback, useEffect, useState } from 'react'

// Lưu lựa chọn sáng/tối trong localStorage. Lần đầu vào trang, index.html đã đặt sẵn
// data-theme theo lựa chọn cũ (hoặc theo cài đặt của máy) để không bị nháy màu.
export const THEME_STORAGE_KEY = 'unimatch-theme'

function readTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Trình duyệt chặn localStorage (chế độ ẩn danh): vẫn đổi được, chỉ không nhớ
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    const root = document.documentElement
    root.classList.add('theme-switching')
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
    window.setTimeout(() => root.classList.remove('theme-switching'), 400)
  }, [])

  return { theme, toggleTheme }
}
