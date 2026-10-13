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
- seeds/: dữ liệu gốc dạng JSON, nạp lên Atlas bằng `npm run seed` trong backend.

# DOCS

docs/ chứa tài liệu nội bộ của project.
