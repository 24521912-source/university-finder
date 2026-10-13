import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../../services/api'
import UniversityCard from '../../components/UniversityCard'

function Universities() {
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/universities')
      .then((response) => setUniversities(response.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container">
      <h1 className="page-title">Danh sách trường đại học TP.HCM</h1>
      <p className="page-subtitle">Khám phá và tìm kiếm các trường đại học phù hợp với nhu cầu của bạn.</p>

      {error && <div className="alert-error" role="alert">{error}</div>}

      {loading ? (
        <p className="muted">Đang tải…</p>
      ) : (
        <>
          <p className="muted">{universities.length} trường</p>
          <div className="card-grid">
            {universities.map((university) => (
              <UniversityCard key={university._id} university={university} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Universities
