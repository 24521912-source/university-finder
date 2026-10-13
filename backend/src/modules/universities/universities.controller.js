const universitiesService = require('./universities.service')

async function list(req, res) {
  res.json(await universitiesService.list())
}

module.exports = { list }
