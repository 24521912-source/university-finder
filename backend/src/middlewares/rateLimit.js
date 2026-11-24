// Giới hạn số request của một IP trong một khoảng thời gian, chặn dò mật khẩu và spam email.
// Đếm theo cửa sổ cố định, lưu trong RAM của tiến trình: PM2 chạy 2 instance thì mỗi instance đếm riêng,
// giới hạn thực tế tối đa gấp đôi. Vẫn đủ chặn dò tự động; chạy nhiều server cần đếm chung (vd. Redis).
//
//   windowMs        độ dài cửa sổ (ms)
//   max             số request tối đa trong một cửa sổ
//   skipSuccessful  không tính request thành công (status < 400), vd. đăng nhập đúng
//   now             đồng hồ, cho test
const MAX_TRACKED_IPS = 10_000

function rateLimit({ windowMs, max, skipSuccessful = false, now = Date.now }) {
  const hits = new Map() // ip -> { count, resetAt }

  function removeExpired(time) {
    for (const [ip, entry] of hits) if (entry.resetAt <= time) hits.delete(ip)
  }

  return function limitRequests(req, res, next) {
    const time = now()
    if (hits.size >= MAX_TRACKED_IPS) removeExpired(time)

    const ip = req.ip || req.socket?.remoteAddress || 'unknown'
    let entry = hits.get(ip)
    if (!entry || entry.resetAt <= time) {
      entry = { count: 0, resetAt: time + windowMs }
      hits.set(ip, entry)
    }

    const secondsLeft = Math.max(1, Math.ceil((entry.resetAt - time) / 1000))
    res.set('RateLimit-Limit', String(max))
    res.set('RateLimit-Reset', String(secondsLeft))

    if (entry.count >= max) {
      res.set('RateLimit-Remaining', '0')
      res.set('Retry-After', String(secondsLeft))
      const minutes = Math.ceil(secondsLeft / 60)
      return res.status(429).json({ message: `Bạn thử quá nhiều lần. Vui lòng thử lại sau ${minutes} phút.` })
    }

    entry.count += 1
    res.set('RateLimit-Remaining', String(max - entry.count))
    if (skipSuccessful) {
      res.on('finish', () => {
        if (res.statusCode < 400 && entry.count > 0) entry.count -= 1
      })
    }
    next()
  }
}

module.exports = { rateLimit }
