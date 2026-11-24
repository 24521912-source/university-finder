# Báo cáo: Yêu cầu chấm điểm đồ án và mức độ đáp ứng

- **Dự án:** UniMatch HCMC — tra cứu, so sánh và AI tư vấn chọn trường đại học tại TP.HCM
- **Repo:** `24521912-source/university-finder` (private) · **Nhóm:** Tú (`24521912-source`), Hương (`ngochuong-money`)
- **Ngày lập:** 20/11/2026 · **Nhánh chứa phần DevOps / quản lý dự án:** `feature/devops`

Ký hiệu: ✅ đã xong và đã kiểm tra · 🟡 code / cấu hình đã sẵn sàng, **cần nhóm thao tác trên tài khoản** (GitHub, cloud, tên miền) · ❌ chưa làm

---

## 1. Thầy yêu cầu những gì

### Phần 1 — 5 điểm (bắt buộc)

| # | Yêu cầu |
|---|---|
| 1.1 | Có **database** |
| 1.2 | Có **API** (không quan tâm số lượng) |
| 1.3 | Có **web UI** |
| 1.4 | Có **tài liệu API viết bằng apidoc** và **public** |

### Phần 2 — 5 điểm còn lại

| # | Yêu cầu |
|---|---|
| 2.1 | **Mức hoàn thiện môi trường triển khai:** domain, DNS, web server, API server, cài đặt, cloud… |
| 2.2 | **Độ hoàn thiện project:** UI/UX, chức năng… |
| 2.3 | **Sáng tạo, tính mới:** chứng minh được điểm đặc biệt (xử lý, tối ưu, thiết kế giao diện…) |
| 2.4 | **Phối hợp nhóm, quản lý repo / code / workflow trên Git (BẮT BUỘC):** GitHub **Project** gắn với repo, **bảng Kanban**, item phân công theo từng luồng; test có bug thì ghi vào bảng; xem được lịch sử làm việc, commit |
| 2.5 | (Nâng cao) **AI workflow:** AI agent (Gemini) review code mỗi khi có commit, đánh giá trước khi merge |
| 2.6 | **PM2** (thầy yêu cầu dùng): cài global; theo dõi trạng thái và RAM của API; API tự restart và tự khởi động cùng máy chủ, không phụ thuộc cửa sổ điều khiển; `process.json` chứa biến môi trường, một file cho nhiều app; `instances` (nhiều process trên một server); cluster (nhiều server) để mở rộng |

---

## 2. Đã làm gì — đối chiếu từng yêu cầu

