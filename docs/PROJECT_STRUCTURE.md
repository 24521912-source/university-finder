# FRONTEND

frontend/ chứa toàn bộ giao diện người dùng.
- src/assets/: chứa ảnh, icon, logo, font.
- src/components/: chứa component dùng lại nhiều nơi.
- src/features/: chứa logic theo chức năng như auth, university, recommendation.
- src/hooks/: chứa custom hooks.
- src/layouts/: chứa layout dùng chung.
- src/pages/: chứa các trang chính.
- src/routes/: chứa cấu hình route.
- src/services/: chứa các hàm gọi API backend.
- src/utils/: chứa hàm tiện ích dùng chung.

# BACKEND

backend/ chứa API server và logic xử lý nghiệp vụ.
- src/config/: cấu hình hệ thống.
- src/middlewares/: middleware xử lý request/response.
- src/models/: model/schema database.
- src/modules/: các module nghiệp vụ chính.
- src/repositories/: code truy vấn database.
- src/routes/: gom route API.
- src/utils/: helper dùng chung.
- src/app.js: cấu hình Express app.
- src/server.js: khởi chạy server.

# DATABASE 

database/ dùng để lưu script database, schema, migration hoặc dữ liệu mẫu.
- mongodb/: mô tả schema MongoDB Atlas.
- seeds/: dữ liệu nạp ban đầu dạng JSON (`npm run seed`). Sau khi nạp, Atlas là dữ liệu gốc, sửa qua trang /admin.

backups/ (ngoài git): bản sao lưu từ `npm run backup`.

# DOCS

docs/ chứa tài liệu nội bộ của project.

# CÁCH THÊM MỘT CHỨC NĂNG MỚI

Mỗi người làm trọn một chức năng (frontend + backend). Phần khung dùng chung đã có sẵn — dùng lại, không viết lại.

## Có sẵn để dùng

| Cần gì | Dùng cái này |
|---|---|
| Gọi API từ frontend | `import api, { getErrorMessage } from '../../services/api'` — tự gắn token |
| Biết ai đang đăng nhập | `const { user, setUser } = useAuth()` từ `features/auth/AuthContext` |
| Trang cần đăng nhập / chỉ quản trị viên | Bọc bằng `<ProtectedRoute>` / `<ProtectedRoute adminOnly>` trong `routes/AppRoutes.jsx` |
| Kiểm tra quyền ở frontend | `isAdmin`, `isSuperadmin`, `can(actor, target, action)` trong `utils/roles.js` (chỉ để ẩn/hiện nút) |
| Nút yêu thích | Hook `useFavorites()` trong `features/favorites/useFavorites.js` |
| Gọi API GET có trạng thái tải / lỗi, tự hủy request cũ | Hook `useApiData(key, fetcher)` trong `hooks/useApiData.js` |
| Chờ người dùng dừng gõ rồi mới xử lý | Hook `useDebouncedValue(value, 300)` trong `hooks/useDebouncedValue.js` |
| Danh sách trường chọn để so sánh (tối đa 3) | Hook `useCompareList()` trong `features/compare/useCompareList.js` |
| Tìm kiếm / lọc / so sánh trường | `searchUniversities`, `getFilterOptions`, `compareUniversities` trong `services/universities.js` |
| Hiển thị một trường | `<UniversityCard university={...} />` (truyền thêm `onToggleFavorite`, `isFavorite` nếu có nút yêu thích) |
| Định dạng học phí, loại trường | `formatTuition`, `formatTuitionRange`, `formatMoney`, `INSTITUTION_TYPE_LABEL` trong `utils/format.js` |
| Màu, nút, form, badge | Class trong `src/index.css`: `container`, `page-title`, `btn btn-primary`, `input`, `badge`, `card-grid`… |
| API cần đăng nhập / quản trị viên / quản trị cấp cao | `requireAuth` / `requireAdmin` / `requireSuperadmin` trong `backend/src/middlewares/auth.js` (người dùng ở `req.user`) |
| Quy tắc ai được thao tác lên ai | `denyReason()` trong `backend/src/utils/roles.js` |
| Ghi lịch sử khi quản trị viên sửa dữ liệu | `record()` trong `backend/src/modules/history/history.recorder.js` |
| Trả lỗi từ backend | `throw httpError(404, 'Không tìm thấy trường')` (`utils/httpError.js`) — không cần try/catch, Express 5 tự bắt |
| Dữ liệu card của trường | `toCard()`, `CARD_FIELDS` trong `modules/universities/universities.service.js` |

## Các bước

1. Tạo nhánh: `git checkout develop && git pull && git checkout -b feature/<ten-chuc-nang>`.
2. Ghi API vào `docs/API_CONTRACT.md`.
3. **Backend**: tạo `backend/src/modules/<ten>/` gồm `<ten>.routes.js`, `<ten>.controller.js`, `<ten>.service.js` (thêm `<ten>.validation.js` nếu nhận dữ liệu từ người dùng) — xem module `auth` hoặc `universities` làm mẫu. Đăng ký một dòng trong `backend/src/routes/index.js`.
4. **Frontend**: tạo trang trong `frontend/src/pages/<Ten>/`, thay `<ComingSoon />` tương ứng trong `routes/AppRoutes.jsx`.
5. Tạo Pull Request vào `develop`.
