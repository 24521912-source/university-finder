import { useEffect, useState } from 'react'

// Trả về value sau khi value ngừng thay đổi `delay` ms.
// Dùng cho ô tìm kiếm: gõ liên tục không gọi API mỗi phím, chỉ gọi khi người dùng dừng gõ.
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
