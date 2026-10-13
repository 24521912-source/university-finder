// Trang tạm cho chức năng chưa làm — thay bằng trang thật khi code xong (xem src/routes/AppRoutes.jsx)
function ComingSoon({ title, message = 'Chức năng đang được phát triển.' }) {
  return (
    <div className="container">
      <div className="coming-soon">
        <h1 className="page-title">{title}</h1>
        <p className="muted">{message}</p>
      </div>
    </div>
  )
}

export default ComingSoon
