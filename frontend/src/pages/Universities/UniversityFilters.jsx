import { TUITION_OPTIONS, TYPE_OPTIONS } from './universitySearch'

// Thanh tìm kiếm + bộ lọc: ngành, học phí, khu vực, loại trường, ĐHQG.
// filters: kết quả readFilters();  options: dữ liệu GET /universities/filter-options (null khi đang tải)
// onChange({ <field>: value }): báo field nào vừa đổi, trang cha cập nhật URL.
function UniversityFilters({ filters, options, onChange, onReset, canReset }) {
  const majorGroups = options?.majorGroups ?? []
  const districts = options?.districts ?? []
  const selectedGroup = majorGroups.find((group) => group.name === filters.group)
  // Đã chọn nhóm -> chỉ hiện ngành trong nhóm; chưa chọn -> hiện tất cả, chia theo nhóm.
  const groupsForMajorSelect = selectedGroup ? [selectedGroup] : majorGroups

  return (
    <section className="uni-filters" aria-label="Tìm kiếm và lọc trường">
      <div className="uni-search">
        <label htmlFor="uni-search-input" className="uni-filter-label">Tìm trường</label>
        <div className="uni-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            id="uni-search-input" type="search" className="input"
            placeholder="Tên hoặc tên viết tắt: UIT, bach khoa…"
            value={filters.q} onChange={(e) => onChange({ q: e.target.value })}
          />
        </div>
      </div>

      <div className="uni-filter-grid">
        <div className="uni-filter">
          <label htmlFor="filter-group" className="uni-filter-label">Nhóm ngành</label>
          <select
            id="filter-group" className="input" value={filters.group}
            // Đổi nhóm thì bỏ chọn ngành cũ (ngành cũ có thể không thuộc nhóm mới)
            onChange={(e) => onChange({ group: e.target.value, major: '' })}
          >
            <option value="">Tất cả nhóm ngành</option>
            {majorGroups.map((group) => <option key={group.name} value={group.name}>{group.name}</option>)}
          </select>
        </div>

        <div className="uni-filter">
          <label htmlFor="filter-major" className="uni-filter-label">Ngành</label>
          <select id="filter-major" className="input" value={filters.major} onChange={(e) => onChange({ major: e.target.value })}>
            <option value="">Tất cả ngành</option>
            {groupsForMajorSelect.map((group) => (
              <optgroup key={group.name} label={group.name}>
                {group.majors.map((major) => <option key={major.code} value={major.code}>{major.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="uni-filter">
          <label htmlFor="filter-tuition" className="uni-filter-label">Học phí</label>
          <select id="filter-tuition" className="input" value={filters.maxTuition} onChange={(e) => onChange({ maxTuition: e.target.value })}>
            {TUITION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div className="uni-filter">
          <label htmlFor="filter-district" className="uni-filter-label">Khu vực</label>
          <select id="filter-district" className="input" value={filters.district} onChange={(e) => onChange({ district: e.target.value })}>
            <option value="">Tất cả khu vực</option>
            {districts.map((district) => <option key={district} value={district}>{district}</option>)}
          </select>
        </div>
      </div>

      {filters.maxTuition && (
        <p className="uni-filter-note">
          Học phí tính theo năm; học phí theo học kỳ được ước tính × 2. Trường chỉ có học phí theo tín chỉ / trọn khóa
          hoặc chưa có dữ liệu học phí sẽ không hiện khi lọc học phí.
        </p>
      )}

      <div className="uni-filter-row">
        <div className="uni-type" role="group" aria-label="Loại trường">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value} type="button"
              aria-pressed={filters.type === option.value}
              className={filters.type === option.value ? 'selected' : ''}
              onClick={() => onChange({ type: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="uni-vnu">
          <input type="checkbox" checked={filters.vnuOnly} onChange={(e) => onChange({ vnuOnly: e.target.checked })} />
          Chỉ trường thuộc ĐHQG-HCM
        </label>

        {canReset && <button type="button" className="btn btn-outline uni-reset" onClick={onReset}>Xóa bộ lọc</button>}
      </div>
    </section>
  )
}

export default UniversityFilters
