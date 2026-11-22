import logos from '../../data/universityLogos.json' with { type: 'json' }

// Thứ tự thử ảnh logo của một trường:
// 1. Logo đã tải sẵn trong frontend/public/logos (tools/logos/fetch-logos.mjs), ổn định, không phụ thuộc web của trường.
// 2. Link logo admin nhập trong database (media.logoUrl), chỉ nhận http(s).
// Hết nguồn hoặc ảnh lỗi thì giao diện hiện chữ viết tắt.
export function logoSources({ slug, logoUrl } = {}, manifest = logos) {
  const sources = []
  if (typeof slug === 'string' && Object.hasOwn(manifest, slug)) sources.push(manifest[slug])
  if (typeof logoUrl === 'string' && /^https?:\/\//i.test(logoUrl.trim())) sources.push(logoUrl.trim())
  return [...new Set(sources)]
}

// Chữ hiện thay logo: tên viết tắt (tối đa 5 ký tự) hoặc chữ cái đầu các từ trong tên trường (bỏ "Trường Đại học").
export function monogram({ shortName, name } = {}) {
  const short = typeof shortName === 'string' ? shortName.trim() : ''
  if (short && short.length <= 5) return short.toUpperCase()
  const words = String(name || '')
    .replace(/^(Trường\s+)?(Đại học|Học viện|Nhạc viện)\s+/i, '')
    .split(/[\s,–-]+/)
    .filter(Boolean)
  return (short.slice(0, 4) || words.map((w) => w[0]).join('').slice(0, 4) || '?').toUpperCase()
}
