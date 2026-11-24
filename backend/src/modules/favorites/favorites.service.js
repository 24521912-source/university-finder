const User = require('../../models/User')
const University = require('../../models/University')
const httpError = require('../../utils/httpError')

async function findUniversity(slug) {
  const university = await University.findOne({ slug }).select('_id').lean()
  if (!university) throw httpError(404, 'Không tìm thấy trường đại học')
  return university
}

async function favoritesOf(userId) {
  const user = await User.findById(userId).select('favorites').lean()
  return (user?.favorites || []).map(String)
}

// Thêm yêu thích. Điều kiện "chưa có trong favorites" nằm ngay trong câu update nên bấm 2 lần
// (hoặc 2 tab cùng lúc) cũng chỉ thêm 1 lần và favoriteCount chỉ tăng 1.
async function add(userId, slug) {
  const { _id } = await findUniversity(slug)
  const result = await User.updateOne({ _id: userId, favorites: { $ne: _id } }, { $push: { favorites: _id } })
  if (result.modifiedCount) await University.updateOne({ _id }, { $inc: { favoriteCount: 1 } })
  return { favorites: await favoritesOf(userId) }
}

async function remove(userId, slug) {
  const { _id } = await findUniversity(slug)
  const result = await User.updateOne({ _id: userId, favorites: _id }, { $pull: { favorites: _id } })
  // Không để favoriteCount âm nếu dữ liệu cũ bị lệch.
  if (result.modifiedCount) await University.updateOne({ _id, favoriteCount: { $gt: 0 } }, { $inc: { favoriteCount: -1 } })
  return { favorites: await favoritesOf(userId) }
}

module.exports = { add, remove }
