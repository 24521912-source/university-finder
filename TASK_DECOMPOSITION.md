# Task Decomposition (WBS)

Ghi task và contract **trước** khi code hoặc nhờ AI. Mỗi sub-task tương ứng một commit.

---

## WBS 2.1 — Mô tả quy trình nghiệp vụ người dùng

- **Phụ trách:** Tú · **Ưu tiên:** P0 · **Trạng thái:** DONE
- **Sản phẩm:** `docs/QUY_TRINH_NGHIEP_VU_NGUOI_DUNG.md` — đối tượng (khách / người dùng), bảng chức năng, 9 quy trình theo bước, ràng buộc, chức năng chưa làm.
- **Commit gợi ý:** `docs(spec): describe user business processes (WBS 2.1)`

## WBS 2.4 — Thiết kế luồng xử lý AI tư vấn

- **Phụ trách:** Tú · **Ưu tiên:** P0 · **Trạng thái:** DONE
- **Sản phẩm:** `docs/LUONG_AI_TU_VAN.md` — sơ đồ luồng (Mermaid), đầu vào, trọng số, công thức 6 tiêu chí, độ phủ, trường xét tuyển tổng hợp, đầu ra. Mô tả đúng code hiện có của `features/recommendations/` (Hương cài đặt).
- **Commit gợi ý:** `docs(spec): design AI advisor processing flow (WBS 2.4)`

---

## WBS 4.1 — Layout chung: header, footer, navigation

- **Phụ trách:** Tú · **Ưu tiên:** P0 · **Nhánh:** `feature/layout`
- **Trạng thái:** DONE — làm trên `feature/layout` (chưa merge), đã chép sang `feature/tu-tasks` và giữ phần Hương thêm sau (`isAdmin()` cho superadmin, banner mật khẩu tạm dùng token `--warning-*`).
- **Phạm vi:** `frontend/src/layouts/MainLayout.jsx`, `components/Header.jsx`, `components/Footer.jsx`, `src/App.css`, token trong `src/index.css`.

### Sub-task

| ID | Việc | Commit |
|---|---|---|
| T-4.1A | Định nghĩa contract (bảng dưới) | `docs(spec): define layout contract & WBS 4.1` |
| T-4.1B | Cây landmark ngữ nghĩa: skip-link, `header`, `nav`, `main`, `footer` | `feat(html): semantic layout landmarks with skip-link` |
| T-4.1C | Token màu + CSS mobile-first cho header, nav, footer | `feat(css): mobile-first header, nav & footer` |
| T-4.1D | Menu di động: nút bật/tắt, Escape đóng menu, chọn link thì đóng | `feat(js): accessible mobile menu toggle` |
| T-4.1E | Kiểm tra theo tiêu chí nghiệm thu | (không commit code) |

### Contract — Cấu trúc landmark

```text
<a class="skip-link" href="#main-content">       ← phần tử focus đầu tiên
<header class="site-header">
  logo (link về "/")
  <button class="menu-toggle" aria-expanded aria-controls="main-menu">   ← chỉ hiện < 960px
  #main-menu
    <nav aria-label="Điều hướng chính"><ul><li><a>…   ← NavLink, trang hiện tại có aria-current="page"
    tài khoản: Đăng nhập / Đăng ký  hoặc  tên + Đăng xuất
<main id="main-content" tabindex="-1">            ← mỗi trang có đúng 1 <h1> ở đây
<footer class="site-footer">
  giới thiệu ngắn · <nav aria-label="Liên kết chân trang"> · ghi chú nguồn dữ liệu · ©
```

Header **không** chứa `<h1>` (tiêu đề trang thuộc `main`).

### Contract — Điều hướng

| Mục | Đường dẫn | Hiện khi |
|---|---|---|
| Trang chủ | `/` | luôn |
| Trường | `/truong` | luôn |
| AI tư vấn | `/ai-tu-van` | luôn |
| Cá nhân | `/ca-nhan` | luôn (chưa đăng nhập → chuyển sang đăng nhập) |
| Quản trị | `/admin` | chỉ `role = admin` |

### Contract — Responsive

| Độ rộng | Header |
|---|---|
| 375px – 959px (gốc) | Logo + nút menu; menu mở thành khối dọc phía dưới (link + tài khoản) |
| ≥ 960px | Logo · menu ngang ở giữa · tài khoản bên phải (giống prototype); ẩn nút menu |

Footer: 1 cột ở 375px, 3 cột từ 768px.

### Contract — Hành vi menu di động

| Sự kiện | Kết quả |
|---|---|
| Bấm / Enter / Space trên nút menu | Mở ↔ đóng; `aria-expanded` = `true` / `false` |
| `keydown` với `event.key === 'Escape'` khi menu mở | Đóng menu, focus trả về nút menu |
| Chọn một link, logo hoặc Đăng xuất | Đóng menu |

