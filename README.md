# AI Resume Analyzer

AI Resume Analyzer is a full-stack workspace for uploading resumes, calculating ATS and keyword scores, comparing a resume with a target job description, and exporting a readable PDF report.

## Stack

- Frontend: React + Vite
- Backend: NestJS + Prisma
- Database: PostgreSQL 15
- ML service: FastAPI (optional, runs independently)

## Prerequisites

- Node.js 20 or newer and npm
- Docker Desktop (for PostgreSQL)
- Python 3.11 or newer (only needed when running the ML service locally)

## First-time setup

From the repository root, create local environment files. These files are ignored by git:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
Copy-Item ml-service/.env.example ml-service/.env
```

Check `backend/.env` before starting the API. The default local database URL is:

```text
postgresql://postgres:postgres@localhost:5432/ai_resume_analyzer?schema=public
```

## Start PostgreSQL

```powershell
docker compose -f docker-compose.db.yml up -d
docker compose -f docker-compose.db.yml ps
```

## Start the backend

Open a terminal in `backend`:

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

The API is available at `http://localhost:3001/api`.

> **Note:** `npx prisma db seed` clears the target database before adding demo
> records. Run it only against a disposable local database.

For a disposable local database where migration history is not important, `npx prisma migrate dev` can be used instead of `migrate deploy`.

## Start the frontend

Open a second terminal in `frontend`:

```powershell
npm install
npm run dev
```

The Vite app is normally available at `http://localhost:5173` and uses `VITE_API_BASE_URL` from `frontend/.env`.

## Start the ML service (optional)

Using Docker:

```powershell
docker compose -f ml-service/docker-compose.yml up --build
```

Or run it directly in PowerShell:

```powershell
Set-Location ml-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Health check: `http://localhost:8000/health`.

## Run tests and checks

Backend unit tests:

```powershell
Set-Location backend
npx jest --runInBand
```

Backend end-to-end tests (requires a running PostgreSQL database and `backend/.env`):

```powershell
npm run test:e2e
```

Frontend checks:

```powershell
Set-Location ..\frontend
npm run lint
npm run build
```

## Resume analysis behavior

- Accepted uploads: `.pdf`, `.docx`, and `.txt`.
- Maximum upload size: 10 MB.
- A job description can be pasted on the Resumes page. It is sent to `POST /api/resumes/:id/analyze` and saved as a job match.
- Direct re-matching is available at `POST /api/resumes/:id/match` with `{ "jobDescription": "..." }`.
- Analysis reports can be downloaded from the Analysis and Reports pages as PDF files containing scores, skills, match data, and suggestions.

## Troubleshooting

### Prisma cannot connect

Confirm that the PostgreSQL container is running, `DATABASE_URL` matches the container credentials, and run:

```powershell
npx prisma generate
npx prisma migrate deploy
```

For a fresh local setup, the root compose file and `backend/.env.example`
both use the `ai_resume_analyzer` database. If an older disposable Docker
volume was created with a different database name, recreate that local volume
before running migrations:

```powershell
docker compose -f docker-compose.db.yml down -v
docker compose -f docker-compose.db.yml up -d
```

`down -v` deletes only the local Docker database volume, so do not use it for
data you need to keep.

### Port already in use

Change `PORT` in `backend/.env`, `VITE_API_BASE_URL` in `frontend/.env`, or the published Docker ports, then restart the affected service.

### Upload rejected

Use a PDF, DOCX, or TXT file smaller than 10 MB. The frontend validates these constraints before sending; the backend validates them again before writing or persisting the file.

### CORS or 401 errors

Start the backend before using protected dashboard pages and make sure the browser token is present in `localStorage` as `access_token`. The default frontend origin is `http://localhost:5173`.

## Project structure

```text
ai-resume-analyzer/
|-- backend/
|-- frontend/
|-- ml-service/
|-- docker-compose.db.yml
|-- SAMPLE_DATA.md
`-- README.md
```

See `CONTRIBUTING.md` before opening a pull request. The project is licensed under the MIT License.
