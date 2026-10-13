import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  { to: '/truong', label: 'Danh sách trường' },
  { to: '/ai-tu-van', label: 'AI tư vấn chọn trường' },
  { to: '/so-sanh', label: 'So sánh trường' },
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <section className="footer-about" aria-label="Giới thiệu">
          <p className="footer-brand">UniMatch HCMC</p>
          <p>Tổng hợp thông tin các trường đại học tại TP.HCM, hỗ trợ AI tư vấn và so sánh trường phù hợp với bạn.</p>
        </section>

        <nav aria-label="Liên kết chân trang">
          <ul className="footer-links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="footer-note">
          Học phí, điểm chuẩn tham khảo từ website chính thức của các trường. Vui lòng đối chiếu thông báo tuyển sinh mới nhất.
        </p>
      </div>
      <p className="container footer-copy">
        <small>&copy; 2026 UniMatch HCMC</small>
      </p>
    </footer>
  )
}

export default Footer
