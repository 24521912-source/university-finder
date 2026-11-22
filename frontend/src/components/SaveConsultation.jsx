import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { saveConsultation } from '../services/consultations'
import { getErrorMessage } from '../services/api'

// Nút lưu kết quả tư vấn vào tài khoản (WBS 6.7). Mỗi kết quả chỉ lưu một lần;
// trang AI tạo lại component (đổi key) khi người dùng tư vấn lần mới.
function SaveConsultation({ payload }) {
  const { user } = useAuth()
  const location = useLocation()
  const [state, setState] = useState({ status: 'idle' })

  if (!payload.results.length) return null

  if (!user) {
    return <div className="consult-save" role="note">
      <p>Đăng nhập để lưu kết quả này và xem lại trong trang Cá nhân.</p>
      <Link className="btn btn-outline" to="/dang-nhap" state={{ from: location }}>Đăng nhập</Link>
    </div>
  }

  async function save() {
    setState({ status: 'saving' })
    try {
      await saveConsultation(payload)
      setState({ status: 'saved' })
    } catch (error) {
      setState({ status: 'error', message: getErrorMessage(error) })
    }
  }

  return <div className="consult-save">
    {state.status === 'saved'
      ? <p role="status">Đã lưu {payload.results.length} trường gợi ý. <Link to="/ca-nhan?tab=lich-su-tu-van">Xem lịch sử tư vấn →</Link></p>
      : <p>Lưu top {payload.results.length} trường gợi ý để xem lại sau.</p>}
    {state.status !== 'saved' && <button type="button" className="btn btn-primary" onClick={save} disabled={state.status === 'saving'}>
      {state.status === 'saving' ? 'Đang lưu…' : 'Lưu kết quả tư vấn'}
    </button>}
    {state.status === 'error' && <p className="consult-field-error" role="alert">{state.message}</p>}
  </div>
}

export default SaveConsultation
