import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUniversityDetail } from '../../services/universityDetail'
import { getErrorMessage } from '../../services/api'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { DetailContent } from './UniversityDetailPages'
import './UniversityDetail.css'

export { DetailContent } from './UniversityDetailPages'

function UniversityDetail() {
  const { slug } = useParams()
  const [attempt, setAttempt] = useState(0)
  const [resource, setResource] = useState({ status: 'loading' })
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])
  useEffect(() => {
    const controller = new AbortController()
    getUniversityDetail(slug, controller.signal)
      .then((university) => { if (!controller.signal.aborted) setResource({ status: 'ready', university, slug, attempt }) })
      .catch((error) => {
        if (controller.signal.aborted) return
        const unavailableEndpoint = error.response?.status === 404 && /^Không tìm thấy GET /.test(error.response?.data?.message || '')
        const status = error.response?.status === 404 && !unavailableEndpoint ? 'not-found' : 'error'
        const message = unavailableEndpoint ? 'API chi tiết trường chưa được hỗ trợ trên máy chủ đang kết nối.' : error.response || error.request ? getErrorMessage(error) : error.message
        setResource({ status, message, slug, attempt })
      })
    return () => controller.abort()
  }, [slug, attempt])
  const status = resource.slug === slug && resource.attempt === attempt ? resource.status : 'loading'
  useDocumentTitle(status === 'ready' ? resource.university.name : status === 'not-found' ? 'Không tìm thấy trường' : null)
  return <div className="university-detail">
    {status === 'loading' ? <div className="ud-state" role="status">Đang tải thông tin trường…</div> : status === 'ready' ? <DetailContent key={slug} university={resource.university} /> : <div className="ud-state" role={status === 'error' ? 'alert' : 'status'}><h1>{status === 'not-found' ? 'Không tìm thấy trường đại học' : 'Không tải được thông tin trường'}</h1><p>{status === 'not-found' ? 'Trường không tồn tại trong hệ thống hoặc đường dẫn không đúng.' : resource.message}</p><div className="ud-state-actions">{status === 'error' && <button type="button" className="btn btn-primary" onClick={() => setAttempt((n) => n + 1)}>Thử lại</button>}<Link className="btn btn-outline" to="/truong">Về danh sách trường</Link></div></div>}
  </div>
}

export default UniversityDetail
