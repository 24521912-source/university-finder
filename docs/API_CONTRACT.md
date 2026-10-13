# API Contract

## Base URL

```text
http://localhost:5000/api
```

## Health Check

GET /health

Response:

```json
{
  "message": "Backend is running",
  "status": "OK"
}
```

## Universities

GET /universities

Response (dữ liệu lấy từ MongoDB Atlas, sắp xếp theo tên):

```json
[
  {
    "_id": "6710...",
    "slug": "bach-khoa-tphcm",
    "name": "Đại học Bách Khoa TP.HCM",
    "shortName": "HCMUT",
    "institutionType": "public",
    "address": { "district": "Quận 10" },
    "media": { "logoUrl": null },
    "favoriteCount": 0
  }
]
```
