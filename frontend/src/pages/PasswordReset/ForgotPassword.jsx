import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { getErrorMessage } from '../../services/api'
import { requestPasswordReset } from '../../services/passwordReset'
import './PasswordReset.css'

// Bước 1: nhập email, backend gửi link đặt lại mật khẩu (có hạn 30 phút).
function ForgotPassword() {
  const location = useLocation()
  const [email, setEmail] = useState(() => (typeof location.state?.email === 'string' ? location.state.email : ''))
  const [sent, setSent] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      setSent(await requestPasswordReset(email.trim()))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="container">
        <div className="auth-card pr-done" role="status">
          <MailCheck className="pr-icon" size={40} aria-hidden="true" />
          <h1>Kiểm tra email</h1>
          <p>{sent}</p>
          <p className="muted">Email đã nhập: <b>{email.trim()}</b>. Liên kết chỉ dùng được một lần và hết hạn sau 30 phút.</p>
          <Link to="/dang-nhap" className="btn btn-primary btn-block">Quay lại đăng nhập</Link>
          <p className="auth-switch">
            Không nhận được?{' '}
            <button type="button" className="pr-link" onClick={() => setSent('')}>Gửi lại</button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Quên mật khẩu</h1>
        <p className="muted">Nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết để bạn đặt mật khẩu mới.</p>

        {error && <div className="alert-error" role="alert">{error}</div>}

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="input" autoComplete="email" required autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Đang gửi…' : 'Gửi liên kết đặt lại'}
        </button>
        <p className="auth-switch">
          Nhớ ra mật khẩu? <Link to="/dang-nhap">Đăng nhập</Link>
        </p>
      </form>
    </div>
  )
}

export default ForgotPassword
