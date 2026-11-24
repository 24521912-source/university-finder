const service = require('./accounts.service')
const v = require('./accounts.validation')
const httpError = require('../../utils/httpError')

const ensure = (message) => { if (message) throw httpError(400, message) }

module.exports = {
  list: async (req, res) => res.json(await service.list(req.query)),
  create: async (req, res) => {
    ensure(v.validateCreate(req.body))
    res.status(201).json(await service.create(req.user, req.body))
  },
  setStatus: async (req, res) => {
    ensure(v.validateId(req.params.id) || v.validateStatus(req.body))
    res.json(await service.setStatus(req.user, req.params.id, req.body))
  },
  setRole: async (req, res) => {
    ensure(v.validateId(req.params.id) || v.validateRole(req.body))
    res.json(await service.setRole(req.user, req.params.id, req.body))
  },
  setPermissions: async (req, res) => {
    ensure(v.validateId(req.params.id) || v.validatePermissions(req.body))
    res.json(await service.setPermissions(req.user, req.params.id, req.body))
  },
  remove: async (req, res) => {
    ensure(v.validateId(req.params.id))
    res.json(await service.remove(req.user, req.params.id))
  },
}
