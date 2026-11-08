import { useEffect, useMemo, useState } from 'react'
import { getErrorMessage } from '../../services/api'
import { createUniversity, deleteUniversity, getUniversity, listMajors, updateUniversity } from '../../services/admin'

const EMPTY = {
  slug: '', name: '', shortName: '', institutionType: 'public', belongsToUniversitySystem: false,
  dataLevel: 1, foundedYear: '', description: '',
  address: { full: '', ward: '', district: '', city: 'TP. Hồ Chí Minh' },
  contact: { website: '', phone: '', email: '', admissionsUrl: '' },
  media: { logoUrl: '' },
  majors: [], tuition: [], admissions: [],
}

const METHODS = { high_school_exam: 'Điểm thi THPT', competency_assessment: 'ĐGNL', transcript: 'Học bạ', direct: 'Xét thẳng', other: 'Khác' }
const UNITS = { year: 'Năm', semester: 'Học kỳ', credit: 'Tín chỉ', program: 'Toàn khóa' }

const num = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v))

// Cột của 3 bảng con. type: text | number | select | list (chuỗi cách nhau dấu phẩy -> mảng)
const MAJOR_COLS = [
  { key: 'code', label: 'Mã ngành', type: 'text', list: 'admin-major-codes', width: 110 },
  { key: 'name', label: 'Tên ngành', type: 'text', width: 260 },
  { key: 'durationYears', label: 'Số năm', type: 'number', width: 80 },
]
const TUITION_COLS = [
  { key: 'academicYear', label: 'Năm học', type: 'text', width: 100, placeholder: '2026-2027' },
  { key: 'program', label: 'Chương trình', type: 'text', width: 170 },
  { key: 'majorCode', label: 'Mã ngành (trống = cả trường)', type: 'text', list: 'admin-own-codes', width: 120 },
  { key: 'amountMin', label: 'Từ (đ)', type: 'number', width: 120 },
  { key: 'amountMax', label: 'Đến (đ)', type: 'number', width: 120 },
  { key: 'unit', label: 'Đơn vị', type: 'select', options: UNITS, width: 100 },
  { key: 'sourceUrl', label: 'Link nguồn', type: 'text', width: 200 },
  { key: 'note', label: 'Ghi chú', type: 'text', width: 180 },
]
const ADMISSION_COLS = [
  { key: 'year', label: 'Năm', type: 'number', width: 70 },
  { key: 'method', label: 'Phương thức', type: 'select', options: METHODS, width: 130 },
  { key: 'majorCode', label: 'Mã ngành', type: 'text', list: 'admin-own-codes', width: 110 },
  { key: 'program', label: 'Chương trình (trống = chuẩn)', type: 'text', width: 160 },
  { key: 'combinations', label: 'Tổ hợp (A00, A01)', type: 'list', width: 120 },
  { key: 'score', label: 'Điểm', type: 'number', width: 80 },
  { key: 'scale', label: 'Thang', type: 'number', width: 70 },
  { key: 'quota', label: 'Chỉ tiêu', type: 'number', width: 80 },
  { key: 'sourceUrl', label: 'Link nguồn', type: 'text', width: 200 },
]
const NEW_ROW = {
  majors: { code: '', name: '' },
  tuition: { academicYear: '2026-2027', program: 'Chương trình chuẩn', unit: 'year' },
  admissions: { year: new Date().getFullYear(), method: 'high_school_exam', scale: 30, combinations: [] },
}

function RowTable({ title, cols, rows, onChange, newRow, help }) {
  const [filter, setFilter] = useState('')
  const shown = rows.map((row, index) => ({ row, index }))
    .filter(({ row }) => !filter || JSON.stringify(row).toLowerCase().includes(filter.toLowerCase()))

  const setCell = (index, col, raw) => {
    const value = col.type === 'number' ? num(raw) : col.type === 'list' ? raw.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean) : raw
    onChange(rows.map((r, i) => (i === index ? { ...r, [col.key]: value } : r)))
  }

  return (
    <fieldset className="admin-section">
      <legend>{title} ({rows.length})</legend>
      {help && <p className="muted admin-small">{help}</p>}
      <div className="admin-row-tools">
        <input className="input" type="search" placeholder="Lọc dòng (mã ngành, năm…)" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button type="button" className="btn btn-outline" onClick={() => { setFilter(''); onChange([...rows, { ...newRow }]) }}>+ Thêm dòng</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table admin-edit-table">
          <thead><tr>{cols.map((c) => <th key={c.key} style={{ minWidth: c.width }}>{c.label}</th>)}<th></th></tr></thead>
          <tbody>
            {shown.map(({ row, index }) => <tr key={row._id || `new-${index}`}>
              {cols.map((c) => <td key={c.key}>
                {c.type === 'select'
                  ? <select className="input" value={row[c.key] ?? ''} onChange={(e) => setCell(index, c, e.target.value)}>
                    {Object.entries(c.options).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  : <input className="input" aria-label={c.label} list={c.list} placeholder={c.placeholder}
                    type={c.type === 'number' ? 'number' : 'text'} step="any"
                    value={c.type === 'list' ? (row[c.key] || []).join(', ') : (row[c.key] ?? '')}
                    onChange={(e) => setCell(index, c, e.target.value)} />}
              </td>)}
              <td><button type="button" className="btn admin-danger-link" onClick={() => onChange(rows.filter((_, i) => i !== index))}>Xóa</button></td>
            </tr>)}
            {!shown.length && <tr><td colSpan={cols.length + 1} className="muted">Chưa có dòng nào.</td></tr>}
          </tbody>
        </table>
      </div>
    </fieldset>
  )
}

