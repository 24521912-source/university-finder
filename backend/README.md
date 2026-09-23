src/
├─ config/        # Cấu hình env, database, CORS
├─ middlewares/   # Middleware Express
├─ models/        # Model/schema dữ liệu
├─ modules/       # Chức năng chính của hệ thống
├─ repositories/  # Truy vấn database
├─ routes/        # Gom route API
├─ utils/         # Hàm tiện ích dùng chung
├─ app.js         # Khởi tạo Express app
└─ server.js      # Chạy server

# Quy ước module 
-mỗi module nên có cấu trúc
module-name/
├─ module-name.controller.js
├─ module-name.service.js
├─ module-name.routes.js
└─ module-name.validation.js
ví dụ:
auth/
├─ auth.controller.js
├─ auth.service.js
├─ auth.routes.js
└─ auth.validation.js