### Contract — Token (khai báo trong `:root`)

`--header-bg`, `--on-primary`, `--header-hover`, `--header-border`, `--header-divider`, `--nav-active-bg`, `--nav-active-text`, `--surface`, `--header-height`. Rule CSS của layout **không** chứa mã màu trực tiếp.

### Tiêu chí nghiệm thu (T-4.1E)

- [x] 375px: không cuộn ngang; menu mở/đóng được. (kiểm bằng Playwright 20/11/2026)
- [ ] ≥ 960px: bố cục khớp prototype.
- [x] Chỉ dùng bàn phím: Tab tới skip-link → Enter nhảy vào nội dung; Tab qua mọi link; Escape đóng menu (focus trả về nút menu).
- [ ] Luôn thấy viền focus, kể cả trên nền header xanh đậm.
- [x] DevTools → Accessibility: thấy đủ banner, navigation, main, contentinfo.
- [ ] Tương phản chữ ≥ 4.5:1 (chữ trắng trên `--header-bg`, chữ trên mục đang chọn).
- [x] Không lỗi console; `npm run lint` và `npm run build` sạch.

---

## WBS 5.4 + 4.4 — API tìm kiếm / lọc trường + bộ lọc trên giao diện

- **Phụ trách:** Tú · **Ưu tiên:** P0 · **Trạng thái:** DONE
- **Contract:** `GET /api/universities/search`, `GET /api/universities/filter-options` (xem `docs/API_CONTRACT.md`).
- **Backend:** `modules/universities/universities.search.js` (hàm thuần: tìm không dấu, quy đổi học phí năm), `universities.validation.js`, service / controller / routes.
- **Frontend:** `pages/Universities/` (`Universities.jsx`, `UniversityFilters.jsx`, `Pagination.jsx`, `universitySearch.js`), `services/universities.js`, `hooks/useApiData.js`, `hooks/useDebouncedValue.js`.
- **Thay đổi so với bản cũ:** logic tìm theo tên (Hương viết ở frontend) chuyển sang backend; frontend chỉ còn đọc bộ lọc từ URL + phân trang.

| Bộ lọc | Tham số URL trang | Tham số API |
|---|---|---|
| Tên / viết tắt | `q` | `q` (debounce 300ms) |
| Nhóm ngành → ngành | `nhom`, `nganh` | `group`, `major` |
| Học phí tối đa / năm | `hocphi` | `maxTuition` |
| Khu vực | `khuvuc` | `district` |
| Loại trường | `loai` | `type` |
| Chỉ ĐHQG | `dhqg=1` | `vnu=1` |

**Tiêu chí nghiệm thu**

- [x] Từng bộ lọc và kết hợp nhiều bộ lọc trả đúng kết quả (Atlas: nhóm CNTT 12 trường, ngành 7480201 11 trường, `uit` 1 trường).
- [x] Tham số sai → `400 { message }`; `?major[$ne]=x` không lọt vào truy vấn MongoDB.
- [x] Bộ lọc lưu trên URL; đổi bộ lọc quay về trang 1; "Xóa bộ lọc" về 66 trường.
- [x] Request cũ bị hủy (AbortController) khi đổi bộ lọc nhanh.
- [x] 375px không cuộn ngang; mọi ô lọc có `<label>` hiển thị.
- [x] Test: `backend/tests/university-search.test.cjs`, `frontend/src/pages/Universities/universitySearch.test.js`.

## WBS 5.6 + 4.6 — API so sánh trường + giao diện so sánh

- **Phụ trách:** Tú · **Ưu tiên:** P3 · **Trạng thái:** DONE
- **Contract:** `GET /api/universities/compare?slugs=a,b,c` (2–3 slug).
- **Frontend:** nút "+ So sánh" trên `UniversityCard` (chỉ hiện khi trang truyền `onToggleCompare`), thanh `CompareBar`, `features/compare/useCompareList.js` (sessionStorage), trang `pages/Compare/` 2 chế độ:
  1. `location.state.recommendations` từ trang AI → `AiCompareTable` (bản của Hương, chỉ tách file).
  2. `?truong=a,b,c` → `UniversityCompareTable` (gọi API mới).

**Tiêu chí nghiệm thu**

- [x] Chọn tối đa 3 trường; đủ 3 thì khóa nút còn lại; danh sách giữ khi chuyển trang.
- [x] Bảng hiện học phí từng đơn vị, đánh dấu học phí năm thấp nhất, ô thiếu ghi "Chưa có dữ liệu".
- [x] Bỏ một cột → URL cập nhật; còn < 2 trường → về `/truong`.
- [x] Slug không tồn tại → thông báo lỗi nêu rõ slug; trang `/so-sanh` rỗng có hướng dẫn.
- [x] Chế độ so sánh kết quả AI vẫn hoạt động như cũ.
