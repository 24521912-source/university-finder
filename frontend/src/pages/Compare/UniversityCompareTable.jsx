import { Link, useNavigate } from 'react-router-dom'
import { useApiData } from '../../hooks/useApiData'
import { compareUniversities } from '../../services/universities'
import { compareUrl, MAX_COMPARE, MIN_COMPARE, useCompareList } from '../../features/compare/useCompareList'
import { COMPARE_ROWS } from './compareRows'
import { lowestTuitionSlug } from './compareUtils'

// So sánh 2–3 trường bất kỳ người dùng chọn ở trang danh sách (/so-sanh?truong=a,b,c).
function UniversityCompareTable({ slugs }) {
  const navigate = useNavigate()
  const compare = useCompareList()
  const { data: universities, loading, error, retry } = useApiData(slugs.join(','), (signal) => compareUniversities(slugs, signal))

  // Bỏ một trường khỏi bảng (và khỏi danh sách đã chọn). Còn dưới 2 trường thì quay lại trang danh sách.
  function removeColumn(slug) {
    compare.remove(slug)
    const rest = slugs.filter((s) => s !== slug)
    navigate(rest.length >= MIN_COMPARE ? compareUrl(rest) : '/truong', { replace: true })
  }

  const ready = universities && !loading
  const lowestSlug = ready ? lowestTuitionSlug(universities) : null

  return (
    <div className="container compare-page">
      <h1 className="page-title">So sánh trường đại học</h1>
      <p className="page-subtitle">Đặt {slugs.length} trường cạnh nhau để so học phí, điểm chuẩn, ngành đào tạo và điều kiện học tập.</p>

      {loading && <p className="muted" role="status">Đang tải dữ liệu so sánh…</p>}
      {error && (
        <div className="alert-error" role="alert">
          {error} <button type="button" className="btn btn-outline" onClick={retry}>Thử lại</button>{' '}
          <Link to="/truong" className="btn btn-outline">Chọn lại trường</Link>
        </div>
      )}

      {ready && (
        <>
          <div className="compare-scroll" role="region" aria-label="Bảng so sánh trường" tabIndex={0}>
            <table className="compare-table">
              <caption>
                Dữ liệu lấy từ cơ sở dữ liệu của UniMatch, tham khảo từ website chính thức của các trường.
                Học phí theo học kỳ được ước tính × 2 khi quy về năm. Vui lòng đối chiếu thông báo tuyển sinh mới nhất.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Tiêu chí</th>
                  {universities.map((u) => (
                    <th scope="col" key={u.slug}>
                      <span className="compare-name">{u.name}</span>
                      {u.shortName && <small className="compare-short">{u.shortName}</small>}
                      <span className="compare-head-actions">
                        <Link to={`/truong/${u.slug}`}>Xem chi tiết</Link>
                        <button type="button" className="compare-remove" onClick={() => removeColumn(u.slug)} aria-label={`Bỏ ${u.name} khỏi so sánh`}>
                          Bỏ
                        </button>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.label}</th>
                    {universities.map((u) => {
                      const value = row.render(u, { isLowest: u.slug === lowestSlug })
                      return <td key={u.slug}>{value ?? <span className="muted">Chưa có dữ liệu</span>}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="compare-actions">
            {slugs.length < MAX_COMPARE && <Link to="/truong" className="btn btn-primary">+ Thêm trường để so sánh</Link>}
            <Link to="/truong" className="btn btn-outline">← Quay lại danh sách trường</Link>
          </div>
        </>
      )}
    </div>
  )
}

export default UniversityCompareTable
