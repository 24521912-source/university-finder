const universitiesService = require('./universities.service')

async function list(req, res) {
  res.json(await universitiesService.list())
}

async function detail(req, res) {
  const university = await universitiesService.detail(req.params.slug)
  if (!university) return res.status(404).json({ message: 'Không tìm thấy trường đại học' })
  res.json(university)
}

module.exports = { list, detail }
