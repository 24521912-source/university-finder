// Tạo GitHub Project (bảng Kanban) cho repo và nạp toàn bộ công việc trong tasks.json thành issue.
//
// Chuẩn bị (1 lần):  gh auth refresh -s project       (cấp quyền "project" cho gh CLI)
// Xem trước:         node tools/github-project/setup-project.mjs --dry-run
// Chạy thật:         node tools/github-project/setup-project.mjs
//
// Script làm lại được nhiều lần: project / label / issue đã có thì dùng lại, không tạo trùng.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const DRY_RUN = process.argv.includes('--dry-run')
const config = JSON.parse(readFileSync(new URL('./tasks.json', import.meta.url), 'utf8'))
const OWNER = config.owner
const REPO = `${config.owner}/${config.repo}`

const MODULES = ['Khung chung', 'Trang chủ', 'Trường', 'AI tư vấn', 'Cá nhân & Tài khoản', 'Quản trị',
  'Cơ sở dữ liệu', 'DevOps', 'Kiểm thử', 'Tài liệu & Báo cáo']
const PRIORITIES = ['P0', 'P1', 'P2', 'P3']
const STATUSES = ['Todo', 'In Progress', 'Done'] // 3 cột mặc định của GitHub Project

// ---------- Gọi gh CLI ----------

function gh(args) {
  if (DRY_RUN) return ''
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}
const ghJson = (args) => JSON.parse(gh([...args, '--format', 'json']) || '{}')

// ---------- Từng bước ----------

function ensureLabels() {
  const labels = [
    ['task', '0e8a16', 'Công việc trong WBS'],
    ['bug', 'd73a4a', 'Lỗi phát hiện khi test'],
    ...PRIORITIES.map((p, i) => [p, ['b60205', 'd93f0b', 'fbca04', 'c5def5'][i], `Độ ưu tiên ${p}`]),
    ...MODULES.map((m) => [`module: ${m}`, '1d76db', `Module ${m}`]),
  ]
  for (const [name, color, description] of labels) {
    gh(['label', 'create', name, '--repo', REPO, '--color', color, '--description', description, '--force'])
  }
  console.log(`✓ ${labels.length} label`)
}

function ensureProject() {
  const existing = ghJson(['project', 'list', '--owner', OWNER]).projects?.find((p) => p.title === config.projectTitle)
  const project = existing || ghJson(['project', 'create', '--owner', OWNER, '--title', config.projectTitle])
  gh(['project', 'link', String(project.number ?? 0), '--owner', OWNER, '--repo', REPO])
  console.log(`✓ Project "${config.projectTitle}" ${existing ? '(đã có)' : '(mới tạo)'} — gắn với repo ${REPO}`)
  return project
}

// Trả về { Status: { id, options: { Todo: optionId, ... } }, Module: ..., Priority: ... }
function ensureFields(projectNumber) {
  const listFields = () => ghJson(['project', 'field-list', String(projectNumber), '--owner', OWNER]).fields || []
  let fields = listFields()
  for (const [name, options] of [['Module', MODULES], ['Priority', PRIORITIES]]) {
    if (!fields.some((f) => f.name === name)) {
      gh(['project', 'field-create', String(projectNumber), '--owner', OWNER, '--name', name,
        '--data-type', 'SINGLE_SELECT', '--single-select-options', options.join(',')])
    }
  }
  fields = listFields()
  const pick = (name) => {
    const field = fields.find((f) => f.name === name)
    return field && { id: field.id, options: Object.fromEntries((field.options || []).map((o) => [o.name, o.id])) }
  }
  console.log('✓ Cột Status + trường Module, Priority')
  return { Status: pick('Status'), Module: pick('Module'), Priority: pick('Priority') }
}

const issueTitle = (task) => (task.type === 'bug' ? `[Bug] ${task.title}` : `[WBS ${task.wbs}] ${task.title}`)

function issueBody(task) {
  return [
    `**Mã:** ${task.wbs} · **Module:** ${task.module} · **Ưu tiên:** ${task.priority}`,
    '',
    task.note ? `**Ghi chú / bằng chứng:** ${task.note}` : '',
    '',
    '_Tạo tự động từ `tools/github-project/tasks.json` (nguồn: file WBS của nhóm)._',
  ].join('\n')
}

function setField(projectId, itemId, field, value) {
  const optionId = field?.options[value]
  if (!optionId) return console.warn(`  ! Không có lựa chọn "${value}"`)
  gh(['project', 'item-edit', '--id', itemId, '--project-id', projectId, '--field-id', field.id, '--single-select-option-id', optionId])
}

function main() {
  console.log(DRY_RUN ? '=== XEM TRƯỚC (không gọi GitHub) ===' : `=== Đang thiết lập Kanban cho ${REPO} ===`)
  ensureLabels()
  const project = ensureProject()
  const fields = DRY_RUN ? {} : ensureFields(project.number)

  const existingIssues = DRY_RUN ? [] : JSON.parse(gh(['issue', 'list', '--repo', REPO, '--state', 'all', '--limit', '500', '--json', 'number,title,url,state']))
  const byTitle = new Map(existingIssues.map((issue) => [issue.title, issue]))

  let created = 0
  for (const task of config.tasks) {
    const title = issueTitle(task)
    const labels = [task.type, task.priority, `module: ${task.module}`]
    if (DRY_RUN) {
      console.log(`  [${task.status.padEnd(11)}] ${title}  →  ${task.assignee || '(chưa giao)'} | ${labels.join(', ')}`)
      continue
    }

    let issue = byTitle.get(title)
    if (!issue) {
      const args = ['issue', 'create', '--repo', REPO, '--title', title, '--body', issueBody(task)]
      for (const label of labels) args.push('--label', label)
      if (task.assignee) args.push('--assignee', task.assignee)
      issue = { url: gh(args), state: 'OPEN' }
      created++
    }
    if (task.status === 'Done' && issue.state === 'OPEN') gh(['issue', 'close', issue.url, '--repo', REPO])

    const item = ghJson(['project', 'item-add', String(project.number), '--owner', OWNER, '--url', issue.url])
    setField(project.id, item.id, fields.Status, task.status)
    setField(project.id, item.id, fields.Module, task.module)
    setField(project.id, item.id, fields.Priority, task.priority)
    console.log(`  ✓ [${task.status}] ${title}`)
  }

  console.log(`\nXong: ${config.tasks.length} mục (${created} issue mới).`)
  if (!DRY_RUN) {
    console.log(`Mở project: ${project.url}`)
    console.log('Lưu ý: vào project → "+ New view" → chọn "Board" để xem dạng Kanban, nhóm theo Status (có thể "Group by: Module").')
  }
}

main()
