# API Contract

## Base URL

```text
http://localhost:5000/api

```
## Health Check
GET /health
Response:

{
  "message": "Backend is running",
  "status": "OK"
}

## Universities
GET /universities
Response:

[
  {
    "id": 1,
    "name": "Đại học Công nghệ Thông tin",
    "location": "TP.HCM"
  }
]

