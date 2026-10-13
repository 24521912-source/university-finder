// Điểm vào khi deploy lên Vercel: Vercel gọi Express app như một serverless function.
// Chạy local vẫn dùng `npm run dev` (src/server.js) như cũ.
module.exports = require('../src/app')
