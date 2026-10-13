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
