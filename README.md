# Health Hub Pro

Health Hub Pro is a full-stack healthcare dashboard built with React, Vite, Tailwind CSS, and Express.js. It helps users manage their health profile, book appointments, track medicine reminders, schedule tests, review emergency details, and use a guided symptom and medicine side-effect checker.

This version uses a custom Node.js + Express backend with local file-based persistence and does not depend on Supabase.

## Features

- User signup and login with token-based authentication
- Multi-step health profile onboarding
- Personal dashboard with BMI, profile summary, upcoming appointments, reminders, and test schedules
- Appointment booking and healthcare management tools
- Medicine reminder tracking
- Test scheduling
- Emergency card with allergies, chronic conditions, and emergency contact details
- Groq-powered symptom analysis and medicine side-effect lookup
- Responsive UI built with React, shadcn/ui, and Tailwind CSS

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express.js
- AI Inference: Groq API (server-side via SDK client)
- Authentication: Custom signed token flow
- Persistence: Local JSON file database
- Testing: Vitest

## Project Structure

```text
health-hub-pro/
|-- public/
|-- scripts/
|   `-- dev.mjs
|-- server/
|   |-- data/
|   |-- lib/
|   |   |-- auth.js
|   |   |-- database.js
|   |   |-- groq.js
|   |   `-- symptomEngine.js
|   `-- index.js
|-- src/
|   |-- components/
|   |-- contexts/
|   |-- lib/
|   |   `-- api.ts
|   `-- pages/
|-- .env
|-- .env.example
|-- package.json
|-- vite.config.ts
`-- README.md
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and update the values if needed:

```env
PORT=3001
JWT_SECRET=replace-this-with-a-long-random-string
DATA_FILE=server/data/db.json
VITE_API_BASE_URL=/api
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-120b
```

Notes:

- `JWT_SECRET` is required and must be a strong random value (minimum 32 characters). The server will refuse to start if it is missing, too short, or left as the placeholder.
- `DATA_FILE` is the local JSON database path used by the backend.
- `VITE_API_BASE_URL=/api` works with the Vite proxy during development.
- `GROQ_API_KEY` is required for the symptom analysis and side-effect endpoints.
- `GROQ_MODEL` is optional and defaults to `openai/gpt-oss-120b`.
- For compatibility, the server also accepts legacy `GROK_API_KEY` / `GROK_MODEL` names if present.

## Collaborator Setup

For a teammate joining the project:

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Run `npm run dev`
5. Start building in `src/` for frontend work or `server/` for backend work

Notes:

- `server/data/db.json` is created automatically on first run and should stay local
- `.env` should not be committed
- `package-lock.json` should be committed so everyone uses the same dependency tree

## Running the App

Start both the frontend and backend together:

```bash
npm run dev
```

This starts:

- Vite frontend on `http://localhost:8080`
- Express backend on `http://localhost:3001`

You can also run them separately:

```bash
npm run dev:client
npm run dev:server
```

## Available Scripts

- `npm run dev` - Starts frontend and backend in development mode
- `npm run dev:client` - Starts the Vite frontend only
- `npm run dev:server` - Starts the Express backend only
- `npm run build` - Builds the frontend for production
- `npm run preview` - Previews the production frontend build
- `npm run start` - Starts the Express server in production mode
- `npm run test` - Runs the Vitest test suite
- `npm run test:watch` - Runs tests in watch mode
- `npm run lint` - Runs ESLint

## API Overview

Main backend routes:

- `POST /api/auth/signup`
- `POST /api/auth/login`
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

## Data Storage

The backend stores application data in a local JSON file defined by `DATA_FILE`. On first run, the file is created automatically.

Important:

- Do not commit real user or health data to GitHub
- Add backups or replace the JSON store with MongoDB/PostgreSQL before production use

## Production Notes

- The Express server can serve the built frontend from the `dist/` folder
- Run `npm run build` before deploying
- Use a strong `JWT_SECRET`
- Move from file-based storage to a real database for multi-user production workloads

## Verification

The current project setup has been verified with:

- `npm run build`
- `npm run test`

## Future Improvements

- Replace JSON persistence with MongoDB or PostgreSQL
- Add role-based access and admin tooling
- Add audit logs and better health record history
- Add Docker support and CI workflows
- Add stronger validation and API rate limiting

## License

This project is available for personal and educational use. Add a license file if you want to open-source it publicly on GitHub.
