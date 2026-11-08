import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getErrorMessage } from '../../services/api'
import { addFavorite, removeFavorite } from '../../services/favorites'

const idOf = (item) => (typeof item === 'string' ? item : item?._id)

// Dùng chung cho thẻ trường, trang chi tiết, trang cá nhân.
// const { isFavorite, toggle, countOf, error } = useFavorites()
// - Chưa đăng nhập: toggle() chuyển sang trang đăng nhập rồi quay lại đúng trang.
// - countOf(u): favoriteCount của trường cộng phần thay đổi người dùng vừa bấm (không cần tải lại danh sách).
export function useFavorites() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pending, setPending] = useState(() => new Set())
  const [delta, setDelta] = useState({})
  const [error, setError] = useState('')

  const ids = new Set((Array.isArray(user?.favorites) ? user.favorites : []).map(idOf).filter(Boolean))
  const isFavorite = (u) => ids.has(u?._id)
  const countOf = (u) => Math.max(0, (u?.favoriteCount ?? 0) + (delta[u?._id] || 0))

  async function toggle(u) {
    if (!user) return navigate('/dang-nhap', { state: { from: location } })
    if (!u?._id || !u?.slug || pending.has(u._id)) return
    const wasFavorite = ids.has(u._id)
    setPending((p) => new Set(p).add(u._id))
    setError('')
    try {
      const favorites = await (wasFavorite ? removeFavorite(u.slug) : addFavorite(u.slug))
      setUser((current) => (current ? { ...current, favorites } : current))
      setDelta((d) => ({ ...d, [u._id]: (d[u._id] || 0) + (wasFavorite ? -1 : 1) }))
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setPending((p) => {
        const next = new Set(p)
        next.delete(u._id)
        return next
      })
    }
  }

  return { isFavorite, toggle, countOf, error, isPending: (u) => pending.has(u?._id) }
}
