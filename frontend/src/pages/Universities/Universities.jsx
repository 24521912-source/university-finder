import { useSearchParams } from 'react-router-dom'
import UniversityCard from '../../components/UniversityCard'
import { useFavorites } from '../../features/favorites/useFavorites'
import { useCompareList } from '../../features/compare/useCompareList'
import { useApiData } from '../../hooks/useApiData'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { getFilterOptions, searchUniversities } from '../../services/universities'
import { hasActiveFilter, paginate, readFilters, readPage, toApiParams, URL_KEYS } from './universitySearch'
import UniversityFilters from './UniversityFilters'
import Pagination from './Pagination'
import CompareBar from './CompareBar'
import './Universities.css'

// Đổi giá trị bộ lọc thành chuỗi trên URL. Giá trị "trống" thì xóa khỏi URL cho gọn.
function toUrlValue(value) {
  if (value === true) return '1'
  if (value === false || value === '' || value === null || value === 'all') return null
  return String(value)
}

function Universities() {
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params) // bộ lọc lưu trên URL: giữ được khi quay lại / chia sẻ link
  const page = readPage(params)

  // Ô tìm kiếm chờ người dùng dừng gõ 300ms mới gọi API.
  const debouncedQuery = useDebouncedValue(filters.q, 300)
  const apiParams = toApiParams({ ...filters, q: debouncedQuery })
  const search = useApiData(new URLSearchParams(apiParams).toString(), (signal) => searchUniversities(apiParams, signal))
  const options = useApiData('filter-options', getFilterOptions)

  const { isFavorite, toggle: toggleFavorite, countOf, error: favoriteError } = useFavorites()
  const compare = useCompareList()

  // changes: { <field bộ lọc>: giá trị }. Đổi bộ lọc thì quay về trang 1.
  function updateFilters(changes, { resetPage = true } = {}) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      for (const [field, value] of Object.entries(changes)) {
        const urlValue = toUrlValue(value)
        if (urlValue === null) next.delete(URL_KEYS[field])
        else next.set(URL_KEYS[field], urlValue)
      }
      if (resetPage) next.delete(URL_KEYS.page)
      return next
    }, { replace: true })
  }

  function goToPage(nextPage) {
    updateFilters({ page: nextPage === 1 ? '' : nextPage }, { resetPage: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetFilters = () => setParams({}, { replace: true })

  const universities = search.data?.items ?? []
  const { items, totalPages, current } = paginate(universities, page)
  const filtering = hasActiveFilter(filters)

  return (
    <div className="container uni-page">
      <h1 className="page-title">Danh sách trường đại học TP.HCM</h1>
      <p className="page-subtitle">Tìm trường theo ngành, học phí, khu vực và loại trường. Chọn 2–3 trường để so sánh.</p>

      <UniversityFilters
        filters={filters}
        options={options.data}
        onChange={updateFilters}
        onReset={resetFilters}
        canReset={filtering}
      />

      {options.error && <div className="alert-error" role="alert">Không tải được danh sách ngành / khu vực: {options.error}</div>}
      {search.error && (
        <div className="alert-error" role="alert">
          {search.error} <button type="button" className="btn btn-outline" onClick={search.retry}>Thử lại</button>
        </div>
      )}
      {favoriteError && <div className="alert-error" role="alert">{favoriteError}</div>}

      {search.loading && !search.data ? (
        <p className="muted" role="status">Đang tải danh sách trường…</p>
      ) : search.data && (
        <div aria-busy={search.loading}>
          <p className="muted" aria-live="polite">
            {filtering ? `Tìm thấy ${search.data.total} trường` : `${search.data.total} trường`}
            {totalPages > 1 && ` · Trang ${current}/${totalPages}`}
            {search.loading && ' · Đang cập nhật…'}
          </p>

          {universities.length === 0 ? (
            <div className="uni-empty">
              <p>Không tìm thấy trường phù hợp với bộ lọc.</p>
              <button type="button" className="btn btn-outline" onClick={resetFilters}>Xóa bộ lọc</button>
            </div>
          ) : (
            <div className="card-grid">
              {items.map((university) => (
                <UniversityCard
                  key={university._id}
                  university={{ ...university, favoriteCount: countOf(university) }}
                  isFavorite={isFavorite(university)}
                  onToggleFavorite={toggleFavorite}
                  isCompared={compare.isSelected(university)}
                  compareDisabled={compare.isFull}
                  onToggleCompare={compare.toggle}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && <Pagination current={current} total={totalPages} onChange={goToPage} />}
        </div>
      )}

      <CompareBar compare={compare} />
    </div>
  )
}

export default Universities
