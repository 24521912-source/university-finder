import { useState } from 'react'
import { logoSources, monogram } from '../features/universities/logo'
import './UniversityLogo.css'

// Logo trường trong ô vuông nền trắng: ảnh luôn thu vừa khung (không cắt). Ảnh lỗi thì thử nguồn kế tiếp, hết thì hiện chữ viết tắt.
// size: 'sm' (40px) | 'md' (52px, mặc định) | 'lg' (88px)
function UniversityLogo({ university, size = 'md', className = '' }) {
  const sources = logoSources(university)
  const [failed, setFailed] = useState(() => new Set())
  const src = sources.find((s) => !failed.has(s))
  const classes = `uni-logo uni-logo-${size} ${className}`.trim()

  if (!src) {
    const text = monogram(university)
    return <div className={`${classes} uni-logo-text`} data-length={text.length} aria-hidden="true">{text}</div>
  }
  return (
    <div className={classes}>
      <img
        src={src}
        alt={`Logo ${university?.shortName || university?.name || ''}`.trim()}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed((prev) => new Set(prev).add(src))}
      />
    </div>
  )
}

export default UniversityLogo
