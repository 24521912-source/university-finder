const PREVIEW_COUNT = 6

// Danh sách ngành trong một ô của bảng so sánh: hiện 6 ngành đầu, phần còn lại thu gọn trong "Xem thêm".
function MajorList({ majors }) {
  const preview = majors.slice(0, PREVIEW_COUNT)
  const rest = majors.slice(PREVIEW_COUNT)
  return (
    <>
      <ul className="compare-list">{preview.map((name) => <li key={name}>{name}</li>)}</ul>
      {rest.length > 0 && (
        <details>
          <summary>Xem thêm {rest.length} ngành</summary>
          <ul className="compare-list">{rest.map((name) => <li key={name}>{name}</li>)}</ul>
        </details>
      )}
    </>
  )
}

export default MajorList
