const service = require('./history.service')
const { validateId } = require('./history.validation')
const httpError = require('../../utils/httpError')

const checkId = (id) => { const e = validateId(id); if (e) throw httpError(400, e) }

module.exports = {
  list: async (req, res) => res.json(await service.list(req.query)),
  get: async (req, res) => { checkId(req.params.id); res.json(await service.get(req.params.id)) },
  restore: async (req, res) => { checkId(req.params.id); res.json(await service.restore(req.user, req.params.id)) },
  remove: async (req, res) => { checkId(req.params.id); res.json(await service.remove(req.params.id)) },
}
