import test from 'node:test'
import assert from 'node:assert/strict'
import { lowestTuitionSlug, readCompareSlugs } from './compareUtils.js'

test('đọc slug từ URL: bỏ trùng, bỏ slug sai định dạng, tối đa 3', () => {
  assert.deepEqual(readCompareSlugs('uit,bach-khoa-tphcm'), ['uit', 'bach-khoa-tphcm'])
  assert.deepEqual(readCompareSlugs(' uit , uit ,../x,Hoa_Sen,ueh'), ['uit', 'ueh'])
  assert.deepEqual(readCompareSlugs('a,b,c,d'), ['a', 'b', 'c'])
  assert.deepEqual(readCompareSlugs(null), [])
})

test('trường có học phí năm thấp nhất, chỉ khi có ít nhất 2 trường có dữ liệu', () => {
  assert.equal(lowestTuitionSlug([{ slug: 'a', annualTuitionFrom: 40e6 }, { slug: 'b', annualTuitionFrom: 30e6 }, { slug: 'c', annualTuitionFrom: null }]), 'b')
  assert.equal(lowestTuitionSlug([{ slug: 'a', annualTuitionFrom: 40e6 }, { slug: 'b', annualTuitionFrom: null }]), null)
})
