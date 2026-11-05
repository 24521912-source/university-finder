import { feeText, text } from '../../utils/universityDetail'
import { safeUrl } from '../../utils/universityDetailPolicy'

export default function TuitionTable({ data }) {
  const sources = [...new Set(data.tuition.map(fee => safeUrl(fee.sourceUrl)).filter(Boolean))]
  const majors = new Map(data.majors.map(major => [major.code, major.name]))
  const units = [['semester', 'Theo học kỳ'], ['year', 'Theo năm'], ['credit', 'Theo tín chỉ']]
  if (data.tuition.some(fee => fee.unit === 'program')) units.push(['program', 'Toàn khóa'])
  return <section className="ud-section">
    <h3>Học phí theo chương trình</h3>
    <p className="ud-muted">Học phí theo từng chương trình và năm học, tách riêng mức theo học kỳ, theo năm và theo tín chỉ. Dấu “—” nghĩa là chưa có mức phí theo đơn vị đó trong dữ liệu; không tự quy đổi giữa các đơn vị.</p>
    {data.tuition.length ? <>
      <div className="ud-table-scroll" role="region" aria-label="Bảng học phí theo chương trình" tabIndex={0}>
        <table className="ud-major-table ud-tuition-table">
          <caption>Giữ nguyên đơn vị tính trong nguồn; không quy đổi học phí tín chỉ hoặc học kỳ thành học phí cả năm.</caption>
          <thead><tr><th scope="col">Chương trình</th><th scope="col">Năm học</th>{units.map(([unit, label]) => <th scope="col" key={unit}>{label}</th>)}<th scope="col">Phạm vi áp dụng & ghi chú</th></tr></thead>
          <tbody>{data.tuition.map((fee, i) => {
            const sourceIndex = sources.indexOf(safeUrl(fee.sourceUrl))
            return <tr key={fee._id || i}>
              <th scope="row">{text(fee.program) || 'Chương trình chưa ghi rõ'}{sources.length > 1 && sourceIndex >= 0 && <sup className="ud-source-markers"><a href={`#ud-tuition-source-${sourceIndex + 1}`} aria-label={`Nguồn ${sourceIndex + 1}`}>[{sourceIndex + 1}]</a></sup>}{fee.restrictedDiscount && <span className="ud-tuition-discount">Ưu đãi có điều kiện</span>}</th>
              <td>{fee.academicYear}</td>
              {units.map(([unit]) => <td key={unit} className="ud-tuition-amount">{fee.unit === unit ? <strong>{feeText(fee)}</strong> : <span className="ud-missing">—</span>}</td>)}
              <td>{fee.majorCode && <p className="ud-tuition-scope">{majors.get(fee.majorCode) || 'Mã ngành'} · {fee.majorCode}</p>}{text(fee.note) ? <p className="ud-tuition-note">{fee.note}</p> : <span className="ud-missing">Chưa có ghi chú riêng.</span>}</td>
            </tr>
          })}</tbody>
        </table>
      </div>
      {sources.length > 0 && <div className="ud-catalog-sources" aria-label="Nguồn bảng học phí"><p>Nguồn học phí</p><ul>{sources.map((url, i) => <li id={`ud-tuition-source-${i + 1}`} key={url}>{sources.length > 1 && `[${i + 1}] `}<a href={url} target="_blank" rel="noreferrer">{new URL(url).hostname}{sources.length > 1 ? ` · Tài liệu ${i + 1}` : ' · Thông tin học phí theo chương trình'} ↗</a></li>)}</ul></div>}
    </> : <p className="ud-empty">Chưa có dữ liệu học phí đủ căn cứ để hiển thị.</p>}
    {data.hiddenTuition > 0 && <p className="ud-muted">Một số mức phí chưa đủ căn cứ về nguồn, năm học, đơn vị hoặc phạm vi áp dụng nên chưa hiển thị.</p>}
  </section>
}
