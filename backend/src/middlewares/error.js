// Route không tồn tại -> 404
function notFound(req, res) {
  res.status(404).json({ message: `Không tìm thấy ${req.method} ${req.originalUrl}` })
}

// Mọi lỗi (kể cả lỗi trong hàm async - Express 5 tự chuyển tới đây) trả về JSON { message }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join('; ') })
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Dữ liệu gửi lên không phải JSON hợp lệ' })
  if (err.name === 'CastError') return res.status(400).json({ message: 'ID không hợp lệ' })
  if (err.code === 11000) return res.status(409).json({ message: 'Dữ liệu đã tồn tại' })

  const status = err.status || 500
  if (status >= 500) console.error(err)
  res.status(status).json({ message: status >= 500 ? 'Lỗi máy chủ' : err.message })
}

module.exports = { notFound, errorHandler }
