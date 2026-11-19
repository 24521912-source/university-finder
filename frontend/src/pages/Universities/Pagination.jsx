import { PAGE_SIZE } from './universitySearch'

// Danh sách số trang: trang đầu, trang cuối và 1 trang mỗi bên trang hiện tại; chỗ trống là "…".
// Ví dụ current = 5, total = 9 -> [1, '…', 4, 5, 6, '…', 9]
function pageNumbers(current, total) {
  const pages = []
  for (let page = 1; page <= total; page++) {
    const nearCurrent = Math.abs(page - current) <= 1
    if (page === 1 || page === total || nearCurrent) pages.push(page)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }
  return pages
}

function Pagination({ current, total, onChange }) {
  return (
    <nav className="uni-pagination" aria-label={`Phân trang, ${PAGE_SIZE} trường mỗi trang`}>
      <button type="button" disabled={current === 1} onClick={() => onChange(current - 1)} aria-label="Trang trước">‹</button>
      {pageNumbers(current, total).map((page, index) =>
        page === '…' ? (
          <span key={`gap-${index}`} className="uni-page-gap" aria-hidden="true">…</span>
        ) : (
          <button
            key={page} type="button"
            className={page === current ? 'selected' : ''}
            aria-current={page === current ? 'page' : undefined}
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        ),
      )}
      <button type="button" disabled={current === total} onClick={() => onChange(current + 1)} aria-label="Trang sau">›</button>
    </nav>
  )
}

export default Pagination
