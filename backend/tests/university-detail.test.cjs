const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const express = require('express')

function load(file, replacements) {
  const filename = path.join(__dirname, '../src/modules/universities', file)
  const module = { exports: {} }
  // require tương đối (./, ../) phải tính từ file được nạp, không phải từ thư mục tests/
  const requireFromFile = createRequire(filename)
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), { module, require: name => replacements[name] || requireFromFile(name) }, { filename })
  return module.exports
}

test('detail lookup validates slugs before querying and selects only public fields', async () => {
  const lookups = []
  let selected
  const school = { slug: 'demo-school', name: 'Demo school' }
  const service = load('universities.service.js', { '../../models/University': {
    findOne(query) { lookups.push(query); return { select(fields) { selected = fields; return { lean: async () => school } } } },
  } })
  for (const slug of [undefined, { $ne: '' }, '', '../school', 'demo_school', 'a'.repeat(151)]) assert.equal(await service.detail(slug), null)
  assert.equal(lookups.length, 0)
  assert.equal(await service.detail('demo-school'), school)
  assert.equal(lookups[0].slug, 'demo-school')
  assert(selected.includes('admissions'))
  assert(selected.includes('contact'))
  assert(!selected.includes('password'))
})

test('public detail endpoint returns a school or a clear 404 without writing to the database', async t => {
  const school = { slug: 'demo-school', name: 'Demo school', admissions: [] }
  const controller = load('universities.controller.js', { './universities.service': {
    list: async () => [], detail: async slug => slug === school.slug ? school : null,
  } })
  const router = load('universities.routes.js', { express, './universities.controller': controller })
  const app = express()
  app.use('/api/universities', router)
  const server = app.listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const base = `http://127.0.0.1:${server.address().port}/api/universities`
  const response = await fetch(`${base}/demo-school`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), school)
  const missing = await fetch(`${base}/missing-school`)
  assert.equal(missing.status, 404)
  assert.deepEqual(await missing.json(), { message: 'Không tìm thấy trường đại học' })
  const list = await fetch(base)
  assert.equal(list.status, 200)
  assert.deepEqual(await list.json(), [])
})
