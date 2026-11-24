import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Pause, Play } from 'lucide-react'
import { CAMPUS_PHOTOS } from '../data/campusPhotos'
import './CampusSlider.css'

const SLIDE_MS = 5500
const SWIPE_MIN_PX = 40

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Ảnh khuôn viên các trường chạy lần lượt: mờ dần sang ảnh sau + phóng to chậm.
// Dừng khi rê chuột / focus vào, khi tab bị ẩn, hoặc khi người dùng bấm nút tạm dừng.
function CampusSlider({ photos = CAMPUS_PHOTOS }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const [hovering, setHovering] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)
  const touchStartX = useRef(null)

  const count = photos.length
  const goTo = (next) => setIndex((next + count) % count)
  const running = playing && !hovering && !tabHidden

  useEffect(() => {
    if (!running || count < 2) return
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % count), SLIDE_MS)
    return () => window.clearTimeout(timer)
  }, [running, index, count])

  // Chuyển tab khác thì dừng, quay lại thì chạy tiếp
  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return
    const distance = event.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(distance) > SWIPE_MIN_PX) goTo(index + (distance < 0 ? 1 : -1))
    touchStartX.current = null
  }

  if (count === 0) return null
  const current = photos[index]

  return (
    <section
      className={`campus-slider${running ? ' is-running' : ''}`}
      aria-roledescription="carousel"
      aria-label="Ảnh khuôn viên các trường đại học"
      style={{ '--slide-ms': `${SLIDE_MS}ms` }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHovering(false)
      }}
      onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX }}
      onTouchEnd={handleTouchEnd}
    >
      <div className="campus-slides" aria-live={running ? 'off' : 'polite'}>
        {photos.map((photo, i) => (
          <figure
            key={photo.src}
            className={`campus-slide${i === index ? ' is-active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}: ${photo.school}`}
            aria-hidden={i !== index}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </figure>
        ))}
      </div>

      {/* key đổi theo ảnh để chú thích chạy lại hiệu ứng trồi lên */}
      <div className="campus-caption" key={current.src}>
        <p className="campus-school">{current.school}</p>
        <p className="campus-place"><MapPin size={14} aria-hidden="true" />{current.place}</p>
      </div>

      <p className="campus-credit">
        Ảnh: <a href={current.source} target="_blank" rel="noreferrer">{current.author}</a>, {current.license}
      </p>

      <div className="campus-controls">
        <button type="button" className="campus-btn" onClick={() => goTo(index - 1)} aria-label="Ảnh trước">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="campus-btn"
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? 'Tạm dừng trình chiếu' : 'Tiếp tục trình chiếu'}
        >
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        </button>
        <button type="button" className="campus-btn" onClick={() => goTo(index + 1)} aria-label="Ảnh sau">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="campus-dots">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            className={`campus-dot${i === index ? ' is-active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Xem ảnh ${i + 1}: ${photo.school}`}
            aria-current={i === index}
          >
            <span />
          </button>
        ))}
      </div>
    </section>
  )
}

export default CampusSlider
