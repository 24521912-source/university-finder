// Test phần xử lý của AI review (không gọi Gemini / GitHub). Chạy: node --test .github/scripts/
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildPrompt, formatComment, isRetryableStatus, parseReview, retryDelayMs, shouldFail, truncateDiff,
} from './gemini-review.mjs'

test('cắt diff quá dài và báo đã cắt', () => {
  assert.deepEqual(truncateDiff('abc', 10), { text: 'abc', truncated: false })
  const cut = truncateDiff('x'.repeat(20), 10)
  assert.equal(cut.truncated, true)
  assert.ok(cut.text.startsWith('x'.repeat(10)))
  assert.ok(cut.text.includes('đã bị cắt bớt'))
})

test('prompt chứa tiêu đề, quy ước nhóm và diff', () => {
  const prompt = buildPrompt({ title: 'feat: search', diff: '+const a = 1', rules: 'Không dùng var' })
  for (const part of ['feat: search', 'Không dùng var', '+const a = 1', '"verdict"']) assert.ok(prompt.includes(part), part)
  assert.ok(!buildPrompt({ title: '', diff: '', rules: '' }).includes('project-rules.md)'))
})

test('đọc JSON của Gemini, kể cả khi bọc trong ```json', () => {
  const review = parseReview('```json\n{"verdict":"COMMENT","summary":"Ổn","issues":[{"severity":"minor","file":"a.js","line":3,"message":"Đặt tên chưa rõ","suggestion":"Đổi tên"}]}\n```')
  assert.equal(review.verdict, 'COMMENT')
  assert.equal(review.issues[0].file, 'a.js')
  assert.equal(shouldFail(review), false)
})

test('có lỗi critical thì luôn REQUEST_CHANGES và làm check fail', () => {
  const review = parseReview('{"verdict":"APPROVE","summary":"","issues":[{"severity":"critical","message":"Lộ JWT_SECRET"}]}')
  assert.equal(review.verdict, 'REQUEST_CHANGES')
  assert.equal(shouldFail(review), true)
})

test('chuẩn hóa dữ liệu lạ: verdict sai -> COMMENT, severity sai -> minor, bỏ issue thiếu message', () => {
  const review = parseReview('{"verdict":"MERGE","issues":[{"severity":"huge","message":"x","line":"5"},{"file":"b.js"}]}')
  assert.equal(review.verdict, 'COMMENT')
  assert.equal(review.issues.length, 1)
  assert.equal(review.issues[0].severity, 'minor')
  assert.equal(review.issues[0].line, null)
})

test('JSON hỏng thì ném lỗi (workflow sẽ cảnh báo, không chặn merge)', () => {
  assert.throws(() => parseReview('không phải json'))
})

test('bình luận có marker để cập nhật thay vì spam, escape ký tự | trong bảng', () => {
  const comment = formatComment(
    { verdict: 'REQUEST_CHANGES', summary: 'Có lỗi', issues: [{ severity: 'critical', file: 'x.js', line: 1, message: 'a | b', suggestion: '' }] },
    { model: 'gemini-test', sha: 'abcdef123456', truncated: true },
  )
  assert.ok(comment.startsWith('<!-- gemini-code-review -->'))
  assert.ok(comment.includes('REQUEST_CHANGES'))
  assert.ok(comment.includes('a \\| b'))
  assert.ok(comment.includes('`x.js:1`'))
  assert.ok(comment.includes('abcdef1'))
  assert.ok(comment.includes('chỉ review một phần'))
})

test('chỉ thử lại khi Gemini quá tải / quá hạn mức, không thử lại lỗi do cấu hình', () => {
  for (const status of [429, 500, 503]) assert.equal(isRetryableStatus(status), true)
  for (const status of [400, 401, 403, 404]) assert.equal(isRetryableStatus(status), false)
})

test('thời gian chờ tăng dần, theo Retry-After nếu có và không quá 60 giây', () => {
  assert.deepEqual([1, 2, 3].map((attempt) => retryDelayMs(attempt, null)), [10_000, 20_000, 40_000])
  assert.equal(retryDelayMs(1, '7'), 7_000)
  assert.equal(retryDelayMs(1, '600'), 60_000)
  assert.equal(retryDelayMs(2, 'abc'), 20_000)
})
