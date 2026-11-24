export function checklistKey(accountId, school, year) {
  return `admission-checklist:v1:${JSON.stringify([accountId, school, year])}`
}

export function readChecklist(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key))
    const custom = Array.isArray(value?.custom) ? value.custom.filter(item => item && typeof item.id === 'string' && item.id.startsWith('custom-') && typeof item.label === 'string' && item.label.trim() && item.label.length <= 120) : []
    const unique = [...new Map(custom.map(item => [item.id, { id: item.id, label: item.label.trim() }])).values()]
    return { custom: unique, checked: Array.isArray(value?.checked) ? [...new Set(value.checked.filter(id => typeof id === 'string' && (/^basic-[0-3]$/.test(id) || unique.some(item => item.id === id))))] : [] }
  } catch { return { custom: [], checked: [] } }
}

export function addDocument(state, label, id, basicLabels) {
  const trimmed = label.trim()
  if (!trimmed || trimmed.length > 120) return { error: 'Nhập tên giấy tờ từ 1 đến 120 ký tự.' }
  const normalized = trimmed.toLocaleLowerCase('vi-VN').replace(/\s+/g, ' ')
  if ([...basicLabels, ...state.custom.map(item => item.label)].some(value => value.trim().toLocaleLowerCase('vi-VN').replace(/\s+/g, ' ') === normalized)) return { error: 'Giấy tờ này đã có trong danh sách.' }
  return { state: { ...state, custom: [...state.custom, { id, label: trimmed }] } }
}
