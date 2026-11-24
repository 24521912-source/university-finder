const service = require('./consultations.service')

module.exports = {
  list: async (req, res) => res.json(await service.list(req.user._id)),
  create: async (req, res) => res.status(201).json(await service.create(req.user._id, req.body)),
  remove: async (req, res) => res.json(await service.remove(req.user._id, req.params.id)),
}
