# API Requirements

Base URL:

```txt
http://localhost:5000/api
```

## Standard Response

Success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

## Auth

```txt
POST /auth/trivoxa-login
POST /auth/login
GET  /auth/me
POST /auth/logout
```

## Organizations

```txt
POST /organizations
GET  /organizations
GET  /organizations/:id
PUT  /organizations/:id
```

## Facilities

```txt
POST /facilities
GET  /facilities
GET  /facilities/:id
PUT  /facilities/:id
```

## Users and Roles

```txt
POST /users
GET  /users
GET  /users/:id
PUT  /users/:id

POST /roles
GET  /roles
GET  /roles/:id
PUT  /roles/:id
PATCH /roles/:id/permissions
```

## Masters

```txt
POST /groups
GET  /groups
GET  /groups/:id
PUT  /groups/:id
PATCH /groups/:id/status

POST /categories
GET  /categories
GET  /categories/:id
PUT  /categories/:id
PATCH /categories/:id/status

POST /items
GET  /items
GET  /items/:id
PUT  /items/:id
PATCH /items/:id/status

POST /units
GET  /units

POST /godowns
GET  /godowns

POST /vendors
GET  /vendors

POST /employees
GET  /employees
```

## Stock

```txt
GET  /stock/balance
GET  /stock/ledger

POST /stock-in
GET  /stock-in
GET  /stock-in/:id/ledger

POST /stock-transfer
GET  /stock-transfer

POST /stock-out
GET  /stock-out

POST /manual-adjustments
GET  /manual-adjustments
```

## Sales, Reports, Incentives

```txt
POST /daily-sales
GET  /daily-sales

GET /reports/stock-summary
GET /reports/movement-analysis
GET /reports/godown-wise
GET /reports/incentive-report
GET /reports/dashboard

POST /incentive-rules
GET  /incentive-rules
POST /incentives/calculate
```
