import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { compareUrl, MAX_COMPARE, MIN_COMPARE } from '../../features/compare/useCompareList'

// Thanh dính dưới màn hình: các trường đã chọn so sánh + nút "So sánh ngay".
// compare: giá trị trả về của useCompareList()
function CompareBar({ compare }) {
  const { items, remove, clear } = compare
  if (items.length === 0) return null

  const ready = items.length >= MIN_COMPARE

  return (
    <aside className="compare-bar" aria-label="Trường đã chọn để so sánh">
      <div className="container compare-bar-inner">
        <p className="compare-bar-title">So sánh ({items.length}/{MAX_COMPARE})</p>

        <ul className="compare-bar-list">
          {items.map((item) => (
            <li key={item.slug} className="compare-bar-item">
              <span>{item.shortName || item.name}</span>
              <button type="button" onClick={() => remove(item.slug)} aria-label={`Bỏ ${item.name} khỏi so sánh`}>×</button>
            </li>
          ))}
        </ul>

        <div className="compare-bar-actions">
          <button type="button" className="btn btn-outline" onClick={clear}>Xóa hết</button>
          {ready ? (
            <Link className="btn btn-primary" to={compareUrl(items.map((item) => item.slug))}>So sánh ngay<ArrowRight size={16} aria-hidden="true" /></Link>
          ) : (
            <button type="button" className="btn btn-primary" disabled>Chọn thêm {MIN_COMPARE - items.length} trường</button>
          )}
        </div>
      </div>
    </aside>
  )
}

export default CompareBar
