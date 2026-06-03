import re
from typing import List

COMMON_SKILLS = [
    "python", "java", "javascript", "typescript", "react", "next.js", "nextjs",
    "node.js", "nodejs", "nestjs", "express", "docker", "kubernetes",
    "postgresql", "postgres", "mysql", "mongodb", "redis", "prisma",
    "git", "github", "html", "css", "tailwind", "fastapi", "django",
    "flask", "aws", "azure", "gcp", "linux", "rest", "graphql"
]

def normalize_text(text: str) -> str:
    return text.strip() if text else ""

def extract_skills(text: str) -> List[str]:
    text_norm = normalize_text(text).lower()
    found = []

    for skill in COMMON_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_norm):
            found.append(skill)

    return sorted(list(set(found)))

def summarize_experience(text: str) -> str:
    text_norm = normalize_text(text)
    if not text_norm:
        return "No experience information found."

    lines = [line.strip() for line in text_norm.splitlines() if line.strip()]
    if not lines:
        return "No experience information found."

    return " | ".join(lines[:5])

def summarize_education(text: str) -> str:
    text_norm = normalize_text(text)
    if not text_norm:
        return "No education information found."

    keywords = ["university", "bachelor", "master", "phd", "education", "college"]
    matches = []

    for line in text_norm.splitlines():
        line_clean = line.strip()
        if line_clean and any(k in line_clean.lower() for k in keywords):
            matches.append(line_clean)

    if matches:
        return " | ".join(matches[:3])

    return "No education information found."

def compute_ats_score(text: str, skills: List[str]) -> int:
    text_norm = normalize_text(text)
    score = 40

    if len(text_norm) > 300:
        score += 15
    if len(text_norm) > 1000:
        score += 10
    if skills:
        score += min(len(skills) * 5, 25)
    if "experience" in text_norm.lower():
        score += 5
    if "education" in text_norm.lower():
        score += 5

    return max(0, min(score, 100))

def generate_strengths(text: str, skills: List[str]) -> List[str]:
    strengths = []

    if skills:
        strengths.append(f"Detected technical skills: {', '.join(skills[:6])}")
    if len(normalize_text(text)) > 500:
        strengths.append("Resume contains a reasonable amount of detail.")
    if "experience" in text.lower():
        strengths.append("Resume appears to include experience information.")
    if "education" in text.lower():
        strengths.append("Resume appears to include education information.")

    if not strengths:
        strengths.append("Resume contains extractable text.")

    return strengths[:5]

def generate_weaknesses(text: str, skills: List[str]) -> List[str]:
    weaknesses = []

    if not skills:
        weaknesses.append("No clear technical skills were detected.")
    if len(normalize_text(text)) < 300:
        weaknesses.append("Resume content may be too short for strong ATS performance.")
    if "experience" not in text.lower():
        weaknesses.append("Experience section was not clearly detected.")
    if "education" not in text.lower():
        weaknesses.append("Education section was not clearly detected.")

    return weaknesses[:5]

def generate_suggestions(text: str, skills: List[str]) -> List[str]:
    suggestions = []

    if not skills:
        suggestions.append("Add a dedicated skills section with relevant technologies.")
    if "experience" not in text.lower():
        suggestions.append("Add a clearly labeled experience section.")
    if "education" not in text.lower():
        suggestions.append("Add a clearly labeled education section.")
    if len(normalize_text(text)) < 300:
        suggestions.append("Expand project, experience, and achievement details.")
    suggestions.append("Use consistent section headings and ATS-friendly formatting.")

    return suggestions[:5]
