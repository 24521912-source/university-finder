import { Link } from 'react-router-dom'
import { formatTuition, INSTITUTION_TYPE_LABEL } from '../utils/format'
import './UniversityCard.css'

// Thẻ một trường — dùng chung cho danh sách, kết quả AI, trường yêu thích, so sánh.
// university: dữ liệu dạng "card" backend trả về (hàm toCard trong backend/src/modules/universities/universities.service.js)
// onToggleFavorite, isFavorite: truyền vào khi trang có chức năng lưu yêu thích; không truyền thì chỉ hiện số lượt
// onToggleCompare, isCompared, compareDisabled: truyền vào khi trang cho chọn trường để so sánh (vd. danh sách trường)
function UniversityCard({ university: u, isFavorite = false, onToggleFavorite, isCompared = false, compareDisabled = false, onToggleCompare }) {
  const favProps = onToggleFavorite
    ? {
        type: 'button',
        onClick: () => onToggleFavorite(u),
        'aria-pressed': isFavorite,
        'aria-label': isFavorite ? 'Bỏ lưu trường' : 'Lưu trường',
      }
    : { 'aria-label': `${u.favoriteCount} lượt yêu thích` }
  const Fav = onToggleFavorite ? 'button' : 'div'

  return (
    <article className="uni-card">
      <div className="uni-card-head">
        {u.logoUrl ? (
          <img className="uni-logo" src={u.logoUrl} alt="" />
        ) : (
          <div className="uni-logo" aria-hidden="true">{u.shortName || '—'}</div>
        )}

        <div className="uni-title">
          <div className="uni-badges">
            <span className="badge">{INSTITUTION_TYPE_LABEL[u.institutionType]}</span>
            {u.belongsToUniversitySystem && <span className="badge badge-green">ĐHQG</span>}
          </div>
          <h3 className="uni-name">{u.name}</h3>
          {u.shortName && <div className="uni-short">{u.shortName}</div>}
        </div>

        <Fav className={`uni-fav${isFavorite ? ' is-active' : ''}`} {...favProps}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c2 0 3.4 1.1 4.2 2.4h2C13.8 6.1 15.2 5 17.2 5c3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21z" />
          </svg>
          {u.favoriteCount.toLocaleString('vi-VN')}
        </Fav>
      </div>

      {u.district && (
        <div className="uni-district">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {u.district}
        </div>
      )}

      <div className="uni-stats">
        <div className="uni-stat">
          <span>Học phí từ</span>
          <strong>{formatTuition(u.tuitionFrom) || 'Chưa có'}</strong>
        </div>
        <div className="uni-stat">
          <span>Điểm chuẩn từ</span>
          <strong>{u.scoreFrom ?? 'Chưa có'}</strong>
        </div>
      </div>

      {u.majors.length > 0 && (
        <div>
          <div className="uni-majors-label">Ngành đào tạo</div>
          <div className="uni-majors">
            {u.majors.map((name) => (
              <span key={name} className="chip">{name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="uni-card-actions">
        <Link to={`/truong/${u.slug}`} className="btn btn-primary">
          Xem chi tiết
        </Link>
        {onToggleCompare && (
          <button
            type="button"
            className={`btn btn-outline uni-compare${isCompared ? ' is-active' : ''}`}
            aria-pressed={isCompared}
            disabled={!isCompared && compareDisabled}
            title={!isCompared && compareDisabled ? 'Chỉ so sánh tối đa 3 trường' : undefined}
            onClick={() => onToggleCompare(u)}
          >
            {isCompared ? '✓ Đã chọn so sánh' : '+ So sánh'}
          </button>
        )}
      </div>
    </article>
  )
}

export default UniversityCard
