import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ClipboardList, LockKeyhole, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { demoDocuments } from './admissionDemoData'
import { addDocument, checklistKey, readChecklist } from './checklistStorage'

function PersonalChecklist({ storageKey }) {
  const [state, setState] = useState(() => {
    try { return readChecklist(window.localStorage, storageKey) } catch { return { checked: [], custom: [] } }
  })
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState(false)
  const basic = demoDocuments.map((label, index) => ({ id: `basic-${index}`, label }))
  const total = basic.length + state.custom.length
  function save(next) {
    setState(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setSaveError(false) } catch { setSaveError(true) }
  }
  function toggle(id) {
    save({ ...state, checked: state.checked.includes(id) ? state.checked.filter(item => item !== id) : [...state.checked, id] })
  }
  function submit(event) {
    event.preventDefault()
    const result = addDocument(state, label, `custom-${crypto.randomUUID()}`, demoDocuments)
    if (result.error) { setError(result.error); return }
    save(result.state)
    setLabel(''); setError(''); setAdding(false)
  }
  function remove(id) {
    save({ custom: state.custom.filter(item => item.id !== id), checked: state.checked.filter(item => item !== id) })
  }
  function item(document, custom = false) {
    return <li key={document.id}><label><input type="checkbox" checked={state.checked.includes(document.id)} onChange={() => toggle(document.id)} /><span>{document.label}</span></label>{custom && <button type="button" className="ad-remove-document" onClick={() => remove(document.id)} aria-label={`Xóa ${document.label}`}><Trash2 size={15} aria-hidden="true" /></button>}</li>
  }
  return <div className="ad-checklist ad-personal-checklist">
    <p className="ad-check-count" role="status">Đã chuẩn bị {state.checked.length}/{total} mục</p>
    <div className="ad-progress" role="progressbar" aria-label="Tiến độ chuẩn bị hồ sơ" aria-valuenow={state.checked.length} aria-valuemin={0} aria-valuemax={total}><span style={{ width: `${state.checked.length / total * 100}%` }} /></div>
    <h4>Giấy tờ cơ bản</h4><ul>{basic.map(document => item(document))}</ul>
    <div className="ad-custom-heading"><h4>Giấy tờ bổ sung của bạn</h4>{!adding && <button type="button" className="ad-add-document" onClick={() => setAdding(true)}><Plus size={16} aria-hidden="true" />Thêm giấy tờ</button>}</div>
    <p className="ad-description">Tự thêm các giấy tờ mà trường hoặc phương thức bạn chọn yêu cầu. Mục tự thêm chỉ xuất hiện trong checklist của bạn.</p>
    {state.custom.length > 0 ? <ul className="ad-custom-documents">{state.custom.map(document => item(document, true))}</ul> : <p className="ad-empty-custom">Chưa có giấy tờ bổ sung.</p>}
    {adding && <form className="ad-add-form" onSubmit={submit}><label htmlFor="ad-document-name">Tên giấy tờ cần bổ sung</label><input id="ad-document-name" type="text" className="input" value={label} onChange={event => { setLabel(event.target.value); setError('') }} placeholder="Ví dụ: Chứng chỉ ngoại ngữ" maxLength={120} autoFocus aria-invalid={Boolean(error)} aria-describedby={error ? 'ad-document-error' : undefined} />{error && <p id="ad-document-error" role="alert">{error}</p>}<div><button type="submit" className="ad-add-document">Thêm vào hồ sơ</button><button type="button" className="ad-cancel-document" onClick={() => { setAdding(false); setLabel(''); setError('') }}>Hủy</button></div></form>}
    <p className="ad-source-note">Bản demo lưu checklist trên trình duyệt này, riêng theo tài khoản, trường và năm. Chưa đồng bộ lên tài khoản hoặc database.</p>
    {saveError && <p className="ad-storage-error" role="alert">Trình duyệt chưa lưu được thay đổi. Các mục hiện tại chỉ được giữ trong lần mở trang này.</p>}
  </div>
}

export default function AdmissionChecklist({ base, year }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const accountId = user?.id || user?._id
  return <section className="ud-section ad-section" aria-labelledby="ad-checklist-title">
    <div className="ad-section-heading"><div><h3 id="ad-checklist-title">Hồ sơ cơ bản</h3></div><ClipboardList size={22} aria-hidden="true" /></div>
    <p className="ad-description">Danh sách tham khảo những giấy tờ thường cần. Mỗi trường và phương thức có thể yêu cầu thêm giấy tờ khác; đối chiếu thông báo chính thức trước khi nộp.</p>
    {loading ? <p className="ad-description" role="status">Đang kiểm tra đăng nhập…</p> : accountId ? <PersonalChecklist key={checklistKey(accountId, base, year)} storageKey={checklistKey(accountId, base, year)} /> : <div className="ad-checklist-login"><LockKeyhole size={28} aria-hidden="true" /><h4>Theo dõi hồ sơ của riêng bạn</h4><p>Đăng nhập để đánh dấu giấy tờ đã chuẩn bị và thêm những mục bạn cần bổ sung.</p><Link to="/dang-nhap" state={{ from: { pathname: location.pathname, search: location.search } }} className="ad-primary-link">Đăng nhập để theo dõi hồ sơ</Link></div>}
  </section>
}
