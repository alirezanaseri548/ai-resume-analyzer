import re
from collections import Counter
from app.skills_db import SKILL_KEYWORDS

def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()

def extract_skills(text: str):
    normalized = normalize_text(text)
    found = []
    for skill in SKILL_KEYWORDS:
        if skill in normalized:
            found.append(skill)
    return sorted(list(set(found)))

def summarize_experience(text: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    candidates = [line for line in lines if any(k in line.lower() for k in ["experience", "developer", "engineer", "intern", "project"])]
    return " | ".join(candidates[:5]) if candidates else "Experience summary not clearly identified."

def summarize_education(text: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    candidates = [line for line in lines if any(k in line.lower() for k in ["education", "university", "bachelor", "master", "phd", "degree"])]
    return " | ".join(candidates[:4]) if candidates else "Education summary not clearly identified."

def compute_ats_score(text: str, skills: list[str]) -> float:
    normalized = normalize_text(text)
    score = 35.0
    if len(text) > 800:
        score += 10
    if len(text) > 1500:
        score += 10
    if len(skills) >= 5:
        score += 15
    if len(skills) >= 10:
        score += 10
    if any(x in normalized for x in ["experience", "work experience", "employment"]):
        score += 5
    if any(x in normalized for x in ["education", "university", "degree"]):
        score += 5
    if any(x in normalized for x in ["projects", "project"]):
        score += 5
    if any(x in normalized for x in ["certification", "certificate"]):
        score += 5
    return max(0.0, min(score, 100.0))

def generate_strengths(text: str, skills: list[str]) -> list[str]:
    strengths = []
    if len(skills) >= 8:
        strengths.append("Strong variety of technical skills detected.")
    if "react" in skills or "nestjs" in skills or "fastapi" in skills:
        strengths.append("Relevant modern framework experience is present.")
    if len(text) > 1200:
        strengths.append("Resume contains substantial detail.")
    if not strengths:
        strengths.append("Resume includes identifiable technical content.")
    return strengths

def generate_weaknesses(text: str, skills: list[str]) -> list[str]:
    weaknesses = []
    lower = normalize_text(text)
    if len(skills) < 5:
        weaknesses.append("Limited number of clearly identifiable skills.")
    if "docker" not in skills:
        weaknesses.append("No explicit Docker experience found.")
    if "aws" not in skills and "azure" not in skills and "gcp" not in skills:
        weaknesses.append("No cloud platform keywords found.")
    if not any(word in lower for word in ["achieved", "improved", "%", "reduced", "increased"]):
        weaknesses.append("Few measurable achievements detected.")
    return weaknesses

def generate_suggestions(text: str, skills: list[str]) -> list[str]:
    suggestions = []
    if "docker" not in skills:
        suggestions.append("Add Docker experience if applicable.")
    if "git" not in skills:
        suggestions.append("Mention version control tools such as Git.")
    if not any(word in text.lower() for word in ["achieved", "improved", "increased", "reduced", "%"]):
        suggestions.append("Include quantified achievements and impact metrics.")
    suggestions.append("Tailor your resume keywords to the target job description.")
    return suggestions
