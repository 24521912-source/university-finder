import { useEffect, useState } from 'react'
import { getErrorMessage } from '../services/api'

// Gọi một API GET và theo dõi trạng thái tải / lỗi.
//
//   const { data, loading, error, retry } = useApiData('uit,hcmut', (signal) => compareUniversities(slugs, signal))
//
// - key: chuỗi mô tả request. key đổi -> gọi lại API; request cũ bị hủy bằng AbortController
//   nên kết quả cũ (về chậm) không bao giờ ghi đè kết quả mới.
// - key = null: không gọi API (vd. chưa đủ dữ liệu đầu vào).
// - Hủy request có chủ đích KHÔNG bị coi là lỗi.
export function useApiData(key, fetcher) {
  const [attempt, setAttempt] = useState(0)
  const requestKey = key === null ? null : `${key}#${attempt}`
  const [result, setResult] = useState({ key: null, data: null, error: '' })

  useEffect(() => {
    if (requestKey === null) return undefined
    const controller = new AbortController()

    fetcher(controller.signal)
      .then((data) => setResult({ key: requestKey, data, error: '' }))
      .catch((err) => {
        if (controller.signal.aborted) return // đã hủy: bỏ qua
        setResult({ key: requestKey, data: null, error: getErrorMessage(err) })
      })

    return () => controller.abort()
    // fetcher là hàm tạo mới mỗi lần render; chỉ requestKey quyết định khi nào gọi lại.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const isCurrent = result.key === requestKey
  return {
    data: result.data, // giữ dữ liệu cũ trong lúc tải dữ liệu mới để giao diện không nhấp nháy
    loading: requestKey !== null && !isCurrent,
    error: isCurrent ? result.error : '',
    retry: () => setAttempt((n) => n + 1),
  }
}
