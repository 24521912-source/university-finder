import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { formatTitle } from '../utils/pageTitle'

// Cho trang cần tiêu đề theo dữ liệu (vd. tên trường). MainLayout đặt tiêu đề theo đường dẫn
// trước (useLayoutEffect), hook này chạy sau nên ghi đè được; chạy lại cả khi đổi tab trong trang.
export default function useDocumentTitle(title) {
  const { pathname } = useLocation()
  useEffect(() => {
    if (title) document.title = formatTitle(title)
  }, [title, pathname])
}
