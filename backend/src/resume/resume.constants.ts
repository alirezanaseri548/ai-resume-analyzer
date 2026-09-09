import * as path from 'path';

export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_RESUME_EXTENSIONS = ['.pdf', '.docx', '.txt'] as const;

export const ALLOWED_RESUME_MIME_TYPES: Record<string, string[]> = {
  '.pdf': ['application/pdf', 'application/octet-stream'],
  '.docx': [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/octet-stream',
  ],
  '.txt': ['text/plain', 'application/octet-stream'],
};

export function getResumeExtension(fileName?: string): string {
  return path.extname(fileName || '').toLowerCase();
}

export function validateResumeFile(file: Express.Multer.File): string | null {
  if (!file) return 'Resume file is required';

  const extension = getResumeExtension(file.originalname);
  if (
    !ALLOWED_RESUME_EXTENSIONS.includes(
      extension as (typeof ALLOWED_RESUME_EXTENSIONS)[number],
    )
  ) {
    return 'Unsupported resume file type. Allowed types: PDF, DOCX, or TXT.';
  }

  if (Number(file.size || 0) > MAX_RESUME_FILE_SIZE) {
    return 'Resume file is too large. Maximum size is 10 MB.';
  }

  const mimeType = String(file.mimetype || '').toLowerCase();
  const allowedMimeTypes = ALLOWED_RESUME_MIME_TYPES[extension] || [];
  if (mimeType && !allowedMimeTypes.includes(mimeType)) {
    return `The file type for ${extension.slice(1).toUpperCase()} does not match its extension.`;
  }

  return null;
}
