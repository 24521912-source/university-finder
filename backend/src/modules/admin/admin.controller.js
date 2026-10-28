const service = require('./admin.service')
const overview = async (req, res) => res.json(await service.overview())
const list = resource => async (req, res) => res.json(await service.list[resource](service.options(req.query)))
module.exports = { overview, list }
