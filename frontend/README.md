# Frontend

The frontend is a React + Vite application for uploading resumes, reviewing ATS analysis, comparing a resume with a job description, and downloading PDF reports.

## Setup

From this directory:

```powershell
npm install
Copy-Item .env.example .env
```

Set `VITE_API_BASE_URL` in `.env` when the backend is not running at the default `http://localhost:3001/api`.

## Run and validate

```powershell
npm run dev
npm run lint
npm run build
```

The development app is normally available at `http://localhost:5173`.

## Supported uploads

The file picker accepts `.pdf`, `.docx`, and `.txt` resumes up to 10 MB. The same validation is repeated by the backend so invalid files are not persisted.
