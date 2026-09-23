
# Git Workflow

## Quy tắc chính

- Không code trực tiếp trên `main`.
- Mỗi chức năng tạo một branch riêng.
- Merge vào `main` thông qua Pull Request.
- Trước khi tạo branch mới luôn chạy `git pull origin main`.

## Quy ước đặt tên branch

```text
feature/auth
feature/universities
feature/recommendation
feature/compare
fix/login-error
docs/update-readme
```

## Quy trình code
git checkout main
git pull origin main
git checkout -b feature/ten-chuc-nang

Sau khi code xong:

git add .
git commit -m "Add feature name"
git push origin feature/ten-chuc-nang