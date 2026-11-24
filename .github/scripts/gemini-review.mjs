// AI code review bằng Gemini cho mỗi Pull Request (chạy trong GitHub Actions: .github/workflows/gemini-review.yml).
//
// Luồng: lấy diff của PR -> gửi Gemini kèm quy ước của nhóm -> nhận JSON đánh giá
//        -> bình luận (hoặc cập nhật bình luận cũ) vào PR -> REQUEST_CHANGES thì check fail.
//
// Chạy thử local (cần GEMINI_API_KEY):  BASE_SHA=origin/develop HEAD_SHA=HEAD DRY_RUN=1 node .github/scripts/gemini-review.mjs
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const DEFAULT_MODEL = 'gemini-3.8-flash'
const MAX_DIFF_CHARS = 120_000 // tránh vượt giới hạn token
const COMMENT_MARKER = '<!-- gemini-code-review -->'

// File không cần review: lockfile, file build, file nhị phân, dữ liệu seed lớn
const EXCLUDED_PATHS = [
  ':(exclude)**/package-lock.json',
  ':(exclude)**/dist/**',
  ':(exclude)**/public/api-docs/**',
  ':(exclude)database/seeds/*.json',
  ':(exclude)*.docx',
  ':(exclude)*.png',
  ':(exclude)*.jpg',
]

// ================= Hàm thuần (có test: gemini-review.test.mjs) =================

// Cắt diff quá dài, báo rõ là đã cắt để AI không kết luận sai về phần không thấy.
export function truncateDiff(diff, max = MAX_DIFF_CHARS) {
  if (diff.length <= max) return { text: diff, truncated: false }
  return { text: `${diff.slice(0, max)}\n\n[... diff đã bị cắt bớt vì quá dài ...]`, truncated: true }
}

export function buildPrompt({ title, diff, rules }) {
  return [
    'Bạn là reviewer code cho đồ án web UniMatch HCMC (React + Vite, Node.js + Express + Mongoose/MongoDB Atlas).',
    'Hãy review phần thay đổi (git diff) của Pull Request dưới đây. Trả lời bằng tiếng Việt.',
    '',
    'Ưu tiên tìm: lỗi logic, lỗi bảo mật (lộ secret, NoSQL injection, XSS, thiếu kiểm tra quyền), lỗi xử lý bất đồng bộ,',
    'thiếu kiểm tra dữ liệu đầu vào, vi phạm quy ước của nhóm, code khó đọc. Không bắt lỗi vụn vặt về định dạng.',
    'Chỉ nêu vấn đề nhìn thấy trong diff; không bịa ra file hoặc dòng không có trong diff.',
    '',
    'Mức độ: "critical" = sai chức năng / lỗ hổng bảo mật / mất dữ liệu; "major" = nên sửa trước khi merge; "minor" = góp ý.',
    'verdict: "REQUEST_CHANGES" nếu có ít nhất 1 vấn đề critical; "COMMENT" nếu chỉ có major/minor; "APPROVE" nếu không có vấn đề đáng kể.',
    '',
    'Trả về DUY NHẤT một JSON đúng dạng:',
    '{"verdict":"APPROVE|COMMENT|REQUEST_CHANGES","summary":"tóm tắt 1-3 câu","issues":[{"severity":"critical|major|minor","file":"đường dẫn","line":123,"message":"vấn đề","suggestion":"cách sửa"}]}',
    '',
    rules ? `## Quy ước của nhóm (project-rules.md)\n${rules}\n` : '',
    `## Tiêu đề PR\n${title || '(không có)'}`,
    '',
    '## Diff',
    '```diff',
    diff,
    '```',
  ].join('\n')
}

const VERDICTS = ['APPROVE', 'COMMENT', 'REQUEST_CHANGES']
const SEVERITIES = ['critical', 'major', 'minor']

// Đọc JSON từ câu trả lời của Gemini, chuẩn hóa để không tin mù quáng dữ liệu trả về.
export function parseReview(text) {
  const cleaned = String(text || '').replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  const data = JSON.parse(cleaned)
  const issues = (Array.isArray(data.issues) ? data.issues : [])
    .filter((issue) => issue && typeof issue.message === 'string')
    .map((issue) => ({
      severity: SEVERITIES.includes(issue.severity) ? issue.severity : 'minor',
      file: typeof issue.file === 'string' ? issue.file : '',
      line: Number.isInteger(issue.line) ? issue.line : null,
      message: issue.message,
      suggestion: typeof issue.suggestion === 'string' ? issue.suggestion : '',
    }))
  let verdict = VERDICTS.includes(data.verdict) ? data.verdict : 'COMMENT'
  if (issues.some((issue) => issue.severity === 'critical')) verdict = 'REQUEST_CHANGES' // không để AI tự mâu thuẫn
  return { verdict, summary: typeof data.summary === 'string' ? data.summary : '', issues }
}

