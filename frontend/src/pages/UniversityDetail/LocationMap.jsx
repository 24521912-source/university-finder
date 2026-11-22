import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import LeafletMap from '../../components/LeafletMap'
import { detailPoints } from '../../features/map/mapData'

// Bản đồ nhỏ trong mục "Cơ sở & vị trí" của trang chi tiết (WBS 8.3).
function LocationMap({ university }) {
  const points = useMemo(() => detailPoints(university), [university])
  const allMap = `/ban-do?truong=${encodeURIComponent(university.slug)}`
  if (!points.length) {
    return <p className="ud-muted">Trường chưa có tọa độ trên bản đồ. <Link to="/ban-do">Xem bản đồ các trường khác →</Link></p>
  }
  return <div className="ud-map">
    <LeafletMap points={points} label={`Bản đồ vị trí ${university.shortName || university.name}`} />
    <p className="ud-muted">
      {points.length > 1 ? `${points.length} vị trí có tọa độ. ` : ''}
      <Link to={allMap}>Xem cùng các trường khác trên bản đồ →</Link>
    </p>
  </div>
}

export default LocationMap
