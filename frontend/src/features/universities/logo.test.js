import test from 'node:test'
import assert from 'node:assert/strict'
import { logoSources, monogram } from './logo.js'

const manifest = { uit: '/logos/uit.png' }

test('ưu tiên logo tải sẵn, sau đó link admin nhập; bỏ link không phải http(s)', () => {
  assert.deepEqual(logoSources({ slug: 'uit', logoUrl: 'https://uit.edu.vn/logo.png' }, manifest), ['/logos/uit.png', 'https://uit.edu.vn/logo.png'])
  assert.deepEqual(logoSources({ slug: 'khac', logoUrl: ' https://a.vn/l.svg ' }, manifest), ['https://a.vn/l.svg'])
  assert.deepEqual(logoSources({ slug: 'khac', logoUrl: 'javascript:alert(1)' }, manifest), [])
  assert.deepEqual(logoSources({ slug: 'toString' }, manifest), [])
  assert.deepEqual(logoSources(undefined, manifest), [])
})

test('chữ viết tắt thay logo', () => {
  assert.equal(monogram({ shortName: 'uit', name: 'Trường Đại học Công nghệ Thông tin' }), 'UIT')
  assert.equal(monogram({ shortName: 'Swinburne', name: 'Swinburne Việt Nam' }), 'SWIN')
  assert.equal(monogram({ name: 'Trường Đại học Kinh tế Luật' }), 'KTL')
  assert.equal(monogram({}), '?')
})
