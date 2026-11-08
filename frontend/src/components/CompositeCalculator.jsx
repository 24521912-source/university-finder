import { useState } from 'react'
import { COMBINATIONS } from '../features/recommendations/config'
import { FORMULAS, feasibility } from '../features/recommendations/composite'

const fmt = (n) => n.toLocaleString('vi-VN', { maximumFractionDigits: 2 })

// Máy tính điểm xét tuyển tổng hợp theo công thức riêng của trường, điền sẵn tổ hợp và điểm thi đã nhập.
function CompositeCalculator({ formula: formulaId, combination, subjectScores, programs }) {
  const formula = FORMULAS[formulaId]
  const mathX2 = formulaId === 'hcmut'
  const accepted = programs.filter((p) => p.accepted).flatMap((p) => p.combinations)
  const comboOk = (c) => COMBINATIONS[c] && (!mathX2 || COMBINATIONS[c].includes('Toán'))
  const startCombo = comboOk(combination) ? combination : (accepted.find((c) => COMBINATIONS[c]) || 'A00')
  const [form, setForm] = useState({
    combination: startCombo,
    thpt: startCombo === combination ? [...subjectScores] : ['', '', ''],
    hocBa: ['', '', ''], hasDgnl: false, dgnl: '', dgnlMath: '', bonus: '', priority: '',
  })
  const subjects = COMBINATIONS[form.combination] || []
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const setArr = (key, i, value) => setForm((f) => ({ ...f, [key]: f[key].map((v, j) => (j === i ? value : v)) }))
  const result = formula.compute({ ...form, dgnl: form.hasDgnl ? form.dgnl : '', dgnlMath: form.hasDgnl ? form.dgnlMath : '' })
  const comboOptions = Object.keys(COMBINATIONS).filter(comboOk)

  return (
    <div className="composite-calc">
      <div className="composite-calc-row">
        <label>Tổ hợp
          <select className="input" value={form.combination} onChange={(e) => setForm((f) => ({ ...f, combination: e.target.value, thpt: ['', '', ''], hocBa: ['', '', ''] }))}>
            {comboOptions.map((c) => <option key={c} value={c}>{c} — {COMBINATIONS[c].join(', ')}</option>)}
          </select>
        </label>
      </div>
      <table className="composite-calc-table">
        <thead><tr><th>Môn</th><th>Điểm thi THPT</th><th>TB học bạ 10–12</th></tr></thead>
        <tbody>{subjects.map((s, i) => <tr key={s}>
          <td>{s}{mathX2 && s === 'Toán' && <span className="badge">×2</span>}</td>
          <td><input className="input" type="number" min="0" max="10" step="0.05" aria-label={`Điểm thi ${s}`} value={form.thpt[i]} onChange={(e) => setArr('thpt', i, e.target.value)} /></td>
          <td><input className="input" type="number" min="0" max="10" step="0.01" aria-label={`Học bạ ${s}`} value={form.hocBa[i]} onChange={(e) => setArr('hocBa', i, e.target.value)} /></td>
        </tr>)}</tbody>
      </table>
      {formula.dgnl !== false && <label className="consult-compare-choice"><input type="checkbox" checked={form.hasDgnl} onChange={(e) => set('hasDgnl', e.target.checked)} /> Tôi có điểm ĐGNL ĐHQG-HCM 2026</label>}
      {form.hasDgnl && <div className="composite-calc-row">
        <label>Tổng ĐGNL (0–1200)<input className="input" type="number" min="0" max="1200" value={form.dgnl} onChange={(e) => set('dgnl', e.target.value)} /></label>
        {formula.dgnlMath && <label>Phần Toán ĐGNL (0–300)<input className="input" type="number" min="0" max="300" value={form.dgnlMath} onChange={(e) => set('dgnlMath', e.target.value)} /></label>}
      </div>}
      <div className="composite-calc-row">
        <label>Điểm cộng thành tích (0–10)<input className="input" type="number" min="0" max="10" step="0.25" value={form.bonus} onChange={(e) => set('bonus', e.target.value)} /></label>
        <label>Điểm ưu tiên khu vực/đối tượng (thang 30, 0–2,75)<input className="input" type="number" min="0" max="2.75" step="0.25" value={form.priority} onChange={(e) => set('priority', e.target.value)} /></label>
      </div>

      <p className="consult-help">{formula.notes}</p>
      {result.error ? <p className="consult-help" role="status">{result.error}</p> : <div className="composite-calc-result" aria-live="polite">
        <ul>
          {result.steps.map(([label, value]) => <li key={label}>{label}: <strong>{fmt(value)}</strong></li>)}
          <li>Điểm cộng: <strong>{fmt(result.bonus)}</strong> · Điểm ưu tiên (đã quy đổi, giảm dần khi ≥ 75): <strong>{fmt(result.priority)}</strong></li>
        </ul>
        <p className="composite-total">Điểm xét tuyển: <strong>{fmt(result.total)}</strong>/100</p>
        <ul className="composite-compare">{programs.map((p) => {
          const ok = p.combinations.includes(form.combination)
          const st = feasibility(result.total, p.cutoff)
          return <li key={p.program}>{p.majors.join(', ')} — {p.program}: điểm chuẩn {fmt(p.cutoff)} — {ok ? <span className={`composite-badge ${st.level}`}>{st.label} ({result.total >= p.cutoff ? '+' : ''}{fmt(result.total - p.cutoff)})</span> : <span className="composite-badge hard">Không xét tổ hợp {form.combination}</span>}</li>
        })}</ul>
      </div>}
    </div>
  )
}

export default CompositeCalculator
