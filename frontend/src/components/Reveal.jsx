import { useEffect, useRef, useState } from 'react'

// Bọc một khối để nó trồi lên nhẹ khi cuộn tới (CSS: .reveal trong index.css).
// delay (ms) dùng để các thẻ cạnh nhau hiện lần lượt thay vì cùng lúc.
function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null)
  // Trình duyệt cũ không có IntersectionObserver: hiện luôn
  const [visible, setVisible] = useState(() => !('IntersectionObserver' in window))

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setVisible(true)
      observer.disconnect() // chỉ chạy hiệu ứng một lần
    }, { rootMargin: '0px 0px -10% 0px' })

    observer.observe(node)
    return () => observer.disconnect()
  }, [visible])

  return (
    <Tag
      ref={ref}
      className={`reveal${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Reveal
