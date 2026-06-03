from pydantic import BaseModel
from typing import List, Optional

class AnalysisResponse(BaseModel):
    extracted_text: str
    skills: List[str]
    experience_summary: Optional[str] = None
    education_summary: Optional[str] = None
    ats_score: float
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
