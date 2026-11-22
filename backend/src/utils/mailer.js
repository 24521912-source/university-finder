// Gửi email qua SMTP (mặc định Gmail). Cấu hình trong backend/.env: SMTP_USER, SMTP_PASS (mật khẩu ứng dụng),
// tùy chọn SMTP_HOST, SMTP_PORT, MAIL_FROM.
// Chạy local mà chưa cấu hình: thư được in ra terminal thay vì gửi, để vẫn thử được chức năng.
const nodemailer = require('nodemailer')

let transporter = null

const isConfigured = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)
const isProduction = () => process.env.NODE_ENV === 'production'

// Có gửi (hoặc in ra terminal) được không. Trên server thật mà thiếu cấu hình -> false.
const canSend = () => isConfigured() || !isProduction()

function getTransporter() {
  const port = Number(process.env.SMTP_PORT) || 465
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465, // 465: TLS ngay từ đầu; 587: STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return transporter
}

async function sendMail({ to, subject, text, html }) {
  if (!isConfigured()) {
    if (isProduction()) throw new Error('Chưa cấu hình SMTP_USER / SMTP_PASS')
    console.info(`\n[mail] Chưa cấu hình SMTP nên chỉ in thư ra đây.\nTới: ${to}\nTiêu đề: ${subject}\n\n${text}\n`)
    return
  }
  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || `UniMatch HCMC <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  })
}

module.exports = { canSend, sendMail }
