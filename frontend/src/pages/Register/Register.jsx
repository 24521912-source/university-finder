import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { getErrorMessage } from '../../services/api'
import Sticker from '../../components/Sticker'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return setError('Mật khẩu nhập lại không khớp')

    setError('')
    setSubmitting(true)
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password })
      navigate('/profile', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <Sticker name="book" size={64} tilt={-10} className="auth-sticker" />
        <h1>Đăng ký</h1>
        <p className="muted">Tạo tài khoản miễn phí để lưu trường và tiêu chí tư vấn.</p>

        {error && <div className="alert-error" role="alert">{error}</div>}

        <div className="form-field">
          <label htmlFor="fullName">Họ và tên</label>
          <input id="fullName" name="fullName" className="input" autoComplete="name" required
            value={form.fullName} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" required
            value={form.email} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="password">Mật khẩu (tối thiểu 6 ký tự)</label>
          <input id="password" name="password" type="password" className="input" autoComplete="new-password" required minLength={6}
            value={form.password} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
          <input id="confirmPassword" name="confirmPassword" type="password" className="input" autoComplete="new-password" required
            value={form.confirmPassword} onChange={handleChange} />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Đang tạo tài khoản…' : 'Đăng ký'}
        </button>
        <p className="auth-switch">
          Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
