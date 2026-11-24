import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, Check, ChevronRight, ClipboardList, GraduationCap, Info } from 'lucide-react'
import { safeUrl } from '../../utils/universityDetailPolicy'
import { DEMO_YEARS, demoMilestones, demoSteps } from './admissionDemoData'
import AdmissionChecklist from './AdmissionChecklist'
import AdmissionMethods from './AdmissionMethods'
import './AdmissionDemo.css'

const TABS = [
  { id: 'phuong-thuc', label: 'Phương thức xét tuyển', icon: GraduationCap },
  { id: 'moc-thoi-gian', label: 'Mốc thời gian', icon: CalendarDays },
  { id: 'huong-dan', label: 'Hướng dẫn đăng ký', icon: ClipboardList },
  { id: 'ho-so', label: 'Hồ sơ cơ bản', icon: ClipboardList },
]

export default function AdmissionsContent({ base, admissionsUrl }) {
  const [params, setParams] = useSearchParams()
  const active = TABS.some(tab => tab.id === params.get('muc')) ? params.get('muc') : 'phuong-thuc'
  const requestedYear = Number(params.get('nam'))
  const year = DEMO_YEARS.includes(requestedYear) ? requestedYear : DEMO_YEARS[0]
  const officialUrl = safeUrl(admissionsUrl)
  function select(key, value) {
    setParams(previous => { const next = new URLSearchParams(previous); next.set(key, String(value)); return next })
  }
  return <div className="ad-demo">
    <div className="ad-demo-label" role="note"><Info size={19} aria-hidden="true" /><div><strong>Bản xem thử · Dữ liệu minh họa</strong><p>Phương thức, điều kiện, công thức và lịch bên dưới là ví dụ để xem bố cục, chưa phải thông báo tuyển sinh của trường.</p></div></div>
    <section className="ad-intro" aria-labelledby="ad-intro-title">
      <div><p className="ad-kicker">CHUẨN BỊ HÀNH TRÌNH ĐẠI HỌC</p><h3 id="ad-intro-title">Từ chọn phương thức<br />đến hoàn tất hồ sơ.</h3><p>Chọn từng mục bên dưới để tìm hiểu điều kiện, xem lịch và chuẩn bị đăng ký.</p><button type="button" className="ad-primary-link" onClick={() => select('muc', 'huong-dan')}>Xem các bước đăng ký <ChevronRight size={16} aria-hidden="true" /></button></div>
      <div className="ad-year-card"><CalendarDays size={25} aria-hidden="true" /><label htmlFor="ad-year">Năm tuyển sinh minh họa</label><select id="ad-year" value={year} onChange={event => select('nam', event.target.value)}>{DEMO_YEARS.map(value => <option key={value}>{value}</option>)}</select><span>Lịch ví dụ · Chưa xác minh</span></div>
    </section>
    <nav className="ad-shortcuts ad-subpages" aria-label="Các mục tuyển sinh">{TABS.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={active === id ? 'page' : undefined} onClick={() => select('muc', id)}><Icon size={18} aria-hidden="true" />{label}</button>)}</nav>
    <div className="ad-selected-content" key={active}>
      {active === 'phuong-thuc' && <AdmissionMethods key={year} base={base} year={year} />}
      {active === 'moc-thoi-gian' && <section className="ud-section ad-section" aria-labelledby="ad-timeline-title"><div className="ad-section-heading"><div><p className="ad-kicker">GHI NHỚ THỜI HẠN</p><h3 id="ad-timeline-title">Các mốc quan trọng</h3></div><span className="ad-sample-tag">Lịch minh họa {year}</span></div><p className="ad-description">Một lịch ví dụ cho toàn bộ hành trình đăng ký.</p><ol className="ad-timeline">{demoMilestones(year).map((milestone, index) => <li key={milestone.title}><span className="ad-timeline-dot" aria-hidden="true">{index + 1}</span><div><span className="ad-date">{milestone.date}</span><h4>{milestone.title}</h4><p>{milestone.description}</p></div></li>)}</ol><p className="ad-source-note">Các ngày trên được tạo cho bản demo, không thể hiện thời hạn hay trạng thái nhận hồ sơ thực tế.</p></section>}
      {active === 'huong-dan' && <>
        <section className="ud-section ad-section" aria-labelledby="ad-steps-title"><div className="ad-section-heading"><div><p className="ad-kicker">BẮT ĐẦU TỪ ĐÂU?</p><h3 id="ad-steps-title">Đăng ký theo từng bước</h3></div><span className="ad-sample-tag">Hướng dẫn mẫu</span></div><ol className="ad-steps">{demoSteps.map((step, i) => <li key={step.title}><span className="ad-step-number">0{i + 1}</span><h4>{step.title}</h4><p>{step.description}</p></li>)}</ol><div className="ad-last-note"><Check size={18} aria-hidden="true" /><p>Trước khi nộp, đối chiếu lại thông tin cá nhân, phương thức và yêu cầu của ngành trong thông báo chính thức.</p></div><button type="button" className="ad-text-link" onClick={() => select('muc', 'ho-so')}>Chuẩn bị hồ sơ cơ bản <ChevronRight size={16} aria-hidden="true" /></button></section>
        <section className="ad-notes" aria-labelledby="ad-notes-title"><h3 id="ad-notes-title">Lưu ý trước khi đăng ký</h3><ul><li>Ngành năng khiếu có thể yêu cầu bài thi hoặc hồ sơ riêng.</li><li>Yêu cầu ngoại ngữ và cách quy đổi chứng chỉ có thể khác nhau giữa các chương trình.</li><li>Điểm chuẩn các năm trước dùng để tham khảo, không bảo đảm kết quả xét tuyển.</li></ul><p>Các tình huống trên là ví dụ cho mục lưu ý; chưa xác nhận áp dụng tại trường.</p></section>
      </>}
      {active === 'ho-so' && <AdmissionChecklist base={base} year={year} />}
    </div>
    <section className="ad-help ad-help-inline" aria-labelledby="ad-help-title"><div><h3 id="ad-help-title">Cần hỏi thêm về tuyển sinh?</h3><p>Đối chiếu điều kiện, lệ phí và giấy tờ với thông báo chính thức của trường.</p></div>{officialUrl ? <a href={officialUrl} target="_blank" rel="noreferrer">Trang tuyển sinh chính thức <ArrowUpRight size={16} aria-hidden="true" /></a> : <Link to={`${base}/lien-he`}>Xem thông tin liên hệ <ArrowUpRight size={16} aria-hidden="true" /></Link>}<span>Liên kết từ hồ sơ trường; không phải nguồn xác nhận cho dữ liệu demo.</span></section>
  </div>
}
