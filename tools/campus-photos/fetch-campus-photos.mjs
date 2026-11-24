// Tải ảnh khuôn viên các trường cho slider trang chủ từ Wikimedia Commons.
// Danh sách ảnh, tác giả và giấy phép nằm ở frontend/src/data/campusPhotos.js (chỉ sửa ở đó).
// Chạy: node tools/campus-photos/fetch-campus-photos.mjs
// Kết quả: frontend/public/campus/<tên-file>.jpg, chiều ngang 1280px (ảnh gốc nhỏ hơn thì giữ nguyên).
// Ảnh tải về nên nén lại (JPEG chất lượng ~78) trước khi commit để trang chủ tải nhanh.
// Wikimedia trả lỗi 429 khi gọi dồn dập: đợi vài phút rồi chạy lại, file đã có sẽ được bỏ qua
// (thêm --force để tải lại tất cả).
import fs from 'node:fs'
import path from 'node:path'
import { CAMPUS_PHOTOS } from '../../frontend/src/data/campusPhotos.js'

const root = path.resolve(import.meta.dirname, '../..')
const outDir = path.join(root, 'frontend/public')
const WIDTH = 1280
const MIN_BYTES = 100_000 // ảnh nhỏ hơn mức này coi như bản xem trước (400px), tải lại
// Wikimedia yêu cầu User-Agent mô tả rõ công cụ
const UA = 'UniversityFinderCampusPhotos/1.0 (student project; campus photo lookup)'
const force = process.argv.includes('--force')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res
}

// https://commons.wikimedia.org/wiki/File:Abc.jpg -> "File:Abc.jpg"
function fileTitle(sourceUrl) {
  return decodeURIComponent(new URL(sourceUrl).pathname.split('/wiki/')[1]).replaceAll('_', ' ')
}

async function thumbUrl(title) {
  const api = new URL('https://commons.wikimedia.org/w/api.php')
  api.search = new URLSearchParams({
    action: 'query', format: 'json', prop: 'imageinfo', iiprop: 'url', iiurlwidth: WIDTH, titles: title,
  })
  const data = await (await get(api)).json()
  const page = Object.values(data.query.pages)[0]
  return page.imageinfo[0].thumburl
}

let failed = 0
for (const photo of CAMPUS_PHOTOS) {
  const target = path.join(outDir, photo.src)
  if (!force && fs.existsSync(target) && fs.statSync(target).size >= MIN_BYTES) {
    console.log('đã có  ', photo.src)
    continue
  }

  try {
    const url = await thumbUrl(fileTitle(photo.source))
    await sleep(2000)
    const bytes = Buffer.from(await (await get(url)).arrayBuffer())
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, bytes)
    console.log('đã tải ', photo.src, `${Math.round(bytes.length / 1024)} KB`)
  } catch (err) {
    failed++
    console.error('lỗi    ', photo.src, err.message)
  }
  await sleep(3000)
}

if (failed) {
  console.error(`\n${failed} ảnh chưa tải được. Đợi vài phút rồi chạy lại lệnh.`)
  process.exitCode = 1
}
