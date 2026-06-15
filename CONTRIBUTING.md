# Contributing

Thank you for your interest in contributing to AI Resume Analyzer.

## How to contribute

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Run the project locally
5. Open a pull request

## Branch naming

Use clear branch names:

text
feat/keyword-match-score
fix/upload-validation
docs/update-readme
ui/improve-dashboard
chore/add-ci-workflow

## Pull Request Guidelines

- Keep pull requests small and focused
- Explain what you changed
- Link the related issue
- Add screenshots for UI changes
- Make sure the project runs locally
- Update documentation if needed

## Local Setup

Clone the repository:

bash
git clone https://github.com/alirezanaseri548/ai-resume-analyzer.git
cd ai-resume-analyzer

Install and run each service:

bash
cd backend
npm install
npm run start:dev

bash
cd frontend
npm install
npm run dev

bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

## Good First Issues

New contributors can look for issues labeled:

text
good first issue
help wanted
level:beginner

## Code Style

- Use clear names for variables, functions, and files
- Keep changes readable and focused
- Do not commit real `.env` files
- Do not commit generated folders like `node_modules`, `dist`, or `build`

## Questions

If you are unsure about something, open an issue before starting the work.
