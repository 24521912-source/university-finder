# Project Rules — UniMatch HCMC

Quy ước bắt buộc cho mọi thành viên và mọi công cụ AI (Copilot, Cursor, Claude…). **AI phải đọc file này trước khi đề xuất bất kỳ thay đổi code nào.**

## Công nghệ

- Frontend: React + Vite, CSS thuần (file `.css`), JavaScript ES6+. Backend: Node.js + Express + Mongoose (MongoDB Atlas).
- **Không** thêm jQuery, Bootstrap, Tailwind, thư viện UI hay script CDN. Thêm thư viện mới phải được cả nhóm đồng ý.
- Dùng lại khung dùng chung đã có (xem `docs/PROJECT_STRUCTURE.md`), không viết lại.

## HTML / JSX

- Ưu tiên thẻ ngữ nghĩa (`header`, `nav`, `main`, `section`, `article`, `footer`, `button`, `a`) thay cho `div`.
- Mỗi trang đúng **một `<h1>`**; không nhảy cấp tiêu đề (h1 → h2 → h3).
- Mọi `input` có `<label htmlFor>` hiển thị; không dùng placeholder thay nhãn.
- Ảnh luôn có `alt`, `width`, `height` (chống CLS).
- Phần tử bấm được phải là `<button>` hoặc `<a>` — không gắn `onClick` vào `div`.

## CSS

- **Mobile-first**: viết cho 375px trước, mở rộng bằng `@media (min-width: …)`. Không cuộn ngang ở 375px.
- Màu, bóng, khoảng cách dùng biến (token) khai báo trong `:root` (`src/index.css`) — **không gõ mã màu trực tiếp trong rule**.
- `box-sizing: border-box` toàn cục; dùng `gap` thay cho margin giữa các phần tử con của flex/grid.
- Không dùng inline style trừ giá trị động.

## JavaScript

- `const` mặc định, `let` khi cần gán lại, **không dùng `var`**.
- Sự kiện bàn phím: `keydown` + `event.key` (không dùng `keypress`, `keyCode`).
- **Không bao giờ** render dữ liệu người dùng bằng `innerHTML` / `dangerouslySetInnerHTML` (XSS).
- Không để lỗi trong console.

## Accessibility

- Dùng được 100% bằng bàn phím (Tab, Shift+Tab, Enter, Escape); luôn thấy viền focus.
- Tương phản chữ ≥ 4.5:1 (WCAG 2.2 AA).
- Nút bật/tắt có `aria-expanded` / `aria-pressed`; điều hướng có `aria-label`.

## Quy trình làm việc với AI

1. Ghi task và các sub-task vào `TASK_DECOMPOSITION.md` **trước** khi nhờ AI.
2. Định nghĩa contract (cấu trúc, dữ liệu, hành vi, tiêu chí nghiệm thu) trước khi code.
3. Mỗi lần chỉ nhờ AI **một** sub-task; không dán cả đề bài.
4. Tự kiểm tra từng sub-task (DevTools, 375px, bàn phím, `git diff`) rồi mới ghép.

## Git

- Mỗi chức năng một nhánh `feature/<tên>` từ `develop`; merge qua Pull Request.
- **Commit nhỏ theo sub-task**, đặt tên theo Conventional Commits: `docs(spec): …`, `feat(html): …`, `feat(css): …`, `feat(js): …`, `fix(a11y): …`.
- Không commit HTML + CSS + JS lẫn lộn trong một commit lớn; không commit `.env`.
