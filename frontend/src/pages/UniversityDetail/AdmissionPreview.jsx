import AdmissionDemo from './AdmissionDemo'
import './UniversityDetail.css'

export default function AdmissionPreview() {
  return <div className="university-detail"><div className="ud-shell">
    <div className="ud-page-heading"><p className="ud-eyebrow">XEM THỬ GIAO DIỆN</p><h1>Tuyển sinh</h1><p>Bản demo độc lập, không cần kết nối database. Trong trang trường, nội dung này nằm ở mục Tuyển sinh.</p></div>
    <AdmissionDemo base="/truong/kinh-te-tphcm" />
  </div></div>
}
