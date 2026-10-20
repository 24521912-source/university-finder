import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import universityImg from '../../assets/university.png'
import UniversityCard from '../../components/UniversityCard'
import api, { getErrorMessage } from '../../services/api'
import './Home.css'

const aiFeatures = [
  ['📖', 'Ngành muốn học'],
  ['📊', 'Điểm dự kiến'],
  ['💰', 'Học phí mong muốn'],
  ['📍', 'Khu vực'],
  ['🏫', 'Loại trường'],
  ['✨', 'Sở thích cá nhân'],
]

function Home() {
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const topFavorites = universities
    .filter((university) => Number.isFinite(university.favoriteCount) && university.favoriteCount > 0)
    .sort((a, b) => b.favoriteCount - a.favoriteCount)
    .slice(0, 3)

  useEffect(() => {
    let active = true

    api.get('/universities')
      .then((response) => {
        if (active) setUniversities(response.data)
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-left">
          <p className="hero-label">NỀN TẢNG TÌM TRƯỜNG #1 TP.HCM</p>
          <h1>Tìm trường đại học<br /> dễ dàng hơn</h1>
          <p className="hero-description">
            Khám phá các trường đại học, ngành học tại TP.HCM
            và nhận gợi ý trường đại học phù hợp với bạn.
          </p>
          <div className="hero-buttons">
            <Link to="/ai-tu-van" className="btn-primary">Tư vấn ngay</Link>
            <Link to="/truong" className="btn-outline">Xem trường</Link>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-card">
            <img src={universityImg} alt="Sinh viên háo hức khám phá trường đại học" />
          </div>
        </div>
      </section>

      <section className="home-stats" aria-label="Thống kê UniMatch HCMC">
        <div className="stat-item">
          <h3>{loading || error ? '--' : universities.length.toLocaleString('vi-VN')}</h3>
          <p>Trường đại học</p>
        </div>
        <div className="stat-item"><h3>--</h3><p>Ngành học</p></div>
        <div className="stat-item"><h3>--</h3><p>Người dùng</p></div>
        <div className="stat-item"><h3>--</h3><p>Đánh giá trung bình</p></div>
        {error && <p className="home-stats-error" role="alert">{error}</p>}
      </section>

      <section className="featured-universities" aria-labelledby="featured-title">
        <div className="featured-header">
          <h2 id="featured-title">Top 3 trường được yêu thích nhất ❤️</h2>
          <Link to="/truong" className="view-all">Xem tất cả →</Link>
        </div>
        <p className="featured-description">
          Khám phá những trường đại học được cộng đồng UniMatch yêu thích nhất.
        </p>
        {loading ? (
          <p className="favorites-status" role="status">Đang tải danh sách trường…</p>
        ) : error ? (
          <div className="alert-error" role="alert">{error}</div>
        ) : topFavorites.length > 0 ? (
          <div className="favorites-grid">
            {topFavorites.map((university) => (
              <UniversityCard key={university._id} university={university} />
            ))}
          </div>
        ) : (
        <div className="favorites-empty">
          <span className="favorites-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          </span>
          <h3>Chưa có dữ liệu lượt yêu thích</h3>
          <p>Bảng xếp hạng sẽ được cập nhật khi có trường nhận được lượt yêu thích.</p>
        </div>
        )}
      </section>

      <section className="home-ai" aria-labelledby="home-ai-title">
        <div className="home-ai-content">
          <span className="home-ai-label">🤖 Trí tuệ nhân tạo</span>
          <h2 id="home-ai-title">Chưa biết trường nào phù hợp với bạn?</h2>
          <p className="home-ai-description">
            Hãy cho UniMatch biết ngành muốn học, điểm dự kiến, học phí mong muốn,
            khu vực, loại trường và sở thích của bạn để khám phá những lựa chọn phù hợp.
          </p>
          <ul className="home-ai-features">
            {aiFeatures.map(([icon, label]) => (
              <li key={label}><span aria-hidden="true">{icon}</span>{label}</li>
            ))}
          </ul>
          <Link to="/ai-tu-van" className="home-action home-action-primary">Bắt đầu tư vấn →</Link>
        </div>
        <div className="home-ai-preview" role="figure" aria-labelledby="ai-preview-caption">
          <div className="home-ai-preview-head">
            <span className="home-ai-avatar" aria-hidden="true">🤖</span>
            <div><strong>UniMatch AI</strong><span>Khám phá lựa chọn phù hợp</span></div>
            <span className="home-ai-dots" aria-hidden="true">•••</span>
          </div>
          <p id="ai-preview-caption" className="home-ai-example">Ví dụ minh họa — không phải kết quả tư vấn thực tế</p>
          <div className="home-ai-example-rows" aria-hidden="true">
            <div><span>Ngành học & sở thích</span><span className="home-ai-example-track"><i /></span></div>
            <div><span>Điểm dự kiến</span><span className="home-ai-example-track"><i /></span></div>
            <div><span>Học phí & khu vực</span><span className="home-ai-example-track"><i /></span></div>
          </div>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="home-cta-title">
        <h2 id="home-cta-title">Bắt đầu hành trình tìm trường của bạn</h2>
        <p>Khám phá thông tin trường đại học tại TP.HCM và tìm hiểu lựa chọn phù hợp cùng UniMatch HCMC.</p>
        <div className="home-cta-actions">
          <Link to="/truong" className="home-action home-action-outline">Khám phá trường</Link>
          <Link to="/ai-tu-van" className="home-action home-action-primary">Dùng AI tư vấn →</Link>
        </div>
      </section>
    </div>
  )
}

export default Home
