# Git Workflow

## Mô hình branch

```text
feature/xxx, fix/xxx  ──PR──▶  develop (deploy Vercel)  ──(cuối đồ án)──▶  main
```

| Branch | Vai trò | Quy tắc |
|---|---|---|
| `main` | Bản nộp cuối cùng | Không đụng tới cho đến cuối đồ án |
| `develop` | Gom code cả nhóm, deploy Vercel | Chỉ nhận code qua Pull Request |
| `feature/xxx` | Một chức năng mới | Tạo từ `develop`, xoá sau khi merge |
| `fix/xxx` | Sửa một lỗi | Tạo từ `develop`, xoá sau khi merge |

## Quy ước đặt tên branch

Chữ thường, nối bằng `-`, có số Issue nếu có:

```text
feature/12-compare-page
feature/auth
fix/15-login-redirect
docs/update-readme
```

Mỗi branch là **một việc**, không phải một người. Làm xong, merge xong thì xoá.

## Giao việc

1. Mỗi việc tạo một **Issue**: gán người làm (Assignees) và nhãn (`frontend`, `backend`, `bug`, ...).
2. Theo dõi trên tab **Projects** (bảng Kanban): `Todo → In Progress → In Review → Done`.

## Quy trình code

```bash
# Bắt đầu việc mới: luôn tạo từ develop mới nhất
git checkout develop
git pull
git checkout -b feature/12-compare-page

# Commit nhỏ, thường xuyên
git add .
git commit -m "feat: add compare table layout"

# Lấy code mới của người khác (nên làm mỗi ngày)
git pull origin develop

# Push lên GitHub
git push -u origin feature/12-compare-page
```

## Commit message

Định dạng: `<loại>: <mô tả ngắn>`

| Loại | Dùng khi |
|---|---|
| `feat` | Thêm chức năng |
| `fix` | Sửa lỗi |
| `style` | Chỉ sửa CSS/giao diện |
| `refactor` | Viết lại code, không đổi chức năng |
| `docs` | Sửa tài liệu |
| `chore` | Cài package, chỉnh config |

Ví dụ: `feat: add university search by province`, `fix: crash when score is empty`.
Không dùng message kiểu `update`, `fix bug`, `abc`.

## Pull Request

1. Trên GitHub bấm **Compare & pull request**, chọn **base: `develop`**.
2. Mô tả: đã làm gì, ghi `Closes #<số issue>` để issue tự đóng khi merge, kèm ảnh nếu đổi giao diện.
3. Thêm ít nhất 1 người vào **Reviewers**. Reviewer mở link preview Vercel để test, đọc code, rồi **Approve** hoặc **Request changes**.
4. Merge bằng **Squash and merge**.
5. Bấm **Delete branch** sau khi merge.

PR nên nhỏ (dưới ~300 dòng) để review được kỹ.

## Xử lý conflict

```bash
git checkout feature/12-compare-page
git pull origin develop
# Mở VS Code, chọn Accept Current / Incoming / Both cho từng chỗ conflict
git add .
git commit
git push
```

Để ít conflict: pull `develop` thường xuyên, không để 2 người cùng sửa một file lớn.

## Không được làm

- Commit `.env`, API key, mật khẩu (chỉ commit `.env.example`; biến thật nhập trên Vercel → Settings → Environment Variables).
- Commit `node_modules/`.
- `git push --force` lên `develop` hoặc `main`.
- Push thẳng vào `develop`/`main`, hoặc tự merge PR của mình khi chưa ai review.

## Cuối đồ án

1. Ngưng merge chức năng mới, test toàn bộ trên link Vercel.
2. Tạo PR `develop` → `main`, merge bằng **Create a merge commit**.
3. Tạo release: **Releases → Draft a new release → tag `v1.0.0`**.
4. Đổi Production Branch trên Vercel về `main`.
