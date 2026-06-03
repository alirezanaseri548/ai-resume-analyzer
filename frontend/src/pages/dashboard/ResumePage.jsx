import React, { useMemo, useState } from "react"
import Button from "../../components/Button"
import Input from "../../components/Input"

function fakeAnalyze(text) {
  const score = Math.max(35, Math.min(95, 55 + (text.length % 40)))
  const keywords = ["React", "TypeScript", "REST", "Testing", "CI/CD", "Tailwind"]
  const missing = keywords.filter((_, i) => (text.length + i) % 2 === 0).slice(0, 3)
  return {
    score,
    summary: "This is a simulated analysis. Hook your backend/LLM later.",
    missing
  }
}

export default function ResumePage() {
  const [jobTitle, setJobTitle] = useState("Frontend Developer")
  const [resumeText, setResumeText] = useState("")
  const [result, setResult] = useState(null)

  const canAnalyze = useMemo(() => resumeText.trim().length >= 30, [resumeText])

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Resume Analyzer</h2>
        <p className="mt-1 text-sm text-slate-600">Paste resume text for now (file upload can be added later).</p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-700">Target job title</label>
          <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-700">Resume text</label>
          <textarea
            className="min-h-40 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here..."
          />
          <div className="text-xs text-slate-500">Minimum 30 characters to enable analysis.</div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={!canAnalyze}
            onClick={() => setResult({ ...fakeAnalyze(resumeText), jobTitle })}
          >
            Run Analysis
          </Button>
          <Button variant="outline" onClick={() => { setResumeText(""); setResult(null) }}>
            Clear
          </Button>
        </div>
      </div>

      {result && (
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-800">Result</div>
              <div className="text-xs text-slate-500">Target: {result.jobTitle}</div>
            </div>
            <div className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand-800">
              Match score: {result.score}%
            </div>
          </div>

          <p className="text-sm text-slate-700">{result.summary}</p>

          <div>
            <div className="text-sm font-bold text-slate-800">Missing keywords (example)</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.missing.map((k) => (
                <span key={k} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
