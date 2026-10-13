const dns = require('dns')
const mongoose = require('mongoose')

// Node trên Windows đôi khi đọc DNS thành 127.0.0.1 (router cấp DNS IPv6) → lỗi querySrv ECONNREFUSED
// khi tra chuỗi mongodb+srv của Atlas. Gặp đúng trường hợp đó thì chuyển sang DNS công cộng.
if (dns.getServers().every((server) => server === '127.0.0.1' || server === '::1')) {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
}

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Thiếu MONGODB_URI trong backend/.env (xem backend/.env.example)')
  }

  return mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || 'unimatch_hcmc',
  })
}

module.exports = connectDB
