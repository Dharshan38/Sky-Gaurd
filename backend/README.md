# Sky Guard Backend

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies with `npm install`.
3. Generate Prisma Client with `npm run prisma:generate`.
4. Push the schema or run a migration:
   - `npm run prisma:push`
   - or `npm run prisma:migrate`
5. Load demo data with `npm run prisma:seed`.
6. Start development mode with `npm run dev`.

For demo mode, the backend uses SQLite via `DATABASE_URL=file:./dev.db`, so no local PostgreSQL service is required.

## API

All routes are mounted under `/api/v1`.

- `POST /auth/register`
- `POST /auth/login`
- `GET /fleet/dashboard-summary`
- `GET /fleet/aircraft/:tailNumber/analytics`
- `POST /telemetry/ingest`

## Frontend Notes

- Configure Axios with `baseURL` set to `http://localhost:4000/api/v1`.
- Send the JWT as `Authorization: Bearer <token>` for authenticated requests.
- The analytics endpoint returns chronologically ordered time-series points that are ready for Recharts.
- The seed script creates a realistic demo fleet, telemetry history, and active alerts for the simulation.