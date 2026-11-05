import { useRef, useState } from 'react'
import { normalizeSearch } from '../../utils/universityDetail'
import { safeUrl } from '../../utils/universityDetailPolicy'
import { buildMajorRows, paginateRows } from './majorRows'

export default function MajorAdmissions({ data }) {
  const all = buildMajorRows(data)
  const records = all.flatMap(row => row.scores)
  const years = [...new Set(records.map(row => row.year))].sort((a, b) => b - a)
  const methods = [...new Map(records.map(row => [row.kind.key, row.kind.label]))]
  const scales = [...new Set(records.map(row => row.scale))].sort((a, b) => a - b)
  const [filters, setFilters] = useState({ query: '', year: String(years[0] || ''), method: '', scale: '', page: 1, size: 10 })
  const tableRef = useRef(null)
  function update(key, value) {
    setFilters(previous => ({ ...previous, [key]: value, page: 1 }))
  }
  const filtered = all.filter(row => normalizeSearch(`${row.codes.join(' ')} ${row.name} ${row.description || ''} ${row.programs.join(' ')}`).includes(normalizeSearch(filters.query)))
    .map(row => ({ ...row, scores: row.scores.filter(score => (!filters.year || String(score.year) === filters.year) && (!filters.method || score.kind.key === filters.method) && (!filters.scale || String(score.scale) === filters.scale)) }))
  const result = paginateRows(filtered, filters.page, filters.size)
  const sources = [...new Set(result.rows.flatMap(row => row.sources).map(safeUrl).filter(Boolean))]
  const numbered = [...new Set([1, ...Array.from({ length: 3 }, (_, i) => result.page + i - 1).filter(page => page > 1 && page < result.pages), result.pages])]
  function go(page) {
    setFilters(previous => ({ ...previous, page }))
    tableRef.current?.focus({ preventScroll: true })
    tableRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
  return <>
    <div className="ud-filters">
      <label>Tên ngành, mã hoặc chương trình<input id="ud-catalog-search" className="input" type="search" placeholder="Nhập ngành bạn quan tâm…" value={filters.query} onChange={event => update('query', event.target.value)} /></label>
      <label>Năm điểm chuẩn<select className="input" value={filters.year} onChange={event => update('year', event.target.value)}><option value="">Tất cả năm</option>{years.map(year => <option key={year}>{year}</option>)}</select></label>
      <label>Phương thức<select className="input" value={filters.method} onChange={event => update('method', event.target.value)}><option value="">Tất cả phương thức</option>{methods.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label>Thang điểm<select className="input" value={filters.scale} onChange={event => update('scale', event.target.value)}><option value="">Tất cả thang</option>{scales.map(scale => <option key={scale}>{scale}</option>)}</select></label>
    </div>
    <p className="ud-muted">Điểm chuẩn chỉ để tham khảo, giữ nguyên thang điểm của từng phương thức. Dấu “—” nghĩa là chưa có điểm phù hợp với bộ lọc.</p>
    {data.admissionGroups && <p className="ud-notice">Các chương trình cùng ngành được gom trong một dòng; mỗi mức điểm vẫn gắn với mã tuyển sinh riêng. Nhóm tuyển chung được giữ nguyên, không suy ra điểm tuyển riêng cho từng ngành thành phần.</p>}
    <div className="ud-results-toolbar"><p className="ud-muted" role="status">Hiển thị {result.start}–{result.end} / {filtered.length} {data.admissionGroups ? 'ngành / nhóm ngành' : 'ngành'}</p><label>Số dòng / trang <select className="input" value={filters.size} onChange={event => update('size', Number(event.target.value))}>{[10, 20, 50].map(size => <option key={size}>{size}</option>)}</select></label></div>
    {!filtered.length ? <p className="ud-empty">{all.length ? 'Không tìm thấy ngành phù hợp với từ khóa.' : 'Chưa có dữ liệu ngành đào tạo.'}</p> : <>
      <div ref={tableRef} className="ud-table-scroll ud-admissions-scroll" role="region" aria-label="Bảng ngành đào tạo và điểm chuẩn" tabIndex={0}>
        <table className="ud-major-table ud-admissions-table">
          <caption>Ngành chưa có điểm chuẩn phù hợp vẫn được giữ trong danh sách.</caption>
          <thead><tr><th scope="col">{data.admissionGroups ? 'Mã tuyển sinh' : 'Mã ngành'}</th><th scope="col">Tên ngành / Nhóm ngành</th><th scope="col">Chương trình</th><th scope="col">Tổ hợp</th><th scope="col">Điểm chuẩn</th></tr></thead>
          <tbody>{result.rows.map(row => <tr key={row.id}>
            <td className="ud-catalog-code">{row.codes.map(code => <span className="ud-admission-code" key={code}>{code}</span>)}</td>
            <th scope="row">{row.name}{sources.length > 1 && <sup className="ud-source-markers">{[...new Set(row.sources.map(safeUrl).filter(Boolean))].map(url => <a key={url} href={`#ud-catalog-source-${sources.indexOf(url) + 1}`} aria-label={`Nguồn ${sources.indexOf(url) + 1}`}>[{sources.indexOf(url) + 1}]</a>)}</sup>}{row.description && <p className="ud-major-description">{row.description}</p>}</th>
            <td><ul className="ud-catalog-programs">{row.programs.map(program => <li key={program}>{program || <span className="ud-missing">Chương trình chưa ghi rõ</span>}</li>)}</ul></td>
            <td>{row.scores.some(score => score.combinations?.length) ? <ul className="ud-score-list">{row.scores.filter(score => score.combinations?.length).map((score, i) => <li key={i}>{score.combinations.join(', ')}<span>{score.program || 'Chương trình chưa ghi rõ'} · {score.year} · {score.kind.label}</span></li>)}</ul> : '—'}</td>
            <td><ul className="ud-score-list">{row.programs.map(program => {
              const scores = row.scores.filter(score => (score.program || '').trim() === program)
              return <li key={program}><span className="ud-score-program">{program || 'Chương trình chưa ghi rõ'}</span>{scores.length ? scores.map((score, i) => <div className="ud-program-score" key={i}><strong>{score.score.toLocaleString('vi-VN')}/{score.scale}</strong><span>{score.examCode && <>Mã tuyển sinh {score.examCode} · </>}{score.kind.label} · {score.year}</span></div>) : <span className="ud-missing">—</span>}</li>
            })}</ul></td>
          </tr>)}</tbody>
        </table>
      </div>
      <nav className="ud-pagination" aria-label="Phân trang ngành đào tạo"><button type="button" disabled={result.page === 1} onClick={() => go(result.page - 1)}>← Trước</button><div>{numbered.map((page, i) => <span key={page}>{i > 0 && page - numbered[i - 1] > 1 && <span className="ud-page-gap">…</span>}<button type="button" aria-label={`Trang ${page}`} aria-current={result.page === page ? 'page' : undefined} onClick={() => go(page)}>{page}</button></span>)}</div><button type="button" disabled={result.page === result.pages} onClick={() => go(result.page + 1)}>Sau →</button></nav>
      {sources.length > 0 && <div className="ud-catalog-sources" aria-label="Nguồn bảng ngành và điểm chuẩn"><p>Nguồn tham khảo</p><ul>{sources.map((url, i) => <li id={`ud-catalog-source-${i + 1}`} key={url}>{sources.length > 1 && `[${i + 1}] `}<a href={url} target="_blank" rel="noreferrer">{new URL(url).hostname}{sources.length > 1 ? ` · Tài liệu ${i + 1}` : ' · Thông tin ngành và điểm chuẩn'} ↗</a></li>)}</ul></div>}
    </>}
    {(data.hiddenMajors > 0 || data.hiddenAdmissions > 0) && <p className="ud-muted">Danh sách có thể chưa đầy đủ; một số bản ghi chưa đủ căn cứ xác minh nên chưa hiển thị.</p>}
  </>
}
