const service = require('./admin.service')

module.exports = {
  list: async (req, res) => res.json(await service.list(req.query)),
  get: async (req, res) => res.json(await service.get(req.params.slug)),
  create: async (req, res) => res.status(201).json(await service.create(req.user, req.body)),
  update: async (req, res) => res.json(await service.update(req.user, req.params.slug, req.body)),
  remove: async (req, res) => res.json(await service.remove(req.user, req.params.slug)),
  majors: async (req, res) => res.json(await service.majors()),
}
