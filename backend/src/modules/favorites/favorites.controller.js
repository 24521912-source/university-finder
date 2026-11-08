const favoritesService = require('./favorites.service')
const { validateSlug } = require('./favorites.validation')
const httpError = require('../../utils/httpError')

function checkSlug(slug) {
  const error = validateSlug(slug)
  if (error) throw httpError(400, error)
}

async function add(req, res) {
  checkSlug(req.params.slug)
  res.json(await favoritesService.add(req.user._id, req.params.slug))
}

async function remove(req, res) {
  checkSlug(req.params.slug)
  res.json(await favoritesService.remove(req.user._id, req.params.slug))
}

module.exports = { add, remove }