const VERDICT_LABEL = {
  APPROVE: '✅ APPROVE — có thể merge',
  COMMENT: '💬 COMMENT — nên xem các góp ý',
  REQUEST_CHANGES: '⛔ REQUEST_CHANGES — cần sửa trước khi merge',
}
const SEVERITY_ICON = { critical: '🔴', major: '🟠', minor: '🟡' }

export function formatComment(review, { model, sha, truncated }) {
  const lines = [
    COMMENT_MARKER,
    '## 🤖 Gemini Code Review',
    '',
    `**Kết luận:** ${VERDICT_LABEL[review.verdict]}`,
    '',
    review.summary,
    '',
  ]
  if (review.issues.length === 0) {
    lines.push('Không phát hiện vấn đề đáng kể.')
  } else {
    lines.push('| Mức | Vị trí | Vấn đề | Gợi ý |', '|---|---|---|---|')
    for (const issue of review.issues) {
      const where = issue.file ? `\`${issue.file}${issue.line ? `:${issue.line}` : ''}\`` : '—'
      const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
      lines.push(`| ${SEVERITY_ICON[issue.severity]} ${issue.severity} | ${where} | ${cell(issue.message)} | ${cell(issue.suggestion || '—')} |`)
    }
  }
  lines.push('', `<sub>Model: ${model} · Commit: ${sha.slice(0, 7)}${truncated ? ' · ⚠️ diff quá dài, chỉ review một phần' : ''} · AI có thể sai — người review vẫn quyết định cuối cùng.</sub>`)
  return lines.join('\n')
}

export const shouldFail = (review) => review.verdict === 'REQUEST_CHANGES'

// ================= Gọi bên ngoài (git, Gemini, GitHub) =================

function getDiff(base, head) {
  return execFileSync('git', ['diff', '--unified=3', `${base}...${head}`, '--', '.', ...EXCLUDED_PATHS], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  })
}

async function askGemini({ apiKey, model, prompt }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    }),
  })
  if (!response.ok) throw new Error(`Gemini API ${response.status}: ${(await response.text()).slice(0, 300)}`)
  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('')
  if (!text) throw new Error('Gemini không trả nội dung (có thể bị chặn bởi bộ lọc an toàn).')
  return text
}

async function github(path, { method = 'GET', body } = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) throw new Error(`GitHub API ${method} ${path}: ${response.status} ${await response.text()}`)
  return response.status === 204 ? null : response.json()
}

// Mỗi PR chỉ giữ 1 bình luận của bot: có rồi thì cập nhật, chưa có thì tạo mới.
async function upsertComment(repo, prNumber, body) {
  const comments = await github(`/repos/${repo}/issues/${prNumber}/comments?per_page=100`)
  const existing = comments.find((comment) => comment.body?.includes(COMMENT_MARKER))
  if (existing) await github(`/repos/${repo}/issues/comments/${existing.id}`, { method: 'PATCH', body: { body } })
  else await github(`/repos/${repo}/issues/${prNumber}/comments`, { method: 'POST', body: { body } })
}

async function main() {
  const { GEMINI_API_KEY, REPO, PR_NUMBER, PR_TITLE, BASE_SHA, HEAD_SHA, DRY_RUN } = process.env
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL

  if (!GEMINI_API_KEY) {
    console.log('::warning::Chưa có secret GEMINI_API_KEY nên bỏ qua AI review. Thêm ở Settings → Secrets and variables → Actions.')
    return
  }

  const rawDiff = getDiff(BASE_SHA, HEAD_SHA)
  if (!rawDiff.trim()) {
    console.log('PR không có thay đổi cần review.')
    return
  }

  const { text: diff, truncated } = truncateDiff(rawDiff)
  const rules = existsSync('project-rules.md') ? readFileSync('project-rules.md', 'utf8') : ''

  let review
  try {
    review = parseReview(await askGemini({ apiKey: GEMINI_API_KEY, model, prompt: buildPrompt({ title: PR_TITLE, diff, rules }) }))
  } catch (error) {
    // AI lỗi / quá hạn mức thì không chặn merge, chỉ cảnh báo
    console.log(`::warning::Không review được bằng Gemini: ${error.message}`)
    return
  }

  const comment = formatComment(review, { model, sha: HEAD_SHA || 'local', truncated })
  if (DRY_RUN) console.log(comment)
  else await upsertComment(REPO, PR_NUMBER, comment)

  console.log(`Kết luận: ${review.verdict} — ${review.issues.length} vấn đề`)
  if (shouldFail(review)) {
    console.log('::error::Gemini yêu cầu sửa lỗi nghiêm trọng trước khi merge (xem bình luận trong PR).')
    process.exitCode = 1
  }
}

// Chỉ chạy main() khi gọi trực tiếp file này (không chạy khi test import)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
