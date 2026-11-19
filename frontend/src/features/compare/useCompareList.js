import { useEffect, useState } from 'react'

// Danh sách trường người dùng chọn để so sánh (tối đa 3).
// Lưu trong sessionStorage: chuyển trang / tải lại vẫn còn, đóng tab thì mất.
//
//   const compare = useCompareList()
//   compare.toggle(university)  compare.isSelected(university)  compare.items  compare.clear()

export const MAX_COMPARE = 3
export const MIN_COMPARE = 2
const STORAGE_KEY = 'unimatch-compare'

const isValidItem = (item) => item && typeof item.slug === 'string' && typeof item.name === 'string'

function readStorage() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved.filter(isValidItem).slice(0, MAX_COMPARE) : []
  } catch {
    return [] // trình duyệt chặn storage hoặc dữ liệu hỏng: bắt đầu danh sách rỗng
  }
}

export function useCompareList() {
  const [items, setItems] = useState(readStorage)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Không lưu được thì danh sách vẫn dùng được trong trang hiện tại.
    }
  }, [items])

  const isSelected = (university) => items.some((item) => item.slug === university?.slug)
  const isFull = items.length >= MAX_COMPARE

  function toggle(university) {
    setItems((current) => {
      if (current.some((item) => item.slug === university.slug)) {
        return current.filter((item) => item.slug !== university.slug)
      }
      if (current.length >= MAX_COMPARE) return current
      return [...current, { slug: university.slug, name: university.name, shortName: university.shortName || null }]
    })
  }

  const remove = (slug) => setItems((current) => current.filter((item) => item.slug !== slug))
  const clear = () => setItems([])

  return { items, isSelected, isFull, toggle, remove, clear }
}

// Đường dẫn trang so sánh, vd. /so-sanh?truong=uit,bach-khoa-tphcm
export const compareUrl = (slugs) => `/so-sanh?truong=${slugs.join(',')}`
