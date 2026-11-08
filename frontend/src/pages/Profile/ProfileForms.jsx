import { useState } from 'react'
import { getErrorMessage } from '../../services/api'
import { changePassword, updateProfile } from '../../services/account'

// Form sửa họ tên. onSaved(user) nhận thông tin tài khoản mới từ backend.
export function EditProfileForm({ user, onSaved, onCancel }) {
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!fullName.trim()) return setError('Vui lòng nhập họ tên')
    setSaving(true)
    setError('')
    try {
      onSaved(await updateProfile({ fullName: fullName.trim() }))
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return <form className="up-form" onSubmit={submit} noValidate>
    <label htmlFor="up-fullname">Họ và tên</label>
    <input id="up-fullname" className="up-input" value={fullName} maxLength={100} autoComplete="name" autoFocus
      onChange={(e) => setFullName(e.target.value)} aria-invalid={!!error} aria-describedby={error ? 'up-fullname-error' : undefined} />
    <p className="up-form-help">Email đăng nhập không thay đổi được.</p>
    {error && <p id="up-fullname-error" className="up-form-error" role="alert">{error}</p>}
    <div className="up-form-actions">
      <button type="submit" className="up-button up-button-primary" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
      <button type="button" className="up-button up-button-outline" onClick={onCancel} disabled={saving}>Hủy</button>
    </div>
  </form>
}

const EMPTY = { currentPassword: '', newPassword: '', confirm: '' }

export function ChangePasswordForm({ onDone, onCancel }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(event) {
    event.preventDefault()
    if (!form.currentPassword) return setError('Vui lòng nhập mật khẩu hiện tại')
    if (form.newPassword.length < 6) return setError('Mật khẩu mới tối thiểu 6 ký tự')
    if (form.newPassword !== form.confirm) return setError('Mật khẩu nhập lại không khớp')
    if (form.newPassword === form.currentPassword) return setError('Mật khẩu mới phải khác mật khẩu hiện tại')
    setSaving(true)
    setError('')
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setForm(EMPTY)
      onDone()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const field = (key, label, autoComplete) => <>
    <label htmlFor={`up-${key}`}>{label}</label>
    <input id={`up-${key}`} className="up-input" type="password" value={form[key]} autoComplete={autoComplete} onChange={set(key)} />
  </>

  return <form className="up-form" onSubmit={submit} noValidate>
    {field('currentPassword', 'Mật khẩu hiện tại', 'current-password')}
    {field('newPassword', 'Mật khẩu mới (tối thiểu 6 ký tự)', 'new-password')}
    {field('confirm', 'Nhập lại mật khẩu mới', 'new-password')}
    {error && <p className="up-form-error" role="alert">{error}</p>}
    <div className="up-form-actions">
      <button type="submit" className="up-button up-button-primary" disabled={saving}>{saving ? 'Đang lưu…' : 'Đổi mật khẩu'}</button>
      <button type="button" className="up-button up-button-outline" onClick={onCancel} disabled={saving}>Hủy</button>
    </div>
  </form>
}
