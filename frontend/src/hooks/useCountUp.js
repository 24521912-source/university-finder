import { useEffect, useRef, useState } from 'react'

// Đếm từ 0 lên `target` khi phần tử xuất hiện trên màn hình.
// Người dùng bật "giảm chuyển động" trong hệ điều hành thì hiện số luôn.
export function useCountUp(target, duration = 1200) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  const [skip] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window))

  useEffect(() => {
    const node = ref.current
    if (!node || skip) return

    let frame
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()

      const start = performance.now()
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - (1 - progress) ** 3 // chậm dần về cuối
        setValue(Math.round(target * eased))
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    })

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [target, duration, skip])

  return [ref, skip ? target : value]
}
