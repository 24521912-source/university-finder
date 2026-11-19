export const INSTITUTION_TYPE_LABEL = {
  public: 'Công lập',
  private: 'Tư thục',
  international: 'Quốc tế',
  other: 'Khác',
}

const UNIT_LABEL = { year: 'năm', semester: 'học kỳ', credit: 'tín chỉ', program: 'khóa' }

// { amount: 20900000, unit: 'semester' } -> "20,9 tr/học kỳ";  { amount: 850000, unit: 'credit' } -> "850.000 đ/tín chỉ"
export function formatTuition(fee) {
  if (!fee) return null
  const amount =
    fee.amount >= 1e6
      ? `${(fee.amount / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`
      : `${fee.amount.toLocaleString('vi-VN')} đ`
  return `${amount}/${UNIT_LABEL[fee.unit] || fee.unit}`
}

// 20900000 -> "20,9 tr";  850000 -> "850.000 đ"
export function formatMoney(amount) {
  return amount >= 1e6
    ? `${(amount / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`
    : `${amount.toLocaleString('vi-VN')} đ`
}

// { unit: 'year', min: 30000000, max: 40000000 } -> "30 tr – 40 tr/năm";  min = max -> "30 tr/năm"
export function formatTuitionRange({ unit, min, max }) {
  const amount = min === max ? formatMoney(min) : `${formatMoney(min)} – ${formatMoney(max)}`
  return `${amount}/${UNIT_LABEL[unit] || unit}`
}
