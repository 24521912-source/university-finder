const service = require('./map.service')

module.exports = {
  universities: async (req, res) => res.json(await service.universities()),
}
