import { Link } from 'react-router-dom'
import { formatTuition, INSTITUTION_TYPE_LABEL } from '../utils/format'
import UniversityLogo from './UniversityLogo'
import { Check, Heart, MapPin, Plus } from 'lucide-react'
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
        <UniversityLogo university={u} />
        <div className="uni-title">
          <h3 className="uni-name">
            <Link to={`/truong/${u.slug}`}>{u.name}</Link>
          </h3>
          <div className="uni-badges">
            {u.shortName && <span className="uni-short">{u.shortName}</span>}
            <span className="badge">{INSTITUTION_TYPE_LABEL[u.institutionType]}</span>
            {u.belongsToUniversitySystem && <span className="badge badge-green">ĐHQG</span>}
          </div>
        </div>
        <Fav className={`uni-fav${isFavorite ? ' is-active' : ''}`} {...favProps}>
          <Heart size={20} aria-hidden="true" fill={isFavorite ? 'currentColor' : 'none'} />
          <span>{u.favoriteCount.toLocaleString('vi-VN')}</span>
        </Fav>
      </div>

      {u.district && (
        <p className="uni-district">
          <MapPin size={15} aria-hidden="true" />
          {u.district}
        </p>
      )}

      <dl className="uni-stats">
        <div>
          <dt>Học phí từ</dt>
          <dd className={u.tuitionFrom ? undefined : 'is-missing'}>{formatTuition(u.tuitionFrom) || 'Chưa có'}</dd>
        </div>
        <div>
          <dt>Điểm chuẩn từ</dt>
          <dd className={u.scoreFrom == null ? 'is-missing' : undefined}>{u.scoreFrom == null ? 'Chưa có' : u.scoreFrom.toLocaleString('vi-VN')}</dd>
        </div>
      </dl>

      {u.majors.length > 0 && (
        <ul className="uni-majors" aria-label="Một số ngành đào tạo">
          {u.majors.map((name) => (
            <li key={name} className="chip">{name}</li>
          ))}
        </ul>
      )}

      <div className="uni-card-actions">
        <Link to={`/truong/${u.slug}`} className="btn btn-primary uni-detail-link">
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
            {isCompared ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            {isCompared ? 'Đã chọn' : 'So sánh'}
          </button>
        )}
      </div>
    </article>
  )
}

export default UniversityCard
