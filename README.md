# E-commerce Monorepo (Node + React)

This repo contains a full-stack e-commerce example with:
- Server: Express + Prisma + SQLite
- Client: React (Vite)
- Admin: React (Vite)

## Prerequisites
- Node.js 18+

## Setup

1. Install dependencies:

```bash
npm --prefix client install
npm --prefix admin install
npm --prefix server install
```

2. Create and seed database:

```bash
# From server
cd server
npx prisma migrate dev --name init
node --loader ts-node/esm prisma/seed.ts
```

3. Run services:

- Start API server (port 4000):
```bash
npm --prefix server run build && npm --prefix server run start
```

- Start client (port 5173):
```bash
npm --prefix client run dev
```

- Start admin (port 5174):
```bash
npm --prefix admin run dev
```

## URLs
- API health: http://localhost:4000/health
- Client: http://localhost:5173
- Admin: http://localhost:5174

## Default Admin
- Email: admin@example.com
- Password: admin123

## Notes
- Auth uses HTTP-only cookie `token`. Client and Admin send credentials automatically where needed.
- Database: SQLite file at `server/prisma/dev.db`.