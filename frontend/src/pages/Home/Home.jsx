import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Bot, Compass, Heart, Landmark, MapPin, Target, Wallet } from 'lucide-react'
import CampusSlider from '../../components/CampusSlider'
import Reveal from '../../components/Reveal'
import Sticker from '../../components/Sticker'
import UniversityCard from '../../components/UniversityCard'
import { useFavorites } from '../../features/favorites/useFavorites'
import { useCountUp } from '../../hooks/useCountUp'
import api, { getErrorMessage } from '../../services/api'
import './Home.css'

const AI_FEATURES = [
  [BookOpen, 'Ngành muốn học'],
  [Target, 'Điểm dự kiến'],
  [Wallet, 'Học phí mong muốn'],
  [MapPin, 'Khu vực'],
  [Landmark, 'Loại trường'],
  [Compass, 'Sở thích cá nhân'],
]

function StatItem({ value, label }) {
  const [ref, shown] = useCountUp(value)
  return (
    <div className="stat-item" ref={ref}>
      <strong>{shown.toLocaleString('vi-VN')}</strong>
      <span>{label}</span>
    </div>
  )
}

function Home() {
  const { isFavorite, toggle, countOf, error: favoriteError } = useFavorites()
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const topFavorites = universities
    .filter((university) => Number.isFinite(university.favoriteCount) && university.favoriteCount > 0)
    .sort((a, b) => b.favoriteCount - a.favoriteCount)
    .slice(0, 3)

  // Số liệu tính trực tiếp từ danh sách trường; chưa tải xong thì không hiện để tránh ô trống
  const countBy = (test) => universities.filter(test).length
  const stats = loading || error ? [] : [
    [universities.length, 'Trường đại học, học viện'],
    [countBy((u) => u.belongsToUniversitySystem), 'Trường thuộc ĐHQG-HCM'],
    [countBy((u) => u.institutionType === 'public'), 'Trường công lập'],
    [countBy((u) => u.institutionType === 'private' || u.institutionType === 'international'), 'Trường tư thục, quốc tế'],
  ]

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>
              Tìm trường đại học
              <br />
              <span className="hero-highlight">
                dễ dàng hơn
                {/* nét gạch chân vẽ tay, tự "vẽ" ra khi tải trang */}
                <svg viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M4 14c50-8 110-11 160-8s90 4 132-2" />
                </svg>
              </span>
            </h1>
            <p className="hero-description">
              Khám phá các trường đại học, ngành học tại TP.HCM
              và nhận gợi ý trường phù hợp với bạn.
            </p>
            <div className="hero-buttons">
              <Link to="/ai-tu-van" className="btn btn-primary hero-btn">
                Tư vấn ngay<ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/truong" className="btn btn-outline hero-btn">Xem trường</Link>
            </div>
            <Sticker name="pencil" size={52} tilt={-8} delay={1.2} className="hero-sticker-pencil" />
          </div>

          <div className="hero-visual">
            <CampusSlider />
            <Sticker name="cap" size={78} tilt={-14} className="hero-sticker-cap" />
            <Sticker name="sparkle" size={40} tilt={10} delay={0.8} className="hero-sticker-sparkle" />
            <Sticker name="book" size={64} tilt={8} delay={1.6} className="hero-sticker-book" />
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="home-stats" aria-label="Dữ liệu trên UniMatch HCMC">
          <div className="container stats-grid">
            {stats.map(([value, label]) => <StatItem key={label} value={value} label={label} />)}
          </div>
        </section>
      )}

      <section className="featured" aria-labelledby="featured-title">
        <div className="container">
          <Reveal className="featured-header">
            <div>
              <h2 id="featured-title">Trường được yêu thích nhất</h2>
              <p className="section-description">Những trường được cộng đồng UniMatch thả tim nhiều nhất.</p>
            </div>
            <Link to="/truong" className="view-all">
              Xem tất cả<ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>

          {loading ? (
            <p className="favorites-status" role="status">Đang tải danh sách trường…</p>
          ) : error ? (
            <div className="alert-error" role="alert">{error}</div>
          ) : topFavorites.length > 0 ? (
            <>
              {favoriteError && <div className="alert-error" role="alert">{favoriteError}</div>}
              <div className="favorites-grid">
                {topFavorites.map((university, i) => (
                  <Reveal key={university._id} delay={i * 120}>
                    <UniversityCard
                      university={{ ...university, favoriteCount: countOf(university) }}
                      isFavorite={isFavorite(university)}
                      onToggleFavorite={toggle}
                    />
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <Reveal className="favorites-empty">
              <span className="favorites-empty-icon" aria-hidden="true"><Heart size={30} /></span>
              <h3>Chưa có dữ liệu lượt yêu thích</h3>
              <p>Bảng xếp hạng sẽ được cập nhật khi có trường nhận được lượt yêu thích.</p>
            </Reveal>
          )}
        </div>
      </section>

      <section className="home-ai" aria-labelledby="home-ai-title">
        <div className="container home-ai-inner">
          <Reveal className="home-ai-content">
            <h2 id="home-ai-title">Chưa biết trường nào phù hợp với bạn?</h2>
            <p className="section-description">
              Cho UniMatch biết ngành muốn học, điểm dự kiến, học phí, khu vực,
              loại trường và sở thích của bạn để xem những lựa chọn phù hợp.
            </p>
            <ul className="home-ai-features">
              {AI_FEATURES.map(([Icon, label]) => (
                <li key={label}><Icon size={18} aria-hidden="true" />{label}</li>
              ))}
            </ul>
            <Link to="/ai-tu-van" className="btn btn-primary">
              Bắt đầu tư vấn<ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>

          <Reveal className="chat-preview" delay={150} role="figure" aria-labelledby="chat-preview-caption">
            <Sticker name="bulb" size={60} tilt={12} className="chat-sticker-bulb" />
            <div className="chat-head">
              <span className="chat-avatar" aria-hidden="true"><Bot size={20} /></span>
              <div>
                <strong>UniMatch AI</strong>
                <span>Trợ lý chọn trường</span>
              </div>
            </div>
            <div className="chat-body" aria-hidden="true">
              <p className="chat-bubble chat-bubble-user">
                Em dự kiến khoảng 24 điểm khối A00, thích ngành Công nghệ thông tin, muốn học gần Thủ Đức.
              </p>
              <p className="chat-bubble chat-bubble-bot">
                Mình sẽ lọc các trường có ngành CNTT, điểm chuẩn gần mức của bạn và ở gần Thủ Đức nhé!
              </p>
              <p className="chat-typing"><i /><i /><i /></p>
            </div>
            <p id="chat-preview-caption" className="chat-caption">Ví dụ minh họa, không phải kết quả tư vấn thật</p>
          </Reveal>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="home-cta-title">
        <Reveal className="container home-cta-inner">
          <Sticker name="plane" size={64} tilt={-6} className="cta-sticker-plane" />
          <Sticker name="heart" size={44} tilt={14} delay={1} className="cta-sticker-heart" />
          <Sticker name="pin" size={50} tilt={-10} delay={0.5} className="cta-sticker-pin" />
          <h2 id="home-cta-title">Bắt đầu hành trình tìm trường của bạn</h2>
          <p>Khám phá thông tin các trường đại học tại TP.HCM và tìm lựa chọn phù hợp cùng UniMatch HCMC.</p>
          <div className="home-cta-actions">
            <Link to="/truong" className="btn btn-outline">Khám phá trường</Link>
            <Link to="/ai-tu-van" className="btn btn-primary">
              Dùng AI tư vấn<ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

export default Home
