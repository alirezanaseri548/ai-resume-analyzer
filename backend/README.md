# Backend

The backend is a NestJS API backed by PostgreSQL and Prisma. It exposes the API under the `/api` prefix and listens on port `3001` by default.

## Setup

From this directory:

```powershell
npm install
Copy-Item .env.example .env
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Set `DATABASE_URL` in `.env` to the PostgreSQL database started by `docker-compose.db.yml`. The default value is:

```text
postgresql://postgres:postgres@localhost:5432/ai_resume_analyzer?schema=public
```

## Run

```powershell
npm run start:dev
```

The API is available at `http://localhost:3001/api`.

## Tests and build

```powershell
npx jest --runInBand
npm run test:e2e
npm run build
```

The end-to-end suite needs a running PostgreSQL database and a populated `.env` file.

## Resume endpoints

- `POST /api/resumes/upload` accepts PDF, DOCX, and TXT files up to 10 MB.
- `POST /api/resumes/:id/analyze` analyzes a stored resume and accepts an optional `jobDescription` field.
- `POST /api/resumes/:id/match` compares a stored resume with a required job description.

See the repository root `README.md` for the full-stack setup and troubleshooting notes.
