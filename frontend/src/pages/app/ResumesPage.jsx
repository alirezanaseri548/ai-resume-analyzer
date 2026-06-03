import React, { useEffect, useState } from "react"
import { getResumes, uploadResume, analyzeResume } from "../../api/resume"

export default function ResumesPage() {
  const [resumes, setResumes] = useState([])
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function loadResumes() {
    try {
      const data = await getResumes()
      setResumes(data)
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to load resumes")
      console.error(err)
    }
  }

  useEffect(() => {
    loadResumes()
  }, [])

  async function handleUpload() {
    if (!file) {
      setMessage("Please select a file first")
      return
    }

    try {
      setLoading(true)
      setMessage("Uploading resume...")

      const uploaded = await uploadResume(file)

      setMessage("Resume uploaded. Analyzing now...")
      await analyzeResume(uploaded.id)

      setMessage("Resume uploaded and analyzed successfully")
      setFile(null)
      await loadResumes()
    } catch (err) {
      setMessage(err?.response?.data?.message || "Upload or analysis failed")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAnalyze(id) {
    try {
      setLoading(true)
      setMessage("Analyzing resume...")

      await analyzeResume(id)

      setMessage("Resume analyzed successfully")
      await loadResumes()
    } catch (err) {
      setMessage(err?.response?.data?.message || "Analyze failed")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-card">
      <h1 className="page-title">Resumes</h1>
      <div className="page-subtitle">
        Upload resumes and analyze them with the backend service.
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="button" className="primary-btn" onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Analyze"}
        </button>
      </div>

      {message && <div style={{ marginBottom: "16px" }}>{message}</div>}

      <section className="list-card">
        {resumes.length === 0 ? (
          <div>No resumes found.</div>
        ) : (
          resumes.map((resume) => {
            const latestAnalysis = resume.analyses?.[0]
            const skills = Array.isArray(latestAnalysis?.skills) ? latestAnalysis.skills : []

            return (
              <div key={resume.id} className="list-row">
                <div>
                  <div className="list-row-title">
                    {resume.originalFileName || "Unnamed Resume"}
                  </div>
                  <div className="list-row-subtitle">
                    Status: {resume.status}
                  </div>
                  {latestAnalysis?.atsScore ? (
                    <div className="list-row-subtitle">
                      ATS Score: {Math.round(latestAnalysis.atsScore)}%
                    </div>
                  ) : null}
                  {skills.length > 0 ? (
                    <div className="list-row-subtitle">
                      Skills: {skills.slice(0, 5).map((s) => typeof s === "string" ? s : `${s.name} ${s.score}%`).join(", ")}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="badge"
                  onClick={() => handleAnalyze(resume.id)}
                  disabled={loading}
                >
                  Analyze
                </button>
              </div>
            )
          })
        )}
      </section>
    </div>
  )
}


