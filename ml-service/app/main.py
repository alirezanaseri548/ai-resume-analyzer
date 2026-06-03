from fastapi import FastAPI, UploadFile, File, HTTPException
from tempfile import NamedTemporaryFile
import shutil
import os

from app.models import AnalysisResponse
from app.parser import (
    extract_skills,
    summarize_experience,
    summarize_education,
    compute_ats_score,
    generate_strengths,
    generate_weaknesses,
    generate_suggestions
)
from app.file_extractors import extract_text

app = FastAPI(title="AI Resume Analyzer ML Service", version="1.0.0")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1]
    if suffix.lower() not in [".pdf", ".docx"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    temp_path = None
    try:
        with NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            shutil.copyfileobj(file.file, temp)
            temp_path = temp.name

        extracted_text = extract_text(temp_path, file.filename)
        if not extracted_text.strip():
            raise HTTPException(status_code=422, detail="Could not extract text from the uploaded file.")

        skills = extract_skills(extracted_text)
        experience_summary = summarize_experience(extracted_text)
        education_summary = summarize_education(extracted_text)
        ats_score = compute_ats_score(extracted_text, skills)
        strengths = generate_strengths(extracted_text, skills)
        weaknesses = generate_weaknesses(extracted_text, skills)
        suggestions = generate_suggestions(extracted_text, skills)

        return AnalysisResponse(
            extracted_text=extracted_text,
            skills=skills,
            experience_summary=experience_summary,
            education_summary=education_summary,
            ats_score=ats_score,
            strengths=strengths,
            weaknesses=weaknesses,
            suggestions=suggestions
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
