import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, NavLink, useParams } from 'react-router-dom'
import { MISSING, asArray, detailData, text } from '../../utils/universityDetail'
import { profilePolicy, safeUrl } from '../../utils/universityDetailPolicy'
import { hcmutContent, hcmutSources } from '../../utils/hcmutDetail'
import { introBadges } from '../../utils/universityIntro'
import MajorAdmissions from './MajorAdmissions'
import AdmissionDemo from './AdmissionDemo'
import TuitionTable from './TuitionTable'

const PAGES = [
  ['tong-quan', 'Tổng quan', 'Tìm hiểu về trường và các thông tin cơ bản.'],
  ['nganh-dao-tao', 'Ngành & điểm chuẩn', 'Tra cứu ngành, chương trình và điểm chuẩn theo năm.'],
  ['tuyen-sinh', 'Tuyển sinh', 'Phương thức, mốc thời gian và hướng dẫn đăng ký tuyển sinh.'],
  ['hoc-phi', 'Học phí', 'Xem mức phí, năm học và phạm vi áp dụng.'],
  ['co-so-vi-tri', 'Cơ sở & vị trí', 'Địa chỉ các cơ sở và điều kiện học tập.'],
  ['lien-he', 'Liên hệ', 'Kết nối với trường và bộ phận tư vấn tuyển sinh.'],
]

function Source({ href, children = 'Xem nguồn ↗' }) {
  const url = safeUrl(href)
  return url ? <a href={url} target="_blank" rel="noreferrer">{children}</a> : <span className="ud-missing">{MISSING}</span>
}

function InformationList({ items, fields }) {
  const entries = asArray(items).filter(item => fields.some(([key]) => text(item[key])))
  return entries.length ? <ul className="ud-info-list">{entries.map((item, i) => <li key={item._id || i}>{fields.map(([key, label]) => text(item[key]) && <p key={key}>{label && <strong>{label}: </strong>}{item[key]}</p>)}</li>)}</ul> : <p className="ud-empty">{MISSING}</p>
}

function Logo({ src, name }) {
  const [failed, setFailed] = useState(null)
  const url = safeUrl(src)
  return <div className="ud-logo">{url && failed !== url ? <img src={url} alt={`Logo ${name}`} onError={() => setFailed(url)} referrerPolicy="no-referrer" /> : <svg viewBox="0 0 80 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M8 56h64M16 56V25h48v31M10 25L40 8l30 17H10ZM34 56V40h12v16M24 32h4m24 0h4M24 40h4m24 0h4" /></svg>}</div>
}

