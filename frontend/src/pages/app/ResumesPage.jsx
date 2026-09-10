import React, { useEffect, useRef, useState } from "react"
import { FileUp, LoaderCircle, Sparkles } from "lucide-react"
import { getResumes, uploadResume, analyzeResume } from "../../api/resume"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"]

function formatFileSize(bytes = 0) {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`
}

function scoreTone(score) {
  const value = Number(score || 0)
  if (value >= 80) return "score-good"
  if (value >= 60) return "score-medium"
  return "score-low"
}

function getLatestMatch(resume) {
  return resume?.jobMatches?.[0] || resume?.analyses?.[0]?.jobMatch || null
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState([])
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  async function loadResumes() {
    try {
      const data = await getResumes()
      setResumes(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load resumes")
      console.error(err)
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadResumes)
  }, [])

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0] || null
    setError("")
    setMessage("")

    if (!nextFile) {
      setFile(null)
      return
    }

    const extension = `.${nextFile.name.split(".").pop()?.toLowerCase() || ""}`
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setFile(null)
      setError("Unsupported file type. Please choose a PDF, DOCX, or TXT resume.")
      event.target.value = ""
      return
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null)
      setError("This file is too large. The maximum supported size is 10 MB.")
      event.target.value = ""
      return
    }

    setFile(nextFile)
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a PDF, DOCX, or TXT file first.")
      return
    }

    try {
      setLoading(true)
      setError("")
      setMessage("Uploading resume...")

      const uploaded = await uploadResume(file)

      setMessage("Resume uploaded. Analyzing now...")
      await analyzeResume(uploaded.id, jobDescription)

      setMessage("Resume uploaded and analyzed successfully.")
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      await loadResumes()
    } catch (err) {
      setError(err?.response?.data?.message || "Upload or analysis failed")
      setMessage("")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAnalyze(id) {
    try {
      setLoading(true)
      setError("")
      setMessage("Analyzing resume...")

      await analyzeResume(id, jobDescription)

      setMessage("Resume analyzed successfully.")
      await loadResumes()
    } catch (err) {
      setError(err?.response?.data?.message || "Analyze failed")
      setMessage("")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="page-card upload-card">
        <div className="section-heading-row">
          <div>
            <h1 className="page-title">Resumes</h1>
            <div className="page-subtitle">
              Upload a resume, optionally paste a job description, and get an ATS-friendly match score.
            </div>
          </div>
          <div className="section-icon"><Sparkles size={22} /></div>
        </div>

        <div className="upload-form-grid">
          <label className="file-picker">
            <FileUp size={20} />
            <span>{file ? file.name : "Choose resume file"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
            />
          </label>

          <div className="file-meta">
            {file ? `${formatFileSize(file.size)} - Ready to analyze` : "PDF, DOCX, or TXT - Max 10 MB"}
          </div>

          <label className="form-field upload-job-field">
            <span className="form-label">Job description (optional)</span>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value.slice(0, 20000))}
              placeholder="Paste the target job description to compare required keywords..."
              rows={5}
              maxLength={20000}
            />
            <span className="field-hint">{jobDescription.length.toLocaleString()} / 20,000 characters</span>
          </label>

          <button type="button" className="primary-btn upload-submit" onClick={handleUpload} disabled={loading}>
            {loading ? <><LoaderCircle className="spin" size={18} /> Processing...</> : "Upload & Analyze"}
          </button>
        </div>

        {error && <div className="feedback feedback-error" role="alert">{error}</div>}
        {message && <div className="feedback feedback-success" role="status">{message}</div>}
      </section>

      <section className="list-card resume-list-card">
        <div className="list-card-header">
          <div>
            <div className="list-card-title">Your resumes</div>
            <div className="list-card-subtitle">Re-run analysis with a new job description whenever you need.</div>
          </div>
          <div className="count-badge">{resumes.length}</div>
        </div>

        {resumes.length === 0 ? (
          <div className="empty-state">No resumes found. Upload one above to begin.</div>
        ) : (
          resumes.map((resume) => {
            const latestAnalysis = resume.analyses?.[0]
            const skills = Array.isArray(latestAnalysis?.skills) ? latestAnalysis.skills : []
            const match = getLatestMatch(resume)
            const atsScore = Math.round(Number(latestAnalysis?.atsScore || 0))

            return (
              <article key={resume.id} className="resume-result-card">
                <div className="resume-result-main">
                  <div className="resume-result-heading">
                    <div>
                      <div className="list-row-title">{resume.originalFileName || "Unnamed Resume"}</div>
                      <div className="list-row-subtitle">{resume.status || "UPLOADED"}</div>
                    </div>
                    <span className={`status-badge status-${String(resume.status || "uploaded").toLowerCase()}`}>
                      {resume.status || "Uploaded"}
                    </span>
                  </div>

                  {latestAnalysis ? (
                    <div className="resume-score-grid">
                      <div className={`score-indicator ${scoreTone(atsScore)}`}>
                        <span className="score-indicator-value">{atsScore}%</span>
                        <span className="score-indicator-label">ATS score</span>
                      </div>
                      <div className="resume-detail-block">
                        <span className="detail-label">Skills detected</span>
                        <div className="skill-chip-list">
                          {skills.slice(0, 6).map((skill) => (
                            <span className="skill-chip" key={typeof skill === "string" ? skill : skill.name}>
                              {typeof skill === "string" ? skill : `${skill.name} ${Math.round(skill.score || 0)}%`}
                            </span>
                          ))}
                          {!skills.length && <span className="muted-text">No skills detected</span>}
                        </div>
                      </div>
                      {match && (
                        <div className="score-indicator score-match">
                          <span className="score-indicator-value">{Math.round(Number(match.matchScore || 0))}%</span>
                          <span className="score-indicator-label">Job match</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="muted-text resume-not-analyzed">This resume has not been analyzed yet.</div>
                  )}
                </div>

                <button type="button" className="outline-btn" onClick={() => handleAnalyze(resume.id)} disabled={loading}>
                  {loading ? "Processing..." : "Analyze again"}
                </button>
              </article>
            )
          })
        )}
      </section>
    </div>
  )
}
