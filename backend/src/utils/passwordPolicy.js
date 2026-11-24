// Quy tắc mật khẩu dùng chung cho đăng ký, đổi mật khẩu, đặt lại mật khẩu và admin tạo tài khoản.
// Chặn mật khẩu quá phổ biến (nằm trong các danh sách mật khẩu bị lộ, dễ bị dò) và mật khẩu chỉ gồm
// một ký tự lặp lại hoặc dãy liên tiếp (111111, 123456, abcdef, 987654...).
const MIN_PASSWORD = 6

// So sánh không phân biệt hoa thường, bỏ khoảng trắng hai đầu.
const COMMON_PASSWORDS = new Set([
  // Dãy số và bàn phím
  '123123', '123321', '123654', '112233', '121212', '123123123', '12341234', '1234512345',
  '147258', '147258369', '159753', '159357', '258456', '520520', '5201314', '666666', '696969',
  '888888', '0123456789', '0987654321', '1q2w3e', '1q2w3e4r', '1q2w3e4r5t', '1qaz2wsx', 'zaq12wsx',
  'qwerty', 'qwerty1', 'qwerty12', 'qwerty123', 'qwertyuiop', 'asdfgh', 'asdfghjkl', 'zxcvbn', 'zxcvbnm',
  '123qwe', 'qwe123', '1234qwer', 'qweasd', 'qweasdzxc', 'asd123', 'zxc123',
  // Chữ + số phổ biến
  'abc123', 'abc12345', 'abcd1234', '123abc', '1234abcd', 'a123456', 'a12345678', '123456a', '123456aa',
  'aa123456', 'aa112233', 'password', 'password1', 'password12', 'password123', 'passw0rd', 'p@ssw0rd',
  'p@ssword', 'pass123', 'pass1234', 'admin', 'admin1', 'admin123', 'admin1234', 'administrator', 'root123',
  'welcome', 'welcome1', 'welcome123', 'letmein', 'iloveyou', 'iloveu', 'loveyou', 'monkey', 'dragon',
  'football', 'baseball', 'sunshine', 'princess', 'starwars', 'superman', 'batman', 'trustno1', 'master',
  'hello', 'hello123', 'freedom', 'whatever', 'shadow', 'michael', 'secret', 'changeme', 'test123',
  'test1234', 'guest123', 'user123', 'login123', 'computer', 'internet',
  // Tiếng Việt và tên dự án
  'matkhau', 'matkhau1', 'matkhau123', 'anhyeuem', 'anhyeuem123', 'emyeuanh', 'emyeuanh123', 'yeuem',
  'yeuanh', 'vietnam', 'vietnam123', 'hochiminh', 'saigon', 'saigon123', 'unimatch', 'unimatch123',
  'unimatchhcmc', 'uit123', 'uit2026', 'daihoc', 'daihoc123', 'sinhvien', 'sinhvien123',
])

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '01234567890'

// Cả chuỗi là một ký tự lặp lại, hoặc là một đoạn liên tiếp (xuôi/ngược) của dãy số / bảng chữ cái.
function isTrivial(value) {
  if (/^(.)\1+$/u.test(value)) return true
  return [DIGITS, ALPHABET].some((run) => {
    const reversed = [...run].reverse().join('')
    return run.includes(value) || reversed.includes(value)
  })
}

// Trả về câu báo lỗi, hoặc null nếu hợp lệ.
// label: 'Mật khẩu' | 'Mật khẩu mới' | 'Mật khẩu tạm'. email: chặn mật khẩu trùng email hoặc phần trước @.
function passwordError(password, { label = 'Mật khẩu', email } = {}) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) return `${label} tối thiểu ${MIN_PASSWORD} ký tự`
  const value = password.trim().toLowerCase()
  if (COMMON_PASSWORDS.has(value) || isTrivial(value)) {
    return `${label} quá phổ biến, dễ bị đoán. Hãy dùng mật khẩu khác, nên kết hợp chữ, số và ký tự đặc biệt`
  }
  if (typeof email === 'string' && email.trim()) {
    const address = email.trim().toLowerCase()
    if (value === address || value === address.split('@')[0]) return `${label} không được trùng với email`
  }
  return null
}

module.exports = { passwordError, MIN_PASSWORD, COMMON_PASSWORDS }
