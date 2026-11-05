import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { demoMethods } from './admissionDemoData'

export default function AdmissionMethods({ base, year }) {
  return <section className="ud-section ad-section" aria-labelledby="ad-methods-title">
    <div className="ad-section-heading"><div><p className="ad-kicker">CHỌN CÁCH XÉT TUYỂN</p><h3 id="ad-methods-title">Phương thức & điều kiện</h3></div><span className="ad-sample-tag">3 phương thức mẫu · {year}</span></div>
    <p className="ad-description">So sánh đối tượng, điều kiện, cách xét và thời gian đăng ký ngay trong bảng.</p>
    <div className="ad-method-demo-note"><strong>Các ngưỡng điểm, ngành, công thức và thời hạn dưới đây đều là giả định.</strong> Nội dung được tạo để duyệt cách trình bày, không phải chính sách của trường.</div>
    <div className="ud-table-scroll" role="region" aria-label="So sánh các phương thức xét tuyển minh họa" tabIndex={0}>
      <table className="ad-method-table ad-method-comparison">
        <caption>Ngưỡng nhận đăng ký không đồng nghĩa với điểm chuẩn trúng tuyển. Không sử dụng dữ liệu minh họa để đăng ký thực tế.</caption>
        <thead><tr><th scope="col">Phương thức</th><th scope="col">Đối tượng & điều kiện</th><th scope="col">Cách xét tuyển</th><th scope="col">Ngành áp dụng</th><th scope="col">Thời gian & kênh đăng ký</th></tr></thead>
        <tbody>{demoMethods.map(method => <tr key={method.id}>
            <th scope="row"><span className="ad-method-tag">{method.tag}</span><strong>{method.name}</strong></th>
            <td><p className="ad-method-audience">{method.audience}</p><ul className="ad-requirements">{method.requirements.map(requirement => <li key={requirement}>{requirement}</li>)}</ul></td>
            <td>{method.calculation}</td>
            <td>{method.scope}</td>
            <td><span className="ad-deadline">Hạn mẫu: {method.deadline}/{year}</span><p className="ad-registration-range">{method.period[0]}/{year} – {method.period[1]}/{year}</p><p className="ad-registration-channel">{method.portal}</p><p className="ad-registration-separate">{method.separateRegistration}</p></td>
          </tr>)}</tbody>
      </table>
    </div>
    <p className="ad-source-note">Nguồn: nội dung mẫu do dự án tạo để duyệt giao diện. Chưa có nguồn tuyển sinh chính thức xác nhận các ví dụ này.</p>
    <Link className="ad-text-link" to={`${base}/nganh-dao-tao`}>Xem ngành đào tạo & điểm chuẩn trong hồ sơ <ArrowUpRight size={15} aria-hidden="true" /></Link>
  </section>
}
