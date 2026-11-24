import { lazy, Suspense, useEffect, useRef } from 'react'
import { Link, Navigate, NavLink, useParams } from 'react-router-dom'
import { MISSING, asArray, detailData, text } from '../../utils/universityDetail'
import { profilePolicy, safeUrl } from '../../utils/universityDetailPolicy'
import { evidenceContent, evidenceSources } from '../../utils/detailEvidence'
import { introBadges } from '../../utils/universityIntro'
import { useFavorites } from '../../features/favorites/useFavorites'
import UniversityLogo from '../../components/UniversityLogo'
import { ArrowRight, ArrowUpRight, ChevronLeft, ExternalLink, Heart } from 'lucide-react'
import MajorAdmissions from './MajorAdmissions'
import TuitionTable from './TuitionTable'
const LocationMap = lazy(() => import('./LocationMap')) // Leaflet chỉ tải khi mở mục Cơ sở & vị trí

const PAGES = [
  ['tong-quan', 'Tổng quan', 'Tìm hiểu về trường và các thông tin cơ bản.'],
  ['nganh-dao-tao', 'Ngành & điểm chuẩn', 'Tra cứu ngành, chương trình và điểm chuẩn theo năm.'],
  ['hoc-phi', 'Học phí', 'Xem mức phí, năm học và phạm vi áp dụng.'],
  ['co-so-vi-tri', 'Cơ sở & vị trí', 'Địa chỉ các cơ sở và điều kiện học tập.'],
  ['lien-he', 'Liên hệ', 'Kết nối với trường và bộ phận tư vấn tuyển sinh.'],
]

// Mục chỉ hiện với trường có dữ liệu đã duyệt (detailEvidence): [field, tiêu đề, các dòng hiển thị, khóa nguồn, nhãn nguồn]
const VERIFIED_SECTIONS = [
  ['scholarships', 'Học bổng', [['name', ''], ['value', 'Giá trị'], ['eligibility', 'Đối tượng'], ['description', '']], 'scholarship', 'Nguồn học bổng'],
  ['studentLife', 'Đời sống sinh viên', [['name', ''], ['description', '']], 'studentLife', 'Nguồn hoạt động sinh viên'],
  ['careerOpportunities', 'Cơ hội nghề nghiệp', [['field', ''], ['description', '']], 'career', 'Nguồn cơ hội nghề nghiệp'],
]

function Source({ href, children = 'Xem nguồn' }) {
  const url = safeUrl(href)
  return url ? <a className="ud-ext-link" href={url} target="_blank" rel="noreferrer">{children}<ExternalLink size={13} aria-hidden="true" /></a> : <span className="ud-missing">{MISSING}</span>
}

function InformationList({ items, fields }) {
  const entries = asArray(items).filter(item => fields.some(([key]) => text(item[key])))
  return entries.length ? <ul className="ud-info-list">{entries.map((item, i) => <li key={item._id || i}>{fields.map(([key, label]) => text(item[key]) && <p key={key}>{label && <strong>{label}: </strong>}{item[key]}</p>)}</li>)}</ul> : <p className="ud-empty">{MISSING}</p>
}

