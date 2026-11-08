import { useEffect, useState } from 'react'
import { getErrorMessage } from '../../services/api'
import { listUniversities } from '../../services/admin'
import { INSTITUTION_TYPE_LABEL } from '../../utils/format'
import UniversityEditor from './UniversityEditor'

// Tab Dữ liệu trường: danh sách trường trong MongoDB, bấm Sửa để chỉnh và lưu thẳng vào database.
function UniversitiesAdmin() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // slug đang sửa, '' = thêm mới
  const [reload, setReload] = useState(0)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    listUniversities({ q: search, page }, controller.signal)
      .then((d) => { setData(d); setError('') })
      .catch((e) => { if (!controller.signal.aborted) setError(getErrorMessage(e)) })
    return () => controller.abort()
  }, [search, page, reload])

  function done(message) {
    setEditing(null)
    setNotice(message)
    setReload((n) => n + 1)
  }

  if (editing !== null) {
    return <UniversityEditor slug={editing} onClose={() => setEditing(null)} onDone={done} />
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <div>
      <div className="admin-head">
        <p className="muted">Mọi thay đổi được lưu thẳng vào MongoDB và hiện ngay trên trang Trường, Chi tiết và AI tư vấn.</p>
        <button type="button" className="btn btn-primary" onClick={() => { setNotice(''); setEditing('') }}>+ Thêm trường</button>
      </div>

      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <form className="admin-search" onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(query) }}>
        <input className="input" type="search" placeholder="Tìm theo tên, tên viết tắt hoặc slug" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="submit" className="btn btn-outline">Tìm</button>
      </form>

      {error && <div className="alert-error" role="alert">{error}</div>}
      {!data && !error && <p role="status">Đang tải…</p>}

      {data && <>
        <p className="muted">{data.total} trường</p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Tên trường</th><th>Loại</th><th>Khu vực</th><th>Số ngành</th><th>Mức dữ liệu</th><th></th></tr></thead>
            <tbody>
              {data.items.map((u) => <tr key={u.slug}>
                <td><strong>{u.name}</strong><div className="muted admin-small">{u.shortName ? `${u.shortName} · ` : ''}{u.slug}</div></td>
                <td>{INSTITUTION_TYPE_LABEL[u.institutionType] || u.institutionType}</td>
                <td>{u.district || '—'}</td>
                <td>{u.majorCount}</td>
                <td>{u.dataLevel}</td>
                <td><button type="button" className="btn btn-outline" onClick={() => { setNotice(''); setEditing(u.slug) }}>Sửa</button></td>
              </tr>)}
              {!data.items.length && <tr><td colSpan="6" className="muted">Không có trường nào khớp.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="admin-pager">
          <button type="button" className="btn btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Trước</button>
          <span>Trang {page}/{pages}</span>
          <button type="button" className="btn btn-outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Sau →</button>
        </div>
      </>}
    </div>
  )
}

export default UniversitiesAdmin
