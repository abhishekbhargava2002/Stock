# Stockora by Trivoxa

Production-level monorepo structure for **Stockora**, an inventory management SaaS product created, sold, and managed by **Trivoxa**.

## Stack

### Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS
- Mock-data frontend already placed inside `/frontend`

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT authentication
- Zod validation

## Folder Structure

```txt
stockora-inventory-saas/
├── frontend/   # Complete Stockora frontend
├── backend/    # Node.js + Express + MongoDB API skeleton
├── docs/       # BRS, API, DB schema, developer plan
├── postman/    # Postman collection placeholder
└── README.md
```

## Local Setup

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

Health check:

```txt
GET http://localhost:5000/api/health
```

## First Backend Development Order

1. MongoDB Atlas connection
2. Auth APIs
3. Organization onboarding APIs
4. Facility APIs
5. User / Role / Permission APIs
6. Masters APIs
7. Stock ledger + stock balance
8. Stock In
9. Stock Transfer
10. Stock Out
11. Manual Adjustment
12. Daily Sale
13. Reports
14. Incentives
15. Notifications
16. Audit Logs

## Critical Rule

Do **not** store stock only as a simple quantity field inside items.

Use:

- `stock_ledgers` for movement history
- `stock_balances` for current snapshot
- MongoDB transactions for stock movement operations