function FavoriteButton({ university }) {
  const { isFavorite, toggle, countOf, isPending, error } = useFavorites()
  const active = isFavorite(university)
  return <div className="ud-favorite">
    <button type="button" className={`btn ${active ? 'btn-primary' : 'btn-outline'}`} aria-pressed={active} disabled={isPending(university)} onClick={() => toggle(university)}>
      <Heart size={16} aria-hidden="true" fill={active ? 'currentColor' : 'none'} />{active ? 'Đã yêu thích' : 'Yêu thích'}<span className="ud-fav-count">{countOf(university).toLocaleString('vi-VN')}</span>
    </button>
    {error && <p className="ud-favorite-error" role="alert">{error}</p>}
  </div>
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
  const verified = evidenceContent(u)
  const sources = evidenceSources(u)
  const content = verified || u
  const contact = u.contact || {}
  const badges = introBadges(u, profile)
  if (section === 'diem-chuan') return <Navigate to={`${base}/nganh-dao-tao`} replace />
  // Mục Tuyển sinh (bản demo dữ liệu minh họa) đã bỏ: link cũ chuyển về Tổng quan.
  if (section === 'tuyen-sinh') return <Navigate to={base} replace />
  return <div className="ud-shell ud-redesign">
    <div className="ud-breadcrumb"><Link to="/truong"><ChevronLeft size={16} aria-hidden="true" />Danh sách trường</Link><span aria-hidden="true">/</span><span>{u.shortName || u.name}</span></div>
    <header className="ud-profile"><div className="ud-profile-body">
      <UniversityLogo university={{ slug: u.slug, name: u.name, shortName: u.shortName, logoUrl: u.media?.logoUrl }} size="lg" className="ud-logo" />
      <div className="ud-identity"><h1>{u.name}</h1>{text(u.shortName) && <p className="ud-abbreviation">{u.shortName}</p>}{badges.length > 0 && <ul className="ud-intro-badges">{badges.map(badge => <li key={badge}>{badge}</li>)}</ul>}</div>
      {safeUrl(contact.website) && <div className="ud-official"><Source href={contact.website}>Website trường</Source></div>}
      <FavoriteButton university={u} />
    </div></header>
    <nav ref={navRef} className="ud-page-nav" aria-label="Các trang thông tin trường">{PAGES.map(([id, label]) => <NavLink key={id} end to={id === 'tong-quan' ? base : `${base}/${id}`} className={() => active === id ? 'is-active' : undefined} aria-current={active === id ? 'page' : undefined}>{label}</NavLink>)}</nav>
    <div className="ud-page-heading"><h2 ref={headingRef} tabIndex={-1}>{page?.[1] || 'Không tìm thấy mục thông tin'}</h2><p>{page?.[2] || 'Mục bạn tìm không tồn tại trong hồ sơ trường.'}</p></div>
    <div className="ud-page-content" key={active}>
      {!page && <Link to={base} className="btn btn-primary">Về tổng quan</Link>}
      {active === 'tong-quan' && <>
        <section className="ud-section"><h3>Giới thiệu về trường</h3><p className="ud-intro-text">{text(profile.description) || 'Chưa có thông tin giới thiệu về trường.'}</p>{verified && <Source href={sources.overview}>Nguồn giới thiệu</Source>}
          <dl className="ud-contact ud-basic-info">{[['Hệ thống đại học', profile.universitySystem], ['Địa chỉ trụ sở', profile.address]].filter(([, value]) => text(value)).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </section>
        {verified && VERIFIED_SECTIONS.filter(([key]) => verified[key].length > 0).map(([key, title, fields, sourceKey, sourceLabel]) => <section key={key} className="ud-section"><h3>{title}</h3><InformationList items={verified[key]} fields={fields} /><Source href={sources[sourceKey]}>{sourceLabel}</Source></section>)}
        <div className="ud-explore">{PAGES.slice(1).map(([id, label, description]) => <Link key={id} to={`${base}/${id}`} className="ud-explore-card"><h3>{label}<ArrowUpRight size={18} aria-hidden="true" /></h3><p>{description}</p></Link>)}</div>
      </>}
      {active === 'nganh-dao-tao' && <section className="ud-section"><MajorAdmissions data={data} /></section>}
      {active === 'hoc-phi' && <TuitionTable data={data} />}
      {active === 'co-so-vi-tri' && <>
        <section className="ud-section"><h3>Vị trí & cơ sở đào tạo</h3><div className="ud-location"><span aria-hidden="true">⌖</span><p><strong>Trụ sở: </strong>{text(profile.address) || MISSING}</p></div>{profile.campuses?.length > 0 && <><InformationList items={profile.campuses} fields={[["name", ''], ['address', 'Địa chỉ']]} />{verified && <Source href={sources.overview}>Nguồn địa chỉ</Source>}</>}<Suspense fallback={<p className="ud-muted" role="status">Đang tải bản đồ…</p>}><LocationMap university={u} /></Suspense><p className="ud-muted">Nơi học có thể khác nhau theo ngành và chương trình. Liên hệ trường để xác nhận cơ sở học.</p></section>
        <section className="ud-section"><h3>Cơ sở vật chất</h3><InformationList items={content.facilities} fields={[["name", ''], ['description', '']]} />{verified && <p><Source href={sources.library}>Nguồn thư viện</Source> · <Source href={sources.overview}>Nguồn cơ sở vật chất</Source></p>}</section>
        {text(verified?.dormitory?.description) && <section className="ud-section"><h3>Ký túc xá</h3><p>{verified.dormitory.description}</p><Source href={sources.dormitory}>Nguồn ký túc xá</Source></section>}
      </>}
      {active === 'lien-he' && <section className="ud-section"><h3>Kênh liên hệ của trường</h3><dl className="ud-contact">{[['Website', contact.website, true], ['Trang tuyển sinh', contact.admissionsUrl, true], ['Điện thoại', profile.phone], ['Email', contact.email], ['Điện thoại tuyển sinh', contact.admissionsPhone], ['Email tuyển sinh', contact.admissionsEmail]].filter(([, value]) => text(value)).map(([label, value, url]) => <div key={label}><dt>{label}</dt><dd>{url ? <Source href={value}>{value}</Source> : value}</dd></div>)}</dl>{![contact.website, contact.admissionsUrl, profile.phone, contact.email, contact.admissionsPhone, contact.admissionsEmail].some(text) && <p className="ud-empty">{MISSING}</p>}{verified && <p className="ud-muted"><Source href={sources.contact}>Nguồn liên hệ chung</Source> · <Source href={sources.admissionsContact}>Nguồn liên hệ tuyển sinh</Source></p>}</section>}
    </div>
    <footer className="ud-detail-footer"><p>Thông tin tham khảo từ hồ sơ trường. Năm và nguồn được ghi tại từng mục.</p><Link to="/ai-tu-van" className="ud-ext-link">Tư vấn chọn trường với AI<ArrowRight size={14} aria-hidden="true" /></Link></footer>
  </div>
}
