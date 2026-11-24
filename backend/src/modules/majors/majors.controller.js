const majorsService = require('./majors.service')

async function list(req, res) {
  res.json(await majorsService.list())
}

module.exports = { list }