export function DetailContent({ university: u }) {
  const { section } = useParams()
  const base = `/truong/${encodeURIComponent(u.slug)}`
  const active = section === 'diem-chuan' ? 'nganh-dao-tao' : section || 'tong-quan'
  const page = PAGES.find(([id]) => id === active)
  const headingRef = useRef(null)
  const navRef = useRef(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    headingRef.current?.focus({ preventScroll: true })
    const nav = navRef.current
    const link = nav?.querySelector('[aria-current="page"]')
    if (link) nav.scrollLeft = link.offsetLeft - nav.offsetLeft - 16
  }, [active])
  const data = detailData(u)
  const profile = profilePolicy(u)
  const verified = hcmutContent(u)
  const sources = hcmutSources(u)
  const content = verified || u
  const contact = u.contact || {}
  const badges = introBadges(u, profile)
  if (section === 'diem-chuan') return <Navigate to={`${base}/nganh-dao-tao`} replace />
  return <div className="ud-shell ud-redesign">
    <div className="ud-breadcrumb"><Link to="/truong">← Danh sách trường</Link><span aria-hidden="true">/</span><span>{u.shortName || u.name}</span></div>
    <header className="ud-profile"><div className="ud-profile-body">
      <Logo src={u.media?.logoUrl} name={u.name} />
      <div className="ud-identity"><p className="ud-eyebrow">HỒ SƠ TRƯỜNG ĐẠI HỌC</p><h1>{u.name}</h1>{text(u.shortName) && <p className="ud-abbreviation">{u.shortName}</p>}{badges.length > 0 && <ul className="ud-intro-badges">{badges.map(badge => <li key={badge}>{badge}</li>)}</ul>}</div>
      {safeUrl(contact.website) && <div className="ud-official"><Source href={contact.website}>Website trường ↗</Source></div>}
    </div></header>
    <nav ref={navRef} className="ud-page-nav" aria-label="Các trang thông tin trường">{PAGES.map(([id, label]) => <NavLink key={id} end to={id === 'tong-quan' ? base : `${base}/${id}`} className={() => active === id ? 'is-active' : undefined} aria-current={active === id ? 'page' : undefined}>{label}</NavLink>)}</nav>
    <div className="ud-page-heading"><p className="ud-eyebrow">{u.shortName || 'THÔNG TIN TRƯỜNG'}</p><h2 ref={headingRef} tabIndex={-1}>{page?.[1] || 'Không tìm thấy mục thông tin'}</h2><p>{page?.[2] || 'Mục bạn tìm không tồn tại trong hồ sơ trường.'}</p></div>
    <div className="ud-page-content" key={active}>
      {!page && <Link to={base} className="btn btn-primary">Về tổng quan</Link>}
      {active === 'tong-quan' && <>
        <section className="ud-section"><h3>Giới thiệu về trường</h3><p className="ud-intro-text">{text(profile.description) || 'Chưa có thông tin giới thiệu về trường.'}</p>{verified && <Source href={sources.overview}>Nguồn giới thiệu ↗</Source>}
          <dl className="ud-contact ud-basic-info">{[['Hệ thống đại học', profile.universitySystem], ['Địa chỉ trụ sở', profile.address]].filter(([, value]) => text(value)).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </section>
        <div className="ud-explore">{PAGES.slice(1).map(([id, label, description], index) => <Link key={id} to={`${base}/${id}`} className="ud-explore-card"><span className="ud-card-number">0{index + 1}</span><h3>{label}<span aria-hidden="true">↗</span></h3><p>{description}</p></Link>)}</div>
      </>}
      {active === 'nganh-dao-tao' && <section className="ud-section"><MajorAdmissions data={data} /></section>}
      {active === 'tuyen-sinh' && <AdmissionDemo base={base} admissionsUrl={contact.admissionsUrl} />}
      {active === 'hoc-phi' && <TuitionTable data={data} />}
      {active === 'co-so-vi-tri' && <>
        <section className="ud-section"><h3>Vị trí & cơ sở đào tạo</h3><div className="ud-location"><span aria-hidden="true">⌖</span><p><strong>Trụ sở: </strong>{text(profile.address) || MISSING}</p></div>{profile.campuses?.length > 0 && <><InformationList items={profile.campuses} fields={[["name", ''], ['address', 'Địa chỉ']]} />{verified && <Source href={sources.overview}>Nguồn địa chỉ ↗</Source>}</>}<p className="ud-muted">Nơi học có thể khác nhau theo ngành và chương trình. Liên hệ trường để xác nhận cơ sở học.</p></section>
        <section className="ud-section"><h3>Cơ sở vật chất</h3><InformationList items={content.facilities} fields={[["name", ''], ['description', '']]} />{verified && <p><Source href={sources.library}>Nguồn thư viện ↗</Source> · <Source href={sources.overview}>Nguồn cơ sở vật chất ↗</Source></p>}</section>
      </>}
      {active === 'lien-he' && <section className="ud-section"><h3>Kênh liên hệ của trường</h3><dl className="ud-contact">{[['Website', contact.website, true], ['Trang tuyển sinh', contact.admissionsUrl, true], ['Điện thoại', profile.phone], ['Email', contact.email], ['Điện thoại tuyển sinh', contact.admissionsPhone], ['Email tuyển sinh', contact.admissionsEmail]].filter(([, value]) => text(value)).map(([label, value, url]) => <div key={label}><dt>{label}</dt><dd>{url ? <Source href={value}>{value}</Source> : value}</dd></div>)}</dl>{![contact.website, contact.admissionsUrl, profile.phone, contact.email, contact.admissionsPhone, contact.admissionsEmail].some(text) && <p className="ud-empty">{MISSING}</p>}{verified && <p className="ud-muted"><Source href={sources.contact}>Nguồn liên hệ chung ↗</Source> · <Source href={sources.admissionsContact}>Nguồn liên hệ tuyển sinh ↗</Source></p>}</section>}
    </div>
    <footer className="ud-detail-footer"><p>{active === 'tuyen-sinh' ? 'Bản demo tuyển sinh dùng dữ liệu minh họa.' : 'Thông tin tham khảo từ hồ sơ trường. Năm và nguồn được ghi tại từng mục.'}</p><Link to="/ai-tu-van">Tư vấn chọn trường với AI →</Link></footer>
  </div>
}
