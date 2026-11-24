const universitiesService = require('./universities.service')
const { validateSearch, validateCompare } = require('./universities.validation')
const httpError = require('../../utils/httpError')

async function list(req, res) {
  res.json(await universitiesService.list())
}

// GET /universities/search?q=&type=&vnu=&group=&major=&district=&maxTuition=
async function search(req, res) {
  const { value: filters, error } = validateSearch(req.query)
  if (error) throw httpError(400, error)
  res.json(await universitiesService.search(filters))
}

// GET /universities/filter-options
async function filterOptions(req, res) {
  res.json(await universitiesService.filterOptions())
}

// GET /universities/compare?slugs=a,b,c
async function compare(req, res) {
  const { value: slugs, error } = validateCompare(req.query)
  if (error) throw httpError(400, error)
  res.json(await universitiesService.compare(slugs))
}

async function detail(req, res) {
  const university = await universitiesService.detail(req.params.slug)
  if (!university) return res.status(404).json({ message: 'Không tìm thấy trường đại học' })
  res.json(university)
}

async function recommendationData(req, res) {
  res.json(await universitiesService.recommendationData())
}

module.exports = { list, search, filterOptions, compare, detail, recommendationData }
