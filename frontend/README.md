```
src/
├─ assets/       # Ảnh, icon, logo, font
├─ components/   # Component dùng lại nhiều nơi
├─ features/     # Chức năng chính theo nghiệp vụ
├─ hooks/        # Custom React hooks
├─ layouts/      # Layout dùng chung
├─ pages/        # Các trang chính
├─ routes/       # Cấu hình route frontend
├─ services/     # Gọi API backend
├─ utils/        # Hàm tiện ích dùng chung
├─ App.jsx       # Component gốc
└─ main.jsx      # Điểm khởi chạy React app
```

## Quy ước code
- Component dùng chung đặt trong components/
- Trang chính đặt trong pages/
- API call đặt trong services/
- Logic theo chức năng đặt trong features/
- Hàm dùng chung đặt trong utils/

## Các file chính trong `src`

- `main.jsx`: điểm khởi chạy React app, render `App` vào DOM.
- `App.jsx`: component gốc, thường chứa router/layout/provider.
- `index.css`: CSS global cho toàn bộ frontend.
- `App.css`: CSS riêng cho `App.jsx`, có thể bỏ nếu không dùng.

frontend/index.html        # HTML gốc, ít sửa
frontend/src/pages/...     # Code giao diện từng trang
frontend/src/components/...# Code giao diện tái sử dụng