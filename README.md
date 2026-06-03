# AI Resume Analyzer

A full-stack AI-powered resume analyzer project.

## فارسی

این پروژه شامل سه بخش اصلی است:

- **Frontend:** React
- **Backend:** NestJS + Prisma
- **ML Service:** FastAPI
- **Database:** PostgreSQL

## English

This project contains:

- **Frontend:** React
- **Backend:** NestJS + Prisma
- **ML Service:** FastAPI
- **Database:** PostgreSQL

---

## Project Structure
`	ext
frontend/
backend/
ml-service/

---

## Environment Files

Before running the project, create real .env files based on:

text
backend/.env.example
frontend/.env.example
ml-service/.env.example

Real .env files are ignored by Git for security.

---

## Database

The project uses PostgreSQL with Prisma.

### Run PostgreSQL

bash
cd backend
docker compose up -d

### Prisma Setup

bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed

Sample data is available through Prisma seed files.

More details:

text
SAMPLE_DATA.md
backend/prisma/schema.prisma
backend/prisma/seed.js
backend/prisma/seed.ts

---

## Backend

bash
cd backend
npm install
npm run start:dev

Default backend URL:

text
http://localhost:3000

---

## Frontend

bash
cd frontend
npm install
npm run dev

Default frontend URL:

text
http://localhost:5173

---

## ML Service

bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Default ML service URL:

text
http://localhost:8000

---

## Security Notes

The following files are ignored and should not be pushed:

- .env
- .env.*
- 
ode_modules
- dist
- uild
- temporary files
- backup files
- runtime uploads

Use .env.example files for public configuration examples.

---

## GitHub Repository

text
https://github.com/alirezanaseri548/ai-resume-analyzer
