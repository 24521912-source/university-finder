import './Sticker.css'

// Sticker vẽ tay bằng SVG (khung 64x64), viền trắng + bóng đổ tạo trong Sticker.css.
// Màu cố định để sticker vẫn tươi trên cả nền sáng lẫn nền tối.
const INK = '#1f2a44'

const SHAPES = {
  cap: (
    <>
      <path d="M16 30v12c0 4 7.2 8 16 8s16-4 16-8V30l-16 6z" fill="#2f5bc4" />
      <path d="M32 12l28 12-28 12L4 24z" fill="#1e3a8a" />
      <path d="M32 24l18 5v12" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
      <circle cx="50" cy="44" r="3.5" fill="#fbbf24" />
    </>
  ),
  book: (
    <>
      <path d="M5 18v32c9-2 19-1 27 3 8-4 18-5 27-3V18" fill="#f97362" />
      <path d="M32 19c-6-4-16-5-24-3v31c8-2 18-1 24 3z" fill="#fff" />
      <path d="M32 19c6-4 16-5 24-3v31c-8-2-18-1-24 3z" fill="#fff" />
      <path d="M14 24c4-1 8-1 12 1M14 31c4-1 8-1 12 1M38 25c4-2 8-2 12-1M38 32c4-2 8-2 12-1" fill="none" stroke="#93c5fd" />
    </>
  ),
  pencil: (
    <g transform="rotate(-35 32 32)">
      <rect x="4" y="27" width="9" height="10" rx="2.5" fill="#f472b6" />
      <rect x="12" y="27" width="5" height="10" fill="#cbd5e1" />
      <rect x="17" y="27" width="28" height="10" fill="#fbbf24" />
      <path d="M45 27l13 5-13 5z" fill="#fde7c4" />
      <path d="M54 30.5l4 1.5-4 1.5z" fill={INK} />
    </g>
  ),
  bulb: (
    <>
      <path d="M32 12a14 14 0 0 0-8 25.5c1.5 1.1 2 2.6 2 4.5v1h12v-1c0-1.9.5-3.4 2-4.5A14 14 0 0 0 32 12z" fill="#fde047" />
      <rect x="26" y="43" width="12" height="8" rx="2.5" fill="#94a3b8" />
      <path d="M28 24c1-3 3-4 6-4" fill="none" stroke="#fff" strokeWidth="2.5" />
      <path d="M32 3v4M12 13l3 3M52 13l-3 3M5 30h4M55 30h4" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
    </>
  ),
  sparkle: (
    <path d="M32 6c2 13 6 17 20 20-14 3-18 7-20 20-2-13-6-17-20-20 14-3 18-7 20-20z" fill="#fbbf24" />
  ),
  plane: (
    <>
      <path d="M6 30L58 10 44 52 31 39z" fill="#fff" />
      <path d="M31 39L58 10 27 49z" fill="#93c5fd" />
    </>
  ),
  pin: (
    <>
      <path d="M32 6c-10 0-18 7.6-18 17.5C14 37 32 58 32 58s18-21 18-34.5C50 13.6 42 6 32 6z" fill="#f97362" />
      <circle cx="32" cy="23" r="7" fill="#fff" />
    </>
  ),
  heart: (
    <path d="M32 54S8 40 8 23c0-7 5.5-12 12-12 5 0 9 3 12 7 3-4 7-7 12-7 6.5 0 12 5 12 12 0 17-24 31-24 31z" fill="#fb7185" />
  ),
}

function Sticker({ name, className = '', size = 56, tilt = 0, delay = 0, style }) {
  return (
    <svg
      className={`sticker${className ? ` ${className}` : ''}`}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ '--tilt': `${tilt}deg`, '--float-delay': `${delay}s`, ...style }}
      stroke={INK}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {SHAPES[name]}
    </svg>
  )
}

export default Sticker
