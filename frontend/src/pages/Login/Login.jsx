import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { getErrorMessage } from '../../services/api'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form.email, form.password)
      // Quay lại trang người dùng định vào trước khi bị yêu cầu đăng nhập
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>
        <p className="muted">Đăng nhập để lưu trường yêu thích và lịch sử tư vấn.</p>

        {error && <div className="alert-error" role="alert">{error}</div>}

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" required
            value={form.email} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="password">Mật khẩu</label>
          <input id="password" name="password" type="password" className="input" autoComplete="current-password" required
            value={form.password} onChange={handleChange} />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/dang-ky">Đăng ký</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
