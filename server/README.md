# Goldcoast API

NestJS 12 · Prisma 7 (PostgreSQL) · AWS S3 · Jest

## Setup

```bash
# create .env (DB + AWS S3 credentials)
npm install                 # also runs `prisma generate`
npm run db:up               # Postgres :5433
npm run prisma:migrate      # apply migrations
npm run start:dev           # http://localhost:4000/api
```

Health check: `GET /api/health`

## Scripts

| Script | Description |
| --- | --- |
| `npm run start:dev` | Dev server with watch |
| `npm test` / `test:watch` / `test:cov` | Unit tests (Jest) |
| `npm run test:e2e` | E2E tests (needs `db:up`) |
| `npm run prisma:migrate` | Create/apply migration |
| `npm run prisma:studio` | DB GUI |
| `npm run db:up` / `db:down` | Local Postgres |

## Notes

- Nest 12 packages are ESM-only, so Jest runs with `--experimental-vm-modules` (already in the scripts).
- Env vars are validated on startup (`src/config/env.validation.ts`); the app won't start with a broken `.env`.
- Prisma client is generated into `src/generated/prisma` (git-ignored).
