import { useId, useMemo, useState } from 'react'
import { searchMajors } from '../features/recommendations/majorGroups'

// Ô gõ tìm ngành (không dấu, viết tắt), gợi ý nhóm ngành trước rồi ngành cụ thể.
function MajorPicker({ majors, value, onChange, inputProps = {} }) {
  const listId = useId()
  const [query, setQuery] = useState(value?.label || '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const options = useMemo(() => searchMajors(query === value?.label ? '' : query, majors, 10), [query, value, majors])

  function pick(option) {
    onChange(option)
    setQuery(option.label)
    setOpen(false)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, options.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && open && options[active]) { e.preventDefault(); pick(options[active]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="major-picker">
      <input
        id="majorCode" className="input" type="text" autoComplete="off"
        role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
        aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
        placeholder="Gõ tên ngành, ví dụ: công nghệ thông tin, IT, kế toán…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); if (value) onChange(null) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        {...inputProps}
      />
      {open && options.length > 0 && <ul id={listId} role="listbox" className="major-picker-list">
        {options.map((o, i) => <li
          key={`${o.type}-${o.id}`} id={`${listId}-${i}`} role="option" aria-selected={i === active}
          className={i === active ? 'active' : ''}
          onMouseDown={(e) => { e.preventDefault(); pick(o) }}
          onMouseEnter={() => setActive(i)}
        >
          <span>{o.label}</span>
          <small>{o.type === 'group' ? `Nhóm · ${o.detail}` : `Ngành · ${o.detail}`}</small>
        </li>)}
      </ul>}
      {open && query && options.length === 0 && <p className="consult-help">Không tìm thấy ngành phù hợp. Thử gõ ngắn hơn hoặc không dấu.</p>}
    </div>
  )
}

export default MajorPicker
