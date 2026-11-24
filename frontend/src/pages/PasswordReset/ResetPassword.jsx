import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { isResetToken, passwordProblem, MIN_PASSWORD } from '../../features/auth/passwordReset'
import { getErrorMessage } from '../../services/api'
import { isAdmin } from '../../utils/roles'
import './PasswordReset.css'

// Bước 2: mở từ link trong email (/dat-lai-mat-khau?token=...), đặt mật khẩu mới rồi đăng nhập luôn.
function ResetPassword() {
  const { resetPassword } = useAuth()
  const [params] = useSearchParams()
  const token = params.get('token')
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [account, setAccount] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    const problem = passwordProblem(form.password, form.confirm)
    if (problem) return setError(problem)
    setError('')
    setSubmitting(true)
    try {
      setAccount(await resetPassword(token, form.password))
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  if (!isResetToken(token)) {
    return (
      <div className="container">
        <div className="auth-card pr-done">
          <h1>Liên kết không hợp lệ</h1>
          <p className="muted">Liên kết đặt lại mật khẩu bị thiếu hoặc sai. Hãy mở lại đúng liên kết trong email, hoặc yêu cầu liên kết mới.</p>
          <Link to="/quen-mat-khau" className="btn btn-primary btn-block">Yêu cầu liên kết mới</Link>
        </div>
      </div>
    )
  }

  if (account) {
    return (
      <div className="container">
        <div className="auth-card pr-done" role="status">
          <CircleCheck className="pr-icon pr-icon-ok" size={40} aria-hidden="true" />
          <h1>Đã đổi mật khẩu</h1>
          <p className="muted">Bạn đã được đăng nhập bằng mật khẩu mới. Các thiết bị khác đang đăng nhập tài khoản này đã bị đăng xuất.</p>
          <Link to={isAdmin(account) ? '/admin' : '/ca-nhan'} className="btn btn-primary btn-block">
            {isAdmin(account) ? 'Vào trang quản trị' : 'Vào trang cá nhân'}
          </Link>
          <p className="auth-switch"><Link to="/">Về trang chủ</Link></p>
        </div>
      </div>
    )
  }

  const expired = error && /hết hạn|không hợp lệ/.test(error)

  return (
    <div className="container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Đặt mật khẩu mới</h1>
        <p className="muted">Chọn mật khẩu mới cho tài khoản của bạn (tối thiểu {MIN_PASSWORD} ký tự).</p>

        {error && (
          <div className="alert-error" role="alert">
            {error}
            {expired && <><br /><Link to="/quen-mat-khau">Yêu cầu liên kết mới →</Link></>}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="password">Mật khẩu mới</label>
          <input id="password" name="password" type="password" className="input" autoComplete="new-password" required autoFocus
            minLength={MIN_PASSWORD} value={form.password} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="confirm">Nhập lại mật khẩu mới</label>
          <input id="confirm" name="confirm" type="password" className="input" autoComplete="new-password" required
            value={form.confirm} onChange={handleChange} />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Đang lưu…' : 'Lưu mật khẩu mới'}
        </button>
      </form>
    </div>
  )
}

export default ResetPassword
