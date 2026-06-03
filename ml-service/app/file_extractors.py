import fitz
from docx import Document

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        pdf = fitz.open(file_path)
        for page in pdf:
            text += page.get_text()
        pdf.close()
    except Exception:
        pass
    return text.strip()

def extract_text_from_docx(file_path: str) -> str:
    try:
        doc = Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs]).strip()
    except Exception:
        return ""

def extract_text(file_path: str) -> str:
    file_path_lower = file_path.lower()
    if file_path_lower.endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif file_path_lower.endswith(".docx"):
        return extract_text_from_docx(file_path)
    return ""
