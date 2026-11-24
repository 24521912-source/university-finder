import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { HCMC_CENTER } from '../features/map/mapData'
import './LeafletMap.css'

// Nội dung popup tạo bằng DOM (textContent), không ghép chuỗi HTML -> tên / địa chỉ trong database không chèn được mã.
function popupContent(point, navigate) {
  const root = document.createElement('div')
  root.className = 'map-popup'
  const title = document.createElement('strong')
  title.textContent = point.title
  root.append(title)
  if (point.subtitle) {
    const subtitle = document.createElement('p')
    subtitle.textContent = point.subtitle
    root.append(subtitle)
  }
  if (point.href) {
    const link = document.createElement('a')
    link.href = point.href
    link.textContent = 'Xem chi tiết trường →'
    link.addEventListener('click', (event) => {
      event.preventDefault()
      navigate(point.href)
    })
    root.append(link)
  }
  return root
}

// Bản đồ OpenStreetMap dùng chung. points: [{ id, lat, lng, title, subtitle, href, color, kind: 'main' | 'campus' }]
// selectedId: điểm cần bay tới và mở popup. onSelect(id): người dùng bấm vào một điểm.
function LeafletMap({ points, selectedId, onSelect, label = 'Bản đồ', className = '' }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const markersRef = useRef(new Map())
  const onSelectRef = useRef(onSelect)
  const navigate = useNavigate()

  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])

  useEffect(() => {
    const map = L.map(containerRef.current, { center: HCMC_CENTER, zoom: 11 })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Vẽ lại điểm khi danh sách đổi (vd đổi bộ lọc) rồi thu phóng cho vừa các điểm.
  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()
    markersRef.current.clear()
    for (const p of points) {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: p.kind === 'campus' ? 6 : 9, color: '#fff', weight: 2, fillColor: p.color, fillOpacity: p.kind === 'campus' ? 0.75 : 0.95,
      })
      marker.bindPopup(() => popupContent(p, navigate))
      marker.bindTooltip(p.title, { direction: 'top', offset: [0, -8] })
      marker.on('click', () => onSelectRef.current?.(p.id))
      marker.addTo(layer)
      markersRef.current.set(p.id, marker)
    }
    if (points.length === 1) map.setView([points[0].lat, points[0].lng], 15)
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [32, 32], maxZoom: 15 })
  }, [points, navigate])

  useEffect(() => {
    const marker = selectedId && markersRef.current.get(selectedId)
    if (!marker || !mapRef.current) return
    mapRef.current.flyTo(marker.getLatLng(), Math.max(mapRef.current.getZoom(), 15), { duration: 0.6 })
    marker.openPopup()
  }, [selectedId, points])

  return <div ref={containerRef} className={`leaflet-map ${className}`} role="region" aria-label={label} />
}

export default LeafletMap
