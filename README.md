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
- Local JSON persistence for all backend data

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express 5
- AI: `groq-sdk`
- Auth: Custom HMAC-signed token flow
- Storage: File-based JSON database (`server/data/db.json`)
- Testing: Vitest

## Current Project Structure

```text
Health-Hub-Pro/
|-- public/
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
DATA_FILE=server/data/db.json
VITE_API_BASE_URL=/api
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-120b
```

### Variable Details

- `PORT`: Express API port. Default `3001`.
- `JWT_SECRET`: Required. Must be a strong random secret, at least 32 chars. The server exits if this is missing/weak/placeholder.
- `DATA_FILE`: JSON database path for backend persistence.
- `VITE_API_BASE_URL`: Frontend API base URL. `/api` works with local Vite proxy.
- `GROQ_API_KEY`: Required for symptom and side-effect endpoints.
- `GROQ_MODEL`: Optional model name, defaults to `openai/gpt-oss-120b`.

Compatibility note:
- Backend also accepts legacy `GROK_API_KEY` and `GROK_MODEL` if present.

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

Backend data is stored in a JSON document at `DATA_FILE` (default `server/data/db.json`).
The database is auto-created on first startup and includes:

- `users`
- `healthProfiles`
- `appointments`
- `medicineReminders`
- `testSchedules`
- `symptomChecks`

`server/data/db.json` is gitignored by default.

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
