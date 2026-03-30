# Health Hub Pro

Health Hub Pro is a full-stack health management app with a React + Vite frontend and an Express backend.
It supports account auth, health profile onboarding, appointment and reminder tracking, emergency info access, and AI-assisted symptom and side-effect guidance via Groq.

## What Is Implemented

- Email/password signup and login with signed bearer tokens
- Protected dashboard routes (`/dashboard`, `/connect`, `/symptoms`, `/emergency`, `/onboarding`)
- Multi-step health profile onboarding and updates
- Appointment creation and listing
- Medicine reminder creation and listing
- Test schedule creation and listing
- Emergency card view based on saved profile data
- Symptom analysis and medicine side-effect checks using Groq
- External SQLite-compatible persistence (Turso/libSQL)

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express 5
- AI: `groq-sdk`
- Auth: Custom HMAC-signed token flow
- Storage: External SQLite via Turso (`@libsql/client`)
- Testing: Vitest

## Current Project Structure

```text
Health-Hub-Pro/
|-- public/
|-- api/
|   `-- index.js
|-- scripts/
|   `-- dev.mjs
|-- server/
|   |-- index.js
|   `-- lib/
|       |-- auth.js
|       |-- database.js
|       |-- groq.js
|       `-- symptomEngine.js
|-- src/
|   |-- components/
|   |-- contexts/
|   |-- hooks/
|   |-- lib/
|   |   `-- api.ts
|   |-- pages/
|   |   |-- Index.tsx
|   |   |-- Auth.tsx
|   |   |-- Onboarding.tsx
|   |   |-- Dashboard.tsx
|   |   |-- Connect.tsx
|   |   |-- Symptoms.tsx
|   |   |-- Emergency.tsx
|   |   `-- NotFound.tsx
|   `-- App.tsx
|-- .env.example
|-- package.json
|-- vercel.json
|-- vite.config.ts
`-- README.md
```

## Prerequisites

- Node.js 20+
- npm

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Update `.env` values, especially `JWT_SECRET` and `GROQ_API_KEY`.

## Environment Variables

```env
PORT=3001
JWT_SECRET=replace-this-with-a-long-random-string
VITE_API_BASE_URL=/api
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-120b
TURSO_DATABASE_URL=libsql://your-database-name-your-org.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
# Optional one-time migration source on first run:
# DATA_FILE=server/data/db.json
```

### Variable Details

- `PORT`: Express API port. Default `3001`.
- `JWT_SECRET`: Required. Must be a strong random secret, at least 32 chars. The server exits if this is missing/weak/placeholder.
- `VITE_API_BASE_URL`: Frontend API base URL. `/api` works with local Vite proxy.
- `GROQ_API_KEY`: Required for symptom and side-effect endpoints.
- `GROQ_MODEL`: Optional model name, defaults to `openai/gpt-oss-120b`.
- `TURSO_DATABASE_URL`: Required in Vercel. Your external SQLite/libSQL database URL.
- `TURSO_AUTH_TOKEN`: Required for secured Turso databases.
- `DATA_FILE`: Optional. Legacy `db.json` path used only for one-time migration seed when `app_state` is first created.

Compatibility note:
- Backend also accepts legacy `GROK_API_KEY` and `GROK_MODEL` if present.

## Vercel Deployment

This project is configured for Vercel serverless APIs:

- `/api/*` routes are handled by [api/index.js](api/index.js), which wraps the Express app.
- Vercel routing/build behavior is defined in `vercel.json`.
- `app.listen(...)` is disabled automatically in Vercel runtime.

Required Vercel environment variables:

- `JWT_SECRET`
- `GROQ_API_KEY`
- `GROQ_MODEL` (optional)
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

## Run

Start frontend and backend together:

```bash
npm run dev
```

Starts:
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3001`

Run services separately:

```bash
npm run dev:client
npm run dev:server
```

Production backend start:

```bash
npm run build
npm run start
```

## Scripts

- `npm run dev`: Runs backend and frontend together (`scripts/dev.mjs`)
- `npm run dev:client`: Runs Vite dev server
- `npm run dev:server`: Runs Express server with `--watch`
- `npm run build`: Builds frontend to `dist/`
- `npm run build:dev`: Dev-mode Vite build
- `npm run preview`: Preview built frontend
- `npm run start`: Start backend using `.env`
- `npm run lint`: Run ESLint
- `npm run test`: Run Vitest tests
- `npm run test:watch`: Run Vitest in watch mode

## API Routes

Public:
- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`

Protected (require `Authorization: Bearer <token>`):
- `GET /api/auth/me`
- `GET /api/profile`
- `POST /api/profile`
- `GET /api/dashboard`
- `GET /api/appointments`
- `POST /api/appointments`
- `GET /api/medicine-reminders`
- `POST /api/medicine-reminders`
- `GET /api/test-schedules`
- `POST /api/test-schedules`
- `POST /api/symptoms/analyze`
- `POST /api/symptoms/side-effects`

## Frontend Routing

- `/`: Landing page
- `/auth`: Sign in / sign up
- `/onboarding`: Profile setup (protected)
- `/dashboard`: Main health dashboard (protected)
- `/connect`: Doctors, hospitals, appointments, reminders, tests (protected)
- `/symptoms`: Symptom and side-effect tools (protected)
- `/emergency`: Emergency panel and emergency card (protected)

## Data Storage

Backend data is stored in SQLite (libSQL protocol) using a single `app_state` table in your external Turso database.
The app keeps its current JSON-shaped state in that row and persists updates transactionally with revision checks.

The stored state includes:

- `users`
- `healthProfiles`
- `appointments`
- `medicineReminders`
- `testSchedules`
- `symptomChecks`

Migration behavior:
- On first run, if `app_state` does not exist yet, the backend will try to seed from legacy `DATA_FILE` (`server/data/db.json`) if available.
- If no legacy file exists, it starts with an empty default state.

## Notes for Contributors

- This project does not use Supabase.
- Keep `.env` local and never commit real secrets.
- Keep `package-lock.json` committed when dependencies change.
- `server/lib/symptomEngine.js` exists as local rule-based logic but current API flow uses `server/lib/groq.js`.

## Testing and Verification

- `npm run test` runs Vitest (currently includes a basic example test scaffold).
- `npm run build` verifies frontend production build output.

## License

MIT. See `LICENSE`.
