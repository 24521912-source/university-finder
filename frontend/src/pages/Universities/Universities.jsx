import { useEffect, useState } from 'react'
import api from '../../services/api'

function Universities() {
  const [universities, setUniversities] = useState([])

  useEffect(() => {
    api.get('/universities')
      .then((response) => {
        setUniversities(response.data)
      })
      .catch((error) => {
        console.error('Failed to fetch universities:', error)
      })
  }, [])

  return (
    <main>
      <h1>Danh sách trường đại học</h1>

      <ul>
        {universities.map((university) => (
          <li key={university.slug}>
            {university.name} - {university.address?.district}
          </li>
        ))}
      </ul>
    </main>
  )
}

export default Universities