import { useEffect, useState } from 'react'
import { getErrorMessage } from '../../services/api'
import { districtsOf, loadRecommendationData } from '../../features/recommendations/data'
import { recommend, validatePreferences } from '../../features/recommendations/recommend'
import { COMBINATIONS, DEFAULT_PRIORITIES, weightsFromPriorities } from '../../features/recommendations/config'
import { toConsultationPayload } from '../../features/recommendations/consultation'
import RecommendationResults from '../../components/RecommendationResults'
import SaveConsultation from '../../components/SaveConsultation'
import MajorPicker from '../../components/MajorPicker'
import './AI.css'

const initialPreferences = {
  major: null, majorCodes: [], method: 'high_school_exam', combination: 'A00', score: '', subjectScores: ['', '', ''],
  budget: 'any', district: 'any', institutionType: 'any', vnuhcm: 'any',
}

const combinationGroups = Object.keys(COMBINATIONS).reduce((groups, code) => {
  (groups[code[0]] ||= []).push(code)
  return groups
}, {})

function PrioritySelect({ id, value, onChange, allowIgnore = true }) {
  return <div className="consult-priority">
    <label htmlFor={`priority-${id}`}>Mức ưu tiên</label>
    <select id={`priority-${id}`} className="input" value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}{n === 1 ? ' — quan trọng nhất' : n === 5 ? ' — ít quan trọng' : ''}</option>)}
      {allowIgnore && <option value={0}>Không quan tâm</option>}
    </select>
  </div>
}

const validSubject = (v) => v !== '' && Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 10
const roundScore = (n) => Math.round(n * 100) / 100

function AI() {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [universities, setUniversities] = useState([])
  const [majorOptions, setMajorOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [errors, setErrors] = useState({})
  const [results, setResults] = useState(null)
  // Dữ liệu để lưu lịch sử, tạo cùng lúc với results. runId đổi mỗi lần tư vấn để nút Lưu reset.
  const [saved, setSaved] = useState({ runId: 0, payload: null })
  const [priorities, setPriorities] = useState(DEFAULT_PRIORITIES)

  function changePriority(key, value) {
    setPriorities((p) => ({ ...p, [key]: value }))
    setResults(null)
  }
  const priority = (key, allowIgnore) => <PrioritySelect id={key} value={priorities[key]} allowIgnore={allowIgnore} onChange={(v) => changePriority(key, v)} />

  useEffect(() => {
    const controller = new AbortController()
    loadRecommendationData(controller.signal)
      .then((data) => { if (!controller.signal.aborted) { setUniversities(data.universities); setMajorOptions(data.majors) } })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error.response || error.request ? getErrorMessage(error) : error.message)
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [attempt])

  function change(key, value) {
    setPreferences((p) => ({ ...p, [key]: value, ...(key === 'method' || key === 'combination' ? { score: '', subjectScores: ['', '', ''] } : {}) }))
    setErrors({})
    setResults(null)
  }

  function changeMajor(option) {
    setPreferences((p) => ({ ...p, major: option, majorCodes: option ? option.codes : [] }))
    setErrors({})
    setResults(null)
  }

  function changeSubject(index, value) {
    setPreferences((p) => ({ ...p, subjectScores: p.subjectScores.map((v, i) => (i === index ? value : v)) }))
    setErrors({})
    setResults(null)
  }

  const isExam = preferences.method === 'high_school_exam'
  const subjects = COMBINATIONS[preferences.combination] || []
  const subjectsComplete = preferences.subjectScores.every(validSubject)
  const subjectTotal = roundScore(preferences.subjectScores.reduce((sum, v) => sum + (validSubject(v) ? Number(v) : 0), 0))

  function submit(event) {
    event.preventDefault()
    const effective = isExam ? { ...preferences, score: subjectsComplete ? String(subjectTotal) : '' } : preferences
    const nextErrors = validatePreferences(effective)
    if (!preferences.major) nextErrors.majorCode = 'Hãy gõ và chọn một ngành / nhóm ngành trong danh sách gợi ý.'
    if (isExam) {
      delete nextErrors.score
      if (!COMBINATIONS[preferences.combination]) nextErrors.combination = 'Hãy chọn tổ hợp xét tuyển.'
      preferences.subjectScores.forEach((v, i) => { if (!validSubject(v)) nextErrors[`subject${i}`] = 'Nhập điểm từ 0 đến 10.' })
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length || loading || loadError) return
    const next = recommend(universities, effective, weightsFromPriorities(priorities))
    setResults(next)
    setSaved((s) => ({ runId: s.runId + 1, payload: toConsultationPayload(effective, next) }))
  }

  const scale = preferences.method === 'high_school_exam' ? 30 : 1200
  const fieldError = (key) => errors[key] && <p id={`${key}-error`} className="consult-field-error" role="alert">{errors[key]}</p>
  const inputProps = (key) => ({ 'aria-invalid': !!errors[key], 'aria-describedby': errors[key] ? `${key}-error` : undefined })

  return (
    <div className="container consult-page">
      <h1 className="page-title">AI tư vấn trường đại học phù hợp</h1>
      <p className="page-subtitle">Hãy cho chúng tôi biết nhu cầu của bạn.</p>
      <aside className="consult-notice">
        <strong>Bản thử nghiệm UniMatch HCMC</strong>
        <p>Gợi ý bằng quy tắc có thể giải thích, sử dụng bộ dữ liệu tham chiếu của dự án. Điểm phù hợp không phải xác suất trúng tuyển. Điểm chuẩn lịch sử chỉ để tham khảo; không tính điểm cộng hoặc ưu tiên.</p>
        <p>Hiện chỉ đánh giá chương trình chuẩn. Học phí tham chiếu năm học 2026–2027; dữ liệu có thể thiếu hoặc khác với thông tin tuyển sinh hiện hành.</p>
      </aside>
      {loading && <p role="status">Đang tải danh sách trường từ API…</p>}
      {loadError && <div className="alert-error" role="alert">{loadError} <button type="button" className="btn btn-outline" onClick={() => { setLoadError(''); setLoading(true); setAttempt((n) => n + 1) }}>Thử lại</button></div>}
      <form className="consult-form" onSubmit={submit} noValidate>
        <fieldset>
          <legend><span>1</span> Ngành muốn học</legend>
          {priority('major', false)}
          <label className="consult-label" htmlFor="majorCode">Gõ tên ngành hoặc nhóm ngành (không cần dấu, hiểu viết tắt như IT, QTKD)</label>
          <MajorPicker majors={majorOptions} value={preferences.major} onChange={changeMajor} inputProps={inputProps('majorCode')} />
          {preferences.major?.type === 'group' && <p className="consult-help">Nhóm gồm: {preferences.major.codes.map((c) => majorOptions.find((m) => m.code === c)?.name).filter(Boolean).join(', ')}.</p>}
          {fieldError('majorCode')}
        </fieldset>

        <fieldset>
          <legend><span>2</span> Điểm dự kiến</legend>
          {priority('admission')}
          <p className="consult-label" id="method-label">Phương thức xét tuyển</p>
          <div className="consult-choices two" role="group" aria-labelledby="method-label">
            {[['high_school_exam', 'Điểm THPT (thang 30)'], ['competency_assessment', 'ĐGNL ĐHQG-HCM (thang 1200)']].map(([value, label]) => <button key={value} type="button" aria-pressed={preferences.method === value} className={preferences.method === value ? 'selected' : ''} onClick={() => change('method', value)}>{label}</button>)}
          </div>
          {fieldError('method')}
          {isExam && <>
            <p className="consult-label" id="combination-label">Chọn tổ hợp xét tuyển</p>
            <div className="consult-combo-groups" role="group" aria-labelledby="combination-label">
              {Object.entries(combinationGroups).map(([block, codes]) => <div key={block} className="consult-combo-group">
                <span className="consult-combo-block">Khối {block}</span>
                <div className="consult-chips">
                  {codes.map((code) => <button type="button" key={code} title={COMBINATIONS[code].join(' – ')} aria-pressed={preferences.combination === code} className={preferences.combination === code ? 'selected' : ''} onClick={() => change('combination', code)}>{code}</button>)}
                </div>
              </div>)}
            </div>
            {fieldError('combination')}
          </>}
          <div className="consult-choices two consult-score-fields">
            {isExam ? <div>
              <p className="consult-label">Điểm từng môn tổ hợp {preferences.combination} (thang 10)</p>
              <div className="consult-subjects">
                {subjects.map((subject, i) => <div key={subject}>
                  <label htmlFor={`subject${i}`} className="consult-subject-name">{subject}</label>
                  <input id={`subject${i}`} className="input" type="number" min="0" max="10" step="0.05" inputMode="decimal" placeholder="0–10" value={preferences.subjectScores[i]} onChange={(e) => changeSubject(i, e.target.value)} {...inputProps(`subject${i}`)} />
                  {fieldError(`subject${i}`)}
                </div>)}
              </div>
              <p className="consult-total" aria-live="polite">Tổng điểm: <strong>{subjectsComplete ? subjectTotal.toLocaleString('vi-VN') : '—'}</strong>/30</p>
              <p className="consult-help">Chưa gồm điểm cộng, điểm ưu tiên khu vực / đối tượng.</p>
            </div> : <div>
              <label htmlFor="score" className="consult-label">Điểm dự kiến (0–{scale})</label>
              <div className="consult-score">
                <input aria-label="Thanh chọn điểm dự kiến" type="range" min="0" max={scale} step="1" value={preferences.score || 0} onChange={(e) => change('score', e.target.value)} />
                <input id="score" className="input" type="number" min="0" max={scale} step="any" placeholder={`0–${scale}`} value={preferences.score} onChange={(e) => change('score', e.target.value)} {...inputProps('score')} />
              </div>
              {fieldError('score')}
            </div>}
          </div>
        </fieldset>

        <fieldset>
          <legend><span>3</span> Học phí mong muốn</legend>
          {priority('tuition')}
          <div className="consult-choices" role="group" aria-label="Trần học phí theo năm">
            {[['20000000', 'Tối đa 20 triệu/năm'], ['40000000', 'Tối đa 40 triệu/năm'], ['60000000', 'Tối đa 60 triệu/năm'], ['100000000', 'Tối đa 100 triệu/năm'], ['any', 'Không quan trọng']].map(([value, label]) => <button key={value} type="button" aria-pressed={preferences.budget === value} className={preferences.budget === value ? 'selected' : ''} onClick={() => change('budget', value)}>{label}</button>)}
          </div>
          <label htmlFor="budget" className="consult-label">Hoặc nhập trần ngân sách cụ thể (đồng/năm)</label>
          <input id="budget" className="input" type="number" min="1" step="any" placeholder="Ví dụ: 75000000" value={preferences.budget === 'any' ? '' : preferences.budget} onChange={(e) => change('budget', e.target.value)} {...inputProps('budget')} />
          {fieldError('budget')}
        </fieldset>

        <fieldset>
          <legend><span>4</span> Khu vực</legend>
          {priority('geography')}
          <label htmlFor="district" className="consult-label">Khu vực mong muốn</label>
          <select id="district" className="input" value={preferences.district} onChange={(e) => change('district', e.target.value)}><option value="any">Không quan trọng</option>{districtsOf(universities).map((district) => <option key={district}>{district}</option>)}</select>
          <p className="consult-help">Trường có trụ sở đúng quận bạn chọn được 100 điểm khu vực, khác quận 0 điểm. Tính theo địa chỉ trụ sở; ngành có thể học ở cơ sở khác.</p>
        </fieldset>

        <fieldset>
          <legend><span>5</span> Loại trường</legend>
          <div className="consult-choices" role="group" aria-label="Loại trường">
            {[['public', 'Công lập'], ['private', 'Tư thục'], ['any', 'Không quan trọng']].map(([value, label]) => <button key={value} type="button" aria-pressed={preferences.institutionType === value} className={preferences.institutionType === value ? 'selected' : ''} onClick={() => change('institutionType', value)}>{label}</button>)}
          </div>
          {fieldError('institutionType')}
        </fieldset>

        <fieldset>
          <legend><span>6</span> Đại học Quốc gia TP.HCM</legend>
          <div className="consult-choices" role="group" aria-label="Thuộc Đại học Quốc gia TP.HCM">
            {[['only', 'Chỉ trường thuộc ĐHQG'], ['exclude', 'Ngoài ĐHQG'], ['any', 'Không quan trọng']].map(([value, label]) => <button key={value} type="button" aria-pressed={preferences.vnuhcm === value} className={preferences.vnuhcm === value ? 'selected' : ''} onClick={() => change('vnuhcm', value)}>{label}</button>)}
          </div>
          {fieldError('vnuhcm')}
        </fieldset>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading || !!loadError}>Tư vấn cho tôi</button>
      </form>

      {results && <RecommendationResults results={results} preferences={preferences}>
        {saved.payload && <SaveConsultation key={saved.runId} payload={saved.payload} />}
      </RecommendationResults>}
      <details className="consult-rules">
        <summary>Cách tính điểm và xử lý dữ liệu thiếu</summary>
        <p>Bạn chọn mức ưu tiên 1–5 cho từng tiêu chí (1 = quan trọng nhất). Trọng số tương ứng: 1 → 1; 2 → 0,75; 3 → 0,55; 4 → 0,4; 5 → 0,3; “Không quan tâm” → bỏ qua. Nhiều tiêu chí có thể cùng mức. Điểm tổng = tổng (điểm tiêu chí × trọng số) / tổng trọng số đã đánh giá. Thiếu dữ liệu được loại khỏi mẫu số, không gán 0.</p>
        <p>Ngành khớp: 100. Điểm tham chiếu: giới hạn trong 0–100 của 50 + 500 × (điểm nhập − điểm chuẩn) / thang điểm. Học phí: tối đa 100 của 100 × ngân sách / mức phí tối đa; miễn học phí: 100. Đây là quy tắc của prototype, không phải xác suất.</p>
        <p>Chỉ xếp hạng khi xác minh được ngành và ít nhất một tiêu chí khác. Điểm bằng nhau ưu tiên độ phủ cao hơn, rồi tên trường. Độ phủ là tỷ lệ trọng số có dữ liệu trên tổng trọng số ban đầu; trường có độ phủ khác nhau cần được cân nhắc riêng.</p>
        <p>Dữ liệu nguồn: database/seeds của dự án và các ngoại lệ trong DATA_NOTES.md. Một URL trong seed không chứng minh rằng thông tin đã được kiểm chứng lại theo thời gian thực. Không dùng điểm tổng hợp, điểm sai phương thức hoặc thang điểm chưa xác nhận để so sánh.</p>
      </details>
    </div>
  )
}

export default AI
