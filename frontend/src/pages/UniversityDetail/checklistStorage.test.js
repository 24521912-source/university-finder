import test from 'node:test'
import assert from 'node:assert/strict'
import { addDocument, checklistKey, readChecklist } from './checklistStorage.js'

test('isolates checklists by account, school and year', () => {
  const keys = [checklistKey('a', 'school-a', 2026), checklistKey('b', 'school-a', 2026), checklistKey('a', 'school-b', 2026), checklistKey('a', 'school-a', 2025)]
  assert.equal(new Set(keys).size, 4)
})

test('preserves custom documents and their checks on reload, discarding unknown checks', () => {
  const value = { custom: [{ id: 'custom-a', label: 'Language certificate' }], checked: ['basic-0', 'custom-a', 'custom-unknown', 'basic-99'] }
  const storage = { getItem: () => JSON.stringify(value) }
  assert.deepEqual(readChecklist(storage, 'key'), { custom: value.custom, checked: ['basic-0', 'custom-a'] })
  assert.deepEqual(readChecklist({ getItem: () => '{broken' }, 'key'), { custom: [], checked: [] })
  assert.deepEqual(readChecklist({ getItem: () => { throw Error('blocked') } }, 'key'), { custom: [], checked: [] })
})

test('rejects empty or duplicate additions without changing the existing checklist', () => {
  const state = { custom: [], checked: ['basic-0'] }
  assert(addDocument(state, '  ', 'custom-a', []).error)
  assert(addDocument(state, 'language   Certificate', 'custom-a', ['Language Certificate']).error)
  const result = addDocument(state, '  Portfolio  ', 'custom-a', [])
  assert.deepEqual(result.state, { custom: [{ id: 'custom-a', label: 'Portfolio' }], checked: ['basic-0'] })
  assert(addDocument(result.state, 'PORTFOLIO', 'custom-b', []).error)
  assert.deepEqual(state, { custom: [], checked: ['basic-0'] })
})