| # | Yêu cầu | Trạng thái | Đã làm / bằng chứng |
|---|---|:---:|---|
| 1.1 | Database | ✅ | MongoDB Atlas (cloud). 4 collection: `universities` (nhúng ngành, học phí, điểm chuẩn), `majors`, `users`, `admin_logs`; thêm `consultations` (model). Schema: `database/mongodb/schema.md`; dữ liệu mẫu 66 trường, 225 ngành (`database/seeds`); sao lưu / khôi phục: `npm run backup` / `restore-backup` |
| 1.2 | API | ✅ | Express REST, **31 endpoint**: xác thực JWT, trường (danh sách, tìm kiếm / lọc, so sánh, chi tiết), ngành, yêu thích, quản trị trường / tài khoản / lịch sử thay đổi. Có unit test (`backend/tests`) |
| 1.3 | Web UI | ✅ | React + Vite: trang chủ, danh sách + bộ lọc, chi tiết, so sánh, AI tư vấn, đăng nhập / đăng ký, cá nhân, quản trị |
| 1.4 | Tài liệu API bằng **apidoc**, public | ✅ / 🟡 | Đủ 31 endpoint trong `backend/apidoc/*.js` (tham số, body, phản hồi, mã lỗi, ví dụ curl). `npm run docs` tạo HTML vào `backend/public/api-docs`. **Backend tự phục vụ tài liệu tại `/api-docs`** (trang `/` tự chuyển tới đó). Vì vậy deploy backend ở đâu thì tài liệu public ở đó (VPS: `https://<tên miền>/api-docs`; Vercel: `vercel.json` đã thêm bước build tài liệu). CI build tài liệu ở mỗi PR (artifact `api-docs`). 🟡 **Còn lại:** deploy để có URL công khai (mục 2.1) |
| 2.1 | Môi trường triển khai | 🟡 | Đã có sẵn: `docs/DEPLOYMENT.md` hướng dẫn trọn bộ (kiến trúc, tên miền, bản ghi DNS, VPS Ubuntu, tường lửa, Node, **Nginx** web server + reverse proxy, **HTTPS Let's Encrypt**, **PM2**, cập nhật không gián đoạn, scale nhiều server). File cấu hình Nginx: `deploy/nginx/unimatch.conf` (SPA fallback, proxy `/api` và `/api-docs`, gzip, cache, `upstream` để thêm server). Phương án Vercel đã có sẵn. 🟡 **Còn lại:** thuê / nhận VPS và tên miền (miễn phí với GitHub Student Pack / Azure for Students) rồi làm theo hướng dẫn |
| 2.2 | Hoàn thiện project | ✅ | UI mobile-first (375px không cuộn ngang), dùng được bằng bàn phím (skip-link, menu di động với Escape, `aria-*`), thông báo lỗi / đang tải / rỗng rõ ràng, bộ lọc lưu trên URL, quản trị có phân quyền 3 cấp + lịch sử + khôi phục |
| 2.3 | Sáng tạo / điểm đặc biệt | ✅ | Xem mục 4 |
| 2.4 | GitHub Project + Kanban + phân công + ghi bug | 🟡 | Script `tools/github-project/setup-project.mjs` tạo project **"UniMatch HCMC – Kanban"**, gắn repo, tạo 16 label, thêm 2 trường **Module** (10 luồng) + **Priority**, và nạp **100 item** từ WBS thành issue, có người phụ trách và trạng thái thật (47 Done / 23 In Progress / 30 Todo; Tú 32, Hương 31, chưa giao 37), kèm **2 bug thật** phát hiện khi test. Mẫu issue **🐞 Báo lỗi** và **📋 Công việc**, mẫu PR có `Closes #`. Đã chạy thử `--dry-run`. 🟡 **Còn lại:** token `gh` hiện thiếu quyền `project`, nhóm cần chạy `gh auth refresh -s project` rồi chạy script (mục 3) |
| 2.4 | Quản lý repo / workflow Git | ✅ | Mỗi chức năng một nhánh `feature/<tên>`, merge vào `develop` qua Pull Request (đã có 16 PR); commit theo Conventional Commits; CI GitHub Actions (`.github/workflows/ci.yml`): backend test + build apidoc, frontend lint + test + build, test script AI review |
| 2.5 | AI agent Gemini review code | 🟡 | `.github/workflows/gemini-review.yml` + `.github/scripts/gemini-review.mjs`. Mỗi lần PR được mở **hoặc có commit mới**, Gemini đọc diff (bỏ lockfile, file build, ảnh) kèm `project-rules.md` của nhóm, trả JSON đánh giá. Bot **bình luận vào PR** (cập nhật một bình luận duy nhất, không spam) với bảng vấn đề 🔴 critical / 🟠 major / 🟡 minor. Kết luận `REQUEST_CHANGES` thì **check fail**, kết hợp branch protection là **chặn merge**. Gemini lỗi / hết hạn mức thì chỉ cảnh báo, không chặn. Có 7 unit test. 🟡 **Còn lại:** thêm secret `GEMINI_API_KEY` (mục 3) |
| 2.6 | PM2 | ✅ / 🟡 | `process.json` (gốc repo) có **2 app trong 1 file**: `unimatch-api` (**cluster**, `instances: 2`, `env` / `env_production`, `max_memory_restart: 300M`, tự restart) và `unimatch-web` (`serve` có sẵn của PM2 phục vụ `frontend/dist`). Biến bí mật đọc từ `backend/.env`, không nằm trong file. **Đã chạy thử thật** (mục 5). Hướng dẫn `pm2 save` + `pm2 startup` (tự chạy lại khi mất điện / reboot), `pm2 status` / `monit` / `logs`, cluster nhiều server bằng Nginx `upstream`: `docs/DEPLOYMENT.md` mục 5. 🟡 **Còn lại:** chạy trên VPS Linux (`pm2 startup` không hỗ trợ Windows) |

### Đối chiếu kiến thức PM2 thầy nêu với cấu hình

| Thầy nêu | Trong dự án |
|---|---|
| Biết tình trạng API, tốn bao nhiêu RAM khi remote server | `pm2 status`, `pm2 monit`, `pm2 jlist` (đã thử: mỗi process API khoảng 90–100 MB) |
| API tự khởi động lại cùng máy (cúp điện rồi mở lại) | `pm2 save` + `pm2 startup systemd` |
| Không lệ thuộc cửa sổ điều khiển | PM2 chạy nền dạng daemon; đóng SSH vẫn chạy |
| Cài pm2 global dùng cho cả project | `sudo npm install -g pm2` (DEPLOYMENT.md mục 3) |
| `process.json` có biến môi trường, 1 file cho nhiều app | `env` / `env_production`; 2 app `unimatch-api`, `unimatch-web` |
| `instances`: nhiều process / 1 server, dùng nhiều CPU | `"instances": 2`, đổi `"max"` để dùng hết CPU |
| Cluster: nhiều server A, B, C để mở rộng | `exec_mode: cluster` trong 1 máy + `upstream unimatch_api` trong Nginx cho nhiều máy; backend không lưu trạng thái (JWT + Atlas) nên scale ngang được |

---

## 3. Việc nhóm cần làm trên tài khoản (GitHub, Google AI Studio, cloud, tên miền)

| # | Việc | Cách làm | Thời gian |
|---|---|---|---|
| 1 | **Tạo bảng Kanban** | `gh auth refresh -s project` (mở trình duyệt xác nhận), rồi tại thư mục repo: `node tools/github-project/setup-project.mjs`. Sau đó vào project → **+ New view → Board**, bật **Workflows → Auto-add to project** và **Item closed → Done** | 10 phút |
| 2 | **Bật AI review** | Lấy API key tại Google AI Studio → GitHub repo **Settings → Secrets and variables → Actions → New repository secret** tên `GEMINI_API_KEY` | 5 phút |
| 3 | **Chặn merge khi chưa đạt** | **Settings → Branches → Add rule** cho `develop` và `main`: *Require a pull request*, *Require status checks*: chọn `Backend — test + tài liệu API`, `Frontend — lint + test + build`, `review` | 5 phút |
| 4 | **Deploy có tên miền** | Theo `docs/DEPLOYMENT.md`: nhận VPS + tên miền miễn phí (GitHub Student Pack / Azure for Students), trỏ DNS, cài Nginx + PM2 + HTTPS. Nhớ thêm IP VPS vào **MongoDB Atlas → Network Access** | 1–2 giờ |
| 5 | **Tạo PR** cho các nhánh đang chờ | `feature/layout-v2`, `feature/universities`, `feature/ai-advisor`, `feature/devops` | 10 phút |
| 6 | **Ghi bug khi test** | Tạo issue bằng mẫu **🐞 Báo lỗi**, kéo thả trên bảng Kanban, PR sửa ghi `Closes #<số>` | Liên tục |

---

## 4. Điểm sáng tạo / đặc biệt có thể trình bày (mục 2.3)

1. **AI tư vấn "giải thích được":** chấm 4 tiêu chí (ngành, điểm, học phí, khu vực) theo mức ưu tiên người dùng chọn. Mỗi điểm số đều có **câu lý do + link nguồn chính thức**. Dữ liệu thiếu **không gán 0** mà loại khỏi mẫu số, đi kèm "độ phủ dữ liệu". Riêng các trường xét tuyển tổng hợp (Bách khoa, UEL, USSH) có công thức thang 100 và máy tính chi tiết (`docs/LUONG_AI_TU_VAN.md`).
2. **Kiểm soát chất lượng dữ liệu cho AI:** admin đánh dấu `verifiedForAI` cho từng dòng điểm chuẩn; ngành chỉ được tin khi nguồn thuộc tên miền chính thức của trường.
3. **Tìm kiếm tiếng Việt không dấu + viết tắt** ở backend (`uit`, `bach khoa`, `đại học y dược`), ưu tiên trùng tên viết tắt; lọc học phí có quy đổi học kỳ → năm và ghi chú minh bạch.
4. **So sánh 2–3 trường** cạnh nhau, tự đánh dấu trường học phí thấp nhất.
5. **Quản trị có lịch sử thay đổi + khôi phục** (lưu `before` / `after`), phân quyền 3 cấp, sao lưu / khôi phục database.
6. **Kỹ thuật frontend:** hủy request cũ bằng `AbortController` (không bị kết quả cũ ghi đè), debounce ô tìm kiếm, bộ lọc lưu trên URL, mobile-first, accessibility.
7. **Quy trình DevOps có AI:** CI + Gemini review tự động chặn merge khi có lỗi nghiêm trọng; tài liệu API sinh tự động; PM2 cluster + Nginx sẵn sàng scale.

---

## 5. Kết quả đã kiểm tra thực tế (20/11/2026)

| Kiểm tra | Kết quả |
|---|---|
| `npm run docs` (apidoc 1.2.0) | ✅ Tạo 31 endpoint, không cảnh báo |
| PM2 7.1.2 chạy `process.json` (cổng thử 5057 / 8082, PM2_HOME riêng) | ✅ `unimatch-api` cluster tất cả process `online`; `unimatch-web` `online` |
| Qua PM2: `/api/health` · `/api/universities` · `/api-docs/` · `/` | ✅ 200 · 66 trường · 200 · 302 → `/api-docs/` |
| Qua PM2: web `/` và `/truong` (vào thẳng link con) | ✅ 200 · 200 (SPA fallback) |
| `pm2 jlist` đo RAM | ✅ khoảng 90–100 MB / process API, 60 MB web |
| Unit test backend · script AI review | ✅ 28/28 · 7/7 |
| Frontend `eslint` | ✅ sạch |
| Script Kanban `--dry-run` | ✅ 100 item, 16 label |
| File YAML workflow / mẫu issue | ✅ hợp lệ |
| **Chưa kiểm tra được** | Workflow chạy thật trên GitHub (chưa push), Gemini thật (chưa có key), deploy Vercel / VPS (chưa có server, tên miền), tạo project thật (thiếu quyền `project`) |

---

## 6. Danh sách file mới / sửa trong nhánh `feature/devops`

| File | Nội dung |
|---|---|
| `backend/apidoc.json`, `backend/apidoc/*.js`, `backend/apidoc/HEADER.md` | Tài liệu API (apidoc) |
| `backend/package.json`, `backend/package-lock.json` | Thêm `apidoc` (devDependency) + script `npm run docs` |
| `backend/src/app.js` | Phục vụ `/api-docs`, `/` chuyển hướng tới tài liệu |
| `backend/vercel.json` | Build tài liệu + đóng gói `public/` khi deploy Vercel |
| `.gitignore` | Bỏ qua `backend/public/api-docs/` (file sinh tự động) |
| `process.json` | Cấu hình PM2 |
| `deploy/nginx/unimatch.conf` | Cấu hình Nginx |
| `docs/DEPLOYMENT.md` | Hướng dẫn deploy |
| `.github/workflows/ci.yml` | CI |
| `.github/workflows/gemini-review.yml`, `.github/scripts/gemini-review*.mjs` | AI review + test |
| `.github/ISSUE_TEMPLATE/*.yml`, `.github/pull_request_template.md` | Mẫu issue / PR |
| `tools/github-project/setup-project.mjs`, `tasks.json` | Tạo bảng Kanban |
| `README.md` | Hướng dẫn apidoc, PM2, Kanban, CI |
| `docs/BAO_CAO_YEU_CAU_DO_AN.md` | Báo cáo này |
