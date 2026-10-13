// Tạo lỗi kèm mã HTTP: throw httpError(404, 'Không tìm thấy trường')
module.exports = (status, message) => Object.assign(new Error(message), { status })
