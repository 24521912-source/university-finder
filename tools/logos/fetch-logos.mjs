// Tải biểu tượng (logo vuông) chính thức của từng trường từ website của trường.
// Ưu tiên: SVG > apple-touch-icon / icon lớn nhất > favicon.ico.
// Chạy: node tools/logos/fetch-logos.mjs [slug ...]
// Kết quả: frontend/public/logos/<slug>.<đuôi> và frontend/src/data/universityLogos.json
// Ảnh lớn hơn 256px nên thu nhỏ về 256px trước khi commit (logo chỉ hiện tối đa 88px).
// Trường nào tải sai / mờ thì thay tay file trong public/logos rồi chạy lại với --manifest-only.
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const outDir = path.join(root, 'frontend/public/logos')
const manifestFile = path.join(root, 'frontend/src/data/universityLogos.json')
const universities = JSON.parse(fs.readFileSync(path.join(root, 'database/seeds/universities.json'), 'utf8'))
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'
const EXT = { 'image/png': 'png', 'image/svg+xml': 'svg', 'image/x-icon': 'ico', 'image/vnd.microsoft.icon': 'ico', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }

async function get(url, ms = 15000) {
  // Wikipedia yêu cầu User-Agent mô tả rõ công cụ.
  const ua = /wiki(pedia|media)\.org/.test(url) ? 'UniversityFinderLogoScript/1.0 (student project; logo lookup)' : UA
  const res = await fetch(url, { headers: { 'User-Agent': ua }, redirect: 'follow', signal: AbortSignal.timeout(ms) })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res
}

// Kích thước ảnh (cạnh nhỏ hơn) đọc từ header file; SVG coi như vô hạn.
function imageSize(buf, type) {
  if (type === 'svg') return Infinity
  if (type === 'png' && buf.length > 24) return Math.min(buf.readUInt32BE(16), buf.readUInt32BE(20))
  if (type === 'gif') return Math.min(buf.readUInt16LE(6), buf.readUInt16LE(8))
  if (type === 'ico') {
    let best = 0
    for (let i = 0, n = buf.readUInt16LE(4); i < n; i++) best = Math.max(best, buf[6 + i * 16] || 256)
    return best
  }
  if (type === 'jpg') {
    for (let i = 2; i < buf.length - 9;) {
      if (buf[i] !== 0xff) return 0
      const marker = buf[i + 1]
      if (marker >= 0xc0 && marker <= 0xc3) return Math.min(buf.readUInt16BE(i + 5), buf.readUInt16BE(i + 7))
      i += 2 + buf.readUInt16BE(i + 2)
    }
  }
  if (type === 'webp' && buf.toString('ascii', 12, 16) === 'VP8X') return Math.min(1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3))
  return 0
}

function sniff(buf, contentType) {
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buf[0] === 0 && buf[1] === 0 && buf[2] === 1 && buf[3] === 0) return 'ico'
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpg'
  if (buf.toString('ascii', 0, 4) === 'GIF8') return 'gif'
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  // Trang HTML (lỗi 404, trang chống bot...) có thể chứa thẻ <svg>: không phải file ảnh.
  const head = buf.subarray(0, 1000).toString('utf8').replace(/^﻿/, '').trimStart()
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(head)) return 'svg'
  if (/^<(!doctype html|html)/i.test(head)) return null
  const type = EXT[contentType?.split(';')[0]]
  return type === 'svg' ? null : type || null
}

