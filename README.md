# Health Hub Pro

Health Hub Pro is a full-stack health management app with a React + Vite frontend and an Express API backend.
It includes account auth, profile onboarding, appointment and reminder tracking, emergency details, and AI-assisted symptom and medicine side-effect guidance.

## Current Capabilities

- Email/password signup and login with signed bearer tokens
- Protected app routes for dashboard, onboarding, connect, symptoms, and emergency
- Multi-step onboarding flow with editable health profile data
- Appointment management (create + list)
- Medicine reminder management (create + list)
- Test schedule management (create + list)
- Emergency card view using saved profile data
- Notification center (client-side) built from appointments, reminders, test schedules, profile completeness, and recent symptom checks
- AI endpoints for symptom analysis and medicine side effects via Groq
- libSQL storage with Turso support and local SQLite file fallback

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router
- Backend: Node.js, Express 5
- AI integration: `groq-sdk`
- Auth: custom HMAC-signed token flow
- Data: `@libsql/client` (Turso/libSQL, with local file mode support)
- Testing: Vitest + Testing Library setup

## Prerequisites

- Node.js 20+
- npm

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Update `.env` (at minimum set a strong `JWT_SECRET` and a valid `GROQ_API_KEY`).

4. Start frontend and backend together:

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3001`

You can also run services separately:

```bash
npm run dev:server
npm run dev:client
```

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

- `PORT`: Express API port (default `3001`)
- `JWT_SECRET`: required, must be at least 32 characters and not the placeholder
- `VITE_API_BASE_URL`: frontend API base URL (default `/api`)
- `GROQ_API_KEY`: required for `/api/symptoms/analyze` and `/api/symptoms/side-effects`
- `GROQ_MODEL`: optional model name (default `openai/gpt-oss-120b`)
- `TURSO_DATABASE_URL`: optional locally, required on Vercel (or use `DATABASE_URL`)
- `TURSO_AUTH_TOKEN`: auth token for secured Turso DBs (or use `DATABASE_AUTH_TOKEN`)
- `DATA_FILE`: optional legacy JSON seed path used only for first-time state initialization

Compatibility aliases supported by backend:

- `GROK_API_KEY` and `GROK_MODEL` (legacy names)
- `DATABASE_URL` and `DATABASE_AUTH_TOKEN` (libSQL aliases)

## Data Persistence

The backend stores app state in a single `app_state` table (`id=1`, JSON payload + revision).

- If `TURSO_DATABASE_URL`/`DATABASE_URL` is set, that libSQL endpoint is used.
- If no DB URL is set locally, it falls back to `file:./server/data/healthhub.db`.
- On first run, if `app_state` does not exist, the server tries seeding from `DATA_FILE` (default `server/data/db.json`).

Stored collections in state:

- `users`
- `healthProfiles`
- `appointments`
- `medicineReminders`
- `testSchedules`
- `symptomChecks`

## API Routes

Public:

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`

Protected (`Authorization: Bearer <token>`):

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
- `GET /api/symptom-checks`
- `POST /api/symptoms/analyze`
- `POST /api/symptoms/side-effects`

## Frontend Routes

- `/` landing page
- `/auth` sign in / sign up
- `/onboarding` profile setup (protected)
- `/dashboard` overview (protected)
- `/connect` doctors, hospitals, appointments, reminders, tests (protected)
- `/symptoms` symptom + side-effect tools (protected)
- `/emergency` emergency panel + emergency card (protected)

## Vercel Deployment

The repository is configured for Vercel static frontend + serverless API:

- Frontend build output: `dist/`
- API entrypoint: `api/index.js` (wraps Express app from `server/index.js`)
- Routing behavior defined in `vercel.json`

When running in Vercel (`VERCEL=1`), the backend expects a configured libSQL URL and does not call `app.listen(...)`.

Recommended Vercel environment variables:

- `JWT_SECRET`
- `GROQ_API_KEY`
- `GROQ_MODEL` (optional)
- `TURSO_DATABASE_URL` (or `DATABASE_URL`)
- `TURSO_AUTH_TOKEN` (or `DATABASE_AUTH_TOKEN`)

## Scripts

- `npm run dev`: start backend and frontend in parallel (`scripts/dev.mjs`)
- `npm run dev:server`: run Express API with `node --watch`
- `npm run dev:client`: run Vite dev server
- `npm run build`: production frontend build
- `npm run build:dev`: development-mode frontend build
- `npm run preview`: preview frontend build
- `npm run start`: start backend with `.env`
- `npm run lint`: run ESLint
- `npm run test`: run Vitest once
- `npm run test:watch`: run Vitest in watch mode

## Project Structure

```text
Health-Hub-Pro/
|-- api/
|   `-- index.js
|-- public/
|-- scripts/
|   `-- dev.mjs
|-- server/
|   |-- data/
|   |   `-- db.json
|   |-- lib/
|   |   |-- auth.js
|   |   |-- database.js
|   |   |-- groq.js
|   |   `-- symptomEngine.js
|   `-- index.js
|-- src/
|   |-- components/
|   |-- contexts/
|   |-- hooks/
|   |-- lib/
|   |-- pages/
|   `-- test/
|-- .env.example
|-- package.json
|-- vercel.json
|-- vite.config.ts
`-- README.md
```

## Notes

- Keep `.env` local and never commit real secrets.
- `server/lib/symptomEngine.js` exists as a local rule-based engine, but current API routes use `server/lib/groq.js`.
- This project does not use Supabase.

## Testing

- `npm run test` runs the current Vitest suite (includes a basic scaffold test).
- `npm run build` validates a production frontend build.

## License

MIT. See `LICENSE`.
