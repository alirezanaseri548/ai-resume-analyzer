# AI Resume Analyzer

A full-stack AI-powered resume analyzer that helps users evaluate resumes, calculate ATS scores, extract skills, and generate improvement insights.

## Preview

![Project Preview](preview.png)

## Tech Stack

- Frontend: React
- Backend: NestJS + Prisma
- ML Service: FastAPI
- Database: PostgreSQL
- ORM: Prisma

## Features

- Upload and analyze resumes
- Extract skills and keywords
- Calculate ATS score
- Show resume insights
- Store analysis results in PostgreSQL
- Separate ML service for AI/ML processing

## Project Structure
```text
ai-resume-analyzer/
├── frontend/
├── backend/
├── ml-service/
├── docker-compose.db.yml
├── SAMPLE_DATA.md
└── README.md

## Getting Started

### 1. Clone the repository

bash
git clone https://github.com/alirezanaseri548/ai-resume-analyzer.git
cd ai-resume-analyzer

### 2. Setup Backend

bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run start:dev

Backend runs at:

text
http://localhost:3000

### 3. Setup Frontend

bash
cd frontend
npm install
npm run dev

Frontend runs at:

text
http://localhost:5173

### 4. Setup ML Service

bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

ML service runs at:

text
http://localhost:8000

## Environment Variables

Create `.env` files based on the example files:

text
backend/.env.example
frontend/.env.example
ml-service/.env.example

Do not commit real `.env` files.

## Contributing

Contributions are welcome. Please check the open issues and create a pull request.

## License

This project is licensed under the MIT License.


2. Topic اضافه کن

برو صفحه اصلی ریپو، قسمت راست `About`، روی آیکن چرخ‌دنده بزن و این topicها را اضافه کن:

```text
resume-analyzer
resume-parser
ai
ats
ats-score
career
job-search
react
nestjs
fastapi
prisma
postgresql
machine-learning
open-source
