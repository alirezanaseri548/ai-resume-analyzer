from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Any, Dict
import uvicorn

app = FastAPI(title="AI Resume Analyzer ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeTextRequest(BaseModel):
    text: Optional[str] = ""
    jobDescription: Optional[str] = ""
    resumeText: Optional[str] = ""

def make_result(text: str = "", job: str = "") -> Dict[str, Any]:
    text = text or ""
    job = job or ""

    words = [w.strip(".,;:!?()[]{}").lower() for w in text.split()]
    word_count = len(words)

    skills = []
    common = [
        "python", "javascript", "typescript", "react", "node", "nestjs",
        "sql", "postgresql", "docker", "aws", "git", "html", "css",
        "machine learning", "ai", "fastapi", "prisma"
    ]

    low = text.lower()
    for s in common:
        if s in low:
            skills.append(s)

    score = 60
    if word_count > 100:
        score += 10
    if len(skills) >= 3:
        score += 10
    if job and len(job) > 30:
        score += 5

    score = min(score, 95)

    return {
        "score": score,
        "atsScore": score,
        "summary": "Mock ML service is running successfully. Replace this service with real ML logic later.",
        "skills": skills,
        "missingSkills": [],
        "recommendations": [
            "Add more measurable achievements.",
            "Use keywords from the job description.",
            "Keep resume sections clear and ATS-friendly."
        ],
        "wordCount": word_count,
        "status": "ok"
    }

@app.get("/")
def root():
    return {"status": "ok", "service": "ml-service", "port": 8000}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze(req: AnalyzeTextRequest):
    text = req.text or req.resumeText or ""
    job = req.jobDescription or ""
    return make_result(text, job)

@app.post("/analyze-text")
async def analyze_text(req: AnalyzeTextRequest):
    text = req.text or req.resumeText or ""
    job = req.jobDescription or ""
    return make_result(text, job)

@app.post("/analyze-resume")
async def analyze_resume(
    file: Optional[UploadFile] = File(default=None),
    jobDescription: Optional[str] = Form(default="")
):
    content = ""
    if file is not None:
        raw = await file.read()
        try:
            content = raw.decode("utf-8", errors="ignore")
        except Exception:
            content = ""
    return make_result(content, jobDescription)

@app.post("/resume/analyze")
async def resume_analyze(
    file: Optional[UploadFile] = File(default=None),
    jobDescription: Optional[str] = Form(default="")
):
    content = ""
    if file is not None:
        raw = await file.read()
        try:
            content = raw.decode("utf-8", errors="ignore")
        except Exception:
            content = ""
    return make_result(content, jobDescription)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