function UniversityEditor({ slug, onClose, onDone }) {
  const isNew = slug === ''
  const [form, setForm] = useState(isNew ? EMPTY : null)
  const [catalog, setCatalog] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [evidenceText, setEvidenceText] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    listMajors(controller.signal).then(setCatalog).catch(() => {})
    if (!isNew) {
      getUniversity(slug, controller.signal)
        .then((u) => {
          setEvidenceText(u.detailEvidence ? JSON.stringify(u.detailEvidence, null, 2) : null)
          setForm({ ...EMPTY, ...u, address: { ...EMPTY.address, ...u.address }, contact: { ...EMPTY.contact, ...u.contact }, media: { ...EMPTY.media, ...u.media } })
        })
        .catch((e) => { if (!controller.signal.aborted) setError(getErrorMessage(e)) })
    }
    return () => controller.abort()
  }, [slug, isNew])

  const catalogNames = useMemo(() => new Map(catalog.map((m) => [m.code, m.name])), [catalog])

  if (!form) return error ? <div className="alert-error" role="alert">{error} <button type="button" className="btn btn-outline" onClick={onClose}>Quay lại</button></div> : <p role="status">Đang tải…</p>

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const setIn = (group, key, value) => setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }))

  function setMajors(rows) {
    // Gõ mã ngành có trong danh mục thì tự điền tên nếu còn trống.
    set('majors', rows.map((m) => (m.code && !m.name && catalogNames.has(m.code) ? { ...m, name: catalogNames.get(m.code) } : m)))
  }

  async function save(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    const payload = { ...form, foundedYear: num(form.foundedYear), dataLevel: Number(form.dataLevel) }
    if (evidenceText !== null) {
      try {
        payload.detailEvidence = JSON.parse(evidenceText)
      } catch {
        setError('Dữ liệu duyệt riêng không phải JSON hợp lệ.')
        setSaving(false)
        return
      }
    }
    for (const key of ['_id', '__v', 'createdAt', 'updatedAt', 'favoriteCount']) delete payload[key]
    try {
      const saved = isNew ? await createUniversity(payload) : await updateUniversity(slug, payload)
      onDone(`Đã lưu "${saved.name}" vào database.`)
    } catch (e) {
      setError(getErrorMessage(e))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!window.confirm(`Xóa hẳn "${form.name}" khỏi database? Không thể hoàn tác.`)) return
    try {
      await deleteUniversity(slug)
      onDone(`Đã xóa "${form.name}".`)
    } catch (e) {
      setError(getErrorMessage(e))
    }
  }

  const ownCodes = form.majors.map((m) => m.code).filter(Boolean)
  const text = (label, value, onChange, props = {}) => <label className="admin-field"><span>{label}</span>
    <input className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...props} /></label>

  return (
    <form className="admin-editor" onSubmit={save}>
      <div className="admin-head">
        <div>
          <button type="button" className="btn btn-outline" onClick={onClose}>← Danh sách</button>
          <h1 className="page-title">{isNew ? 'Thêm trường mới' : form.name}</h1>
        </div>
      </div>
      {error && <div className="alert-error" role="alert">{error}</div>}

      <datalist id="admin-major-codes">{catalog.map((m) => <option key={m.code} value={m.code}>{m.name}</option>)}</datalist>
      <datalist id="admin-own-codes">{form.majors.filter((m) => m.code).map((m) => <option key={m.code} value={m.code}>{m.name}</option>)}</datalist>

      <fieldset className="admin-section">
        <legend>Thông tin cơ bản</legend>
        <div className="admin-grid">
          {text('Tên trường *', form.name, (v) => set('name', v), { required: true })}
          {text('Tên viết tắt', form.shortName, (v) => set('shortName', v))}
          {text('Slug (đường dẫn) *', form.slug, (v) => set('slug', v.toLowerCase()), { required: true, pattern: '[a-z0-9]+(-[a-z0-9]+)*', title: 'Chữ thường không dấu, số, dấu gạch ngang' })}
          <label className="admin-field"><span>Loại trường</span>
            <select className="input" value={form.institutionType} onChange={(e) => set('institutionType', e.target.value)}>
              <option value="public">Công lập</option><option value="private">Tư thục</option><option value="international">Quốc tế</option><option value="other">Khác</option>
            </select></label>
          <label className="admin-field"><span>Mức dữ liệu</span>
            <select className="input" value={form.dataLevel} onChange={(e) => set('dataLevel', e.target.value)}>
              <option value="1">1 — thông tin cơ bản</option><option value="2">2 — có ngành/học phí/điểm</option><option value="3">3 — đầy đủ</option>
            </select></label>
          {text('Năm thành lập', form.foundedYear, (v) => set('foundedYear', v), { type: 'number' })}
          <label className="admin-field admin-check"><input type="checkbox" checked={!!form.belongsToUniversitySystem} onChange={(e) => set('belongsToUniversitySystem', e.target.checked)} /> Thuộc ĐHQG-HCM</label>
        </div>
        <label className="admin-field"><span>Mô tả</span>
          <textarea className="input" rows="4" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} /></label>
        {!isNew && slug !== form.slug && <p className="admin-small admin-warn">Đổi slug sẽ đổi đường dẫn trang trường và có thể làm hỏng link cũ.</p>}
      </fieldset>

      <fieldset className="admin-section">
        <legend>Địa chỉ và liên hệ</legend>
        <div className="admin-grid">
          {text('Địa chỉ đầy đủ', form.address.full, (v) => setIn('address', 'full', v))}
          {text('Phường', form.address.ward, (v) => setIn('address', 'ward', v))}
          {text('Quận / khu vực (dùng cho AI tư vấn)', form.address.district, (v) => setIn('address', 'district', v), { placeholder: 'Quận 10' })}
          {text('Thành phố', form.address.city, (v) => setIn('address', 'city', v))}
          {text('Website', form.contact.website, (v) => setIn('contact', 'website', v))}
          {text('Trang tuyển sinh', form.contact.admissionsUrl, (v) => setIn('contact', 'admissionsUrl', v))}
          {text('Điện thoại', form.contact.phone, (v) => setIn('contact', 'phone', v))}
          {text('Email', form.contact.email, (v) => setIn('contact', 'email', v))}
          {text('Link logo', form.media.logoUrl, (v) => setIn('media', 'logoUrl', v))}
        </div>
      </fieldset>

      <RowTable title="Ngành đào tạo" cols={MAJOR_COLS} rows={form.majors} onChange={setMajors} newRow={NEW_ROW.majors}
        help="Mã ngành phải có trong danh mục ngành (gõ để xem gợi ý). Gõ mã đúng thì tên ngành tự điền." />
      <RowTable title="Học phí" cols={TUITION_COLS} rows={form.tuition} onChange={(rows) => set('tuition', rows)} newRow={NEW_ROW.tuition}
        help={`Mã ngành phải thuộc danh sách ngành ở trên${ownCodes.length ? '' : ' (hiện chưa có ngành nào)'}. Nên luôn có link nguồn chính thức.`} />
      <RowTable title="Điểm chuẩn" cols={ADMISSION_COLS} rows={form.admissions} onChange={(rows) => set('admissions', rows)} newRow={NEW_ROW.admissions}
        help="THPT thang 30, ĐGNL thang 1200. AI tư vấn chỉ so điểm khi có nguồn đã xác minh trong cấu hình." />

      {evidenceText !== null && <fieldset className="admin-section">
        <legend>Dữ liệu duyệt riêng (JSON nâng cao)</legend>
        <p className="muted admin-small">Trang chi tiết dùng để chọn bản ghi đã duyệt (theo _id), nhóm mã xét tuyển và link nguồn. Dòng điểm chuẩn / học phí mới thêm sẽ chỉ hiện trên trang chi tiết khi được thêm vào đây. Sửa sai cú pháp thì không lưu được.</p>
        <textarea className="input admin-json" rows="16" spellCheck="false" value={evidenceText} onChange={(e) => setEvidenceText(e.target.value)} />
      </fieldset>}

      <div className="admin-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu vào database'}</button>
        <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
        {!isNew && <button type="button" className="btn admin-danger" onClick={remove}>Xóa trường</button>}
      </div>
    </form>
  )
}

export default UniversityEditor
