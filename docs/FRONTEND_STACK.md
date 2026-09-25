# Frontend Stack Decision

The frontend is already selected and prepared as:

```txt
Next.js App Router + TypeScript + Tailwind CSS
```

This is recommended for Stockora because it is a SaaS application with multiple authenticated routes, dashboards, forms, reports, and future backend/API integration.

Do not convert the frontend to plain React/Vite or plain HTML/CSS/JS.

Backend development should proceed with:

```txt
Node.js + Express.js + TypeScript + MongoDB + Mongoose
```

Frontend folder:

```txt
/frontend
```

Backend folder:

```txt
/backend
```
