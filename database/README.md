# Database

Thư mục này chứa các file liên quan đến cơ sở dữ liệu của project University Finder.

Database sử dụng: MySQL

# Cấu trúc thư mục

```text
database/
├─ schemas/       # Chứa file tạo database và các bảng chính
├─ migrations/    # Chứa các thay đổi cấu trúc database theo từng phiên bản
├─ seeds/         # Chứa dữ liệu mẫu để test
├─ scripts/       # Chứa script hỗ trợ reset/import database
├─ diagrams/      # Chứa ERD hoặc hình mô tả database
└─ README.md      # Tài liệu hướng dẫn database
```


## Cách tạo database
mysql -u root -p < database/schemas/schema.sql
 ==> sau đó nhập mật khẩu MySQL



## Cách import dữ liệu mẫu
mysql -u root -p university_finder < database/seeds/seed.sql


## Cách reset database
mysql -u root -p < database/scripts/reset.sql


## Quy ước đặt tên file

Migration nên đặt tên theo thứ tự:
001_create_users_table.sql
002_create_universities_table.sql
003_create_majors_table.sql
004_create_admissions_table.sql

Seed file nên đặt tên rõ nghĩa:
seed.sql
seed_universities.sql
seed_majors.sql


## Lưu ý khi làm việc

Không tự ý sửa file migration cũ nếu team đã dùng file đó.
Khi thay đổi cấu trúc database, tạo migration mới.
Khi thêm dữ liệu mẫu, cập nhật trong seeds/.
Nếu thay đổi cấu trúc thư mục database, cập nhật lại file README này.