function candidates(html, base) {
  const list = []
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const rel = tag.match(/rel\s*=\s*["']([^"']+)["']/i)?.[1].toLowerCase() || ''
    const href = tag.match(/href\s*=\s*["']([^"']+)["']/i)?.[1]
    if (!href || !/icon/.test(rel) || /mask-icon/.test(rel)) continue
    const sizes = Number(tag.match(/sizes\s*=\s*["'](\d+)x\d+/i)?.[1]) || 0
    list.push({ url: new URL(href, base).href, hint: /apple/.test(rel) ? Math.max(sizes, 180) : sizes })
  }
  const tile = html.match(/<meta[^>]+name=["']msapplication-TileImage["'][^>]+content=["']([^"']+)/i)?.[1]
  if (tile) list.push({ url: new URL(tile, base).href, hint: 144 })
  for (const file of ['/apple-touch-icon.png', '/apple-touch-icon-precomposed.png', '/favicon.svg', '/favicon.png', '/favicon.ico']) list.push({ url: new URL(file, base).href, hint: 0 })
  return [...new Map(list.map((c) => [c.url, c])).values()]
}

async function fetchLogo(u) {
  const site = u.contact?.website
  if (!site) return { error: 'không có website' }
  let html = ''
  let base = site
  try {
    const res = await get(site)
    base = res.url
    html = await res.text()
  } catch (error) {
    html = ''
    base = site
    if (!/^https?:/.test(site)) return { error: error.message }
  }
  let best = null
  for (const c of candidates(html, base)) {
    try {
      const res = await get(c.url, 10000)
      const buf = Buffer.from(await res.arrayBuffer())
      const type = sniff(buf, res.headers.get('content-type'))
      if (!type || buf.length < 100) continue
      const size = imageSize(buf, type)
      if (!best || size > best.size) best = { buf, type, size, url: c.url }
      if (size === Infinity) break
    } catch { /* thử ứng viên tiếp theo */ }
  }
  // Không có icon đủ nét: lấy ảnh logo ở đầu trang chủ (thường là logo ngang, giao diện sẽ thu vừa khung).
  if (!best || best.size < 64) {
    const logos = (html.match(/<img\b[^>]*>/gi) || [])
      .filter((tag) => /logo/i.test(tag))
      .map((tag) => tag.match(/\b(?:data-src|src)\s*=\s*["']([^"']+)["']/i)?.[1])
      .filter((src) => src && !src.startsWith('data:'))
      .slice(0, 3)
    for (const src of logos) {
      try {
        const url = new URL(src, base).href
        const res = await get(url, 10000)
        const buf = Buffer.from(await res.arrayBuffer())
        const type = sniff(buf, res.headers.get('content-type'))
        if (!type || buf.length < 100) continue
        const size = imageSize(buf, type)
        if (size >= 40 && (!best || size > best.size)) { best = { buf, type, size, url }; break }
      } catch { /* thử ảnh tiếp theo */ }
    }
  }
  return best || { error: 'không tìm thấy icon' }
}

// Logo trong hộp thông tin (infobox) của bài Wikipedia về trường; ảnh thu nhỏ 256px (SVG được đổi sang PNG).
// Wikipedia giới hạn tốc độ: các yêu cầu tới Wikipedia xếp hàng, cách nhau 1,5 giây.
let wikiSlot = 0
async function wikiGet(url) {
  const wait = wikiSlot - Date.now()
  wikiSlot = Math.max(Date.now(), wikiSlot) + 1500
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
  return get(url, 20000)
}
const wikiApi = (lang, params) => wikiGet(`https://${lang}.wikipedia.org/w/api.php?format=json&${new URLSearchParams(params)}`).then((r) => r.json())

async function fetchWikiLogo(u, lang) {
  const search = await wikiApi(lang, { action: 'query', list: 'search', srsearch: u.name, srlimit: '1' })
  const title = search.query?.search?.[0]?.title
  // Kết quả tìm kiếm phải đúng trường: tên bài chứa phần lõi của tên trường (bỏ "Trường Đại học", "Học viện"...).
  const fold = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()
  const core = fold(u.name).replace(/^(truong )?(dai hoc|hoc vien|nhac vien)\s+/, '').split(/[\s,(]+/).slice(0, 2).join(' ')
  if (!title || (lang === 'vi' && !fold(title).includes(core))) return null
  const page = await wikiApi(lang, { action: 'parse', page: title, prop: 'wikitext', redirects: '1' })
  const text = page.parse?.wikitext?.['*'] || ''
  const file = text.match(/\|\s*(?:logo|biểu trưng|huy hiệu|seal|image_name)\s*=\s*(?:\[\[)?(?:(?:Tập tin|Hình|File|Image):)?([^\n|\]]+?\.(?:svg|png|jpe?g|gif|webp))/i)?.[1]
  if (!file) return null
  const info = await wikiApi(lang, { action: 'query', titles: `File:${file.trim()}`, prop: 'imageinfo', iiprop: 'url', iiurlwidth: '256' })
  const image = Object.values(info.query?.pages || {})[0]?.imageinfo?.[0]
  const url = image?.thumburl || image?.url
  if (!url) return null
  const res = await wikiGet(url)
  const buf = Buffer.from(await res.arrayBuffer())
  const type = sniff(buf, res.headers.get('content-type'))
  return type ? { buf, type, size: imageSize(buf, type), url } : null
}

function writeManifest() {
  const files = fs.existsSync(outDir) ? fs.readdirSync(outDir) : []
  const manifest = {}
  for (const u of universities) {
    const file = files.find((f) => f.replace(/\.[a-z]+$/, '') === u.slug)
    if (file) manifest[u.slug] = `/logos/${file}`
  }
  fs.mkdirSync(path.dirname(manifestFile), { recursive: true })
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`manifest: ${Object.keys(manifest).length}/${universities.length} trường có logo`)
}

// Favicon của các trường này là icon mặc định (WordPress, tài liệu...), không phải logo.
const PREFER_WIKI = new Set(['su-pham-the-duc-the-thao-tphcm', 'hoc-vien-ky-thuat-mat-ma-phia-nam'])

const args = process.argv.slice(2)
const SKIP_WIKI = args.includes('--no-wiki') // khi Wikipedia đang giới hạn tốc độ
if (!args.includes('--manifest-only')) {
  fs.mkdirSync(outDir, { recursive: true })
  const slugs = args.filter((a) => !a.startsWith('--'))
  const targets = slugs.length ? universities.filter((u) => slugs.includes(u.slug)) : universities
  for (let i = 0; i < targets.length; i += 6) {
    await Promise.all(targets.slice(i, i + 6).map(async (u) => {
      let r = PREFER_WIKI.has(u.slug) ? { error: 'icon trên web trường không phải logo' } : await fetchLogo(u)
      // Icon trên web nhỏ / thiếu / sai thì thử logo trên Wikipedia (tiếng Việt rồi tiếng Anh).
      if (!SKIP_WIKI && (r.error || r.size < 120)) {
        for (const lang of ['vi', 'en']) {
          const wiki = await fetchWikiLogo(u, lang).catch(() => null)
          if (wiki && (r.error || wiki.size > r.size)) { r = { ...wiki, url: `wikipedia(${lang}) ${wiki.url}` }; break }
        }
      }
      if (r.error) return console.log(`✗ ${u.slug}: ${r.error}`)
      // Tải được logo mới thì mới bỏ file cũ của trường này (khác đuôi thì không bị ghi đè).
      for (const old of fs.readdirSync(outDir).filter((f) => f.replace(/\.[a-z]+$/, '') === u.slug)) fs.unlinkSync(path.join(outDir, old))
      fs.writeFileSync(path.join(outDir, `${u.slug}.${r.type}`), r.buf)
      console.log(`✓ ${u.slug}: ${r.type} ${r.size === Infinity ? 'vector' : r.size + 'px'} ← ${r.url}`)
    }))
  }
}
writeManifest()
