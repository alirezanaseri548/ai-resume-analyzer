# Optional ML service

This directory contains the independent FastAPI service used for experimental resume extraction and scoring. The NestJS backend can run without it using its built-in rule-based analyzer.

## Run with Docker

```powershell
docker compose up --build
```

The service listens on `http://localhost:8000` and exposes `GET /health`.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The Docker setup and the local command both run `app.main:app`. Its `/analyze`
endpoint accepts PDF and DOCX uploads and exposes `GET /health` for a quick
readiness check.
