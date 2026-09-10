import React, { useEffect, useState } from "react"
import { Download, FileText, LoaderCircle } from "lucide-react"
import api from "../../api/api"
import { downloadAnalysisPdf } from "../../utils/pdfReport"

function reportFileName(report) {
  return `${(report?.content?.fileName || report?.title || "resume-analysis")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]+/gi, "-")}-analysis.pdf`
}

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [exportingId, setExportingId] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await api.get("/reports")
        if (mounted) setReports(Array.isArray(res.data?.items) ? res.data.items : [])
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || "Failed to load reports")
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  function handleExport(report) {
    try {
      setExportingId(report.id)
      downloadAnalysisPdf(report.content || {}, reportFileName(report))
    } finally {
      setExportingId(null)
    }
  }

  return (
    <div className="page-stack">
      <section className="page-card reports-header-card">
        <div className="section-heading-row">
          <div>
            <h1 className="page-title">Reports</h1>
            <div className="page-subtitle">
              Download readable analysis reports containing scores, skills, job matches, and suggestions.
            </div>
          </div>
          <div className="section-icon"><FileText size={22} /></div>
        </div>
        {error && <div className="feedback feedback-error" role="alert">{error}</div>}
      </section>

      <section className="list-card report-list-card">
        {loading ? (
          <div className="loading-state"><LoaderCircle className="spin" size={20} /> Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="empty-state">No reports found. Analyze a resume to generate a report.</div>
        ) : (
          reports.map((report) => {
            const content = report.content || {}
            const skills = Array.isArray(content.skills) ? content.skills : []
            const jobMatch = content.jobMatch?.matchScore ?? content.jobMatchScore ?? content.matchScore

            return (
              <article className="report-result-card" key={report.id}>
                <div className="report-result-main">
                  <div className="report-title-row">
                    <div>
                      <div className="list-row-title">{report.title || "Resume Analysis"}</div>
                      <div className="list-row-subtitle">
                        Generated: {report.createdAt ? new Date(report.createdAt).toLocaleString() : "-"}
                      </div>
                    </div>
                    <span className="status-badge status-analyzed">Ready</span>
                  </div>
                  <div className="report-metric-row">
                    {content.atsScore !== undefined && <span className="metric-chip">ATS {Math.round(content.atsScore)}%</span>}
                    {content.keywordMatch !== undefined && <span className="metric-chip">Keywords {Math.round(content.keywordMatch)}%</span>}
                    {content.readabilityScore !== undefined && <span className="metric-chip">Readability {Math.round(content.readabilityScore)}%</span>}
                    {jobMatch !== undefined && jobMatch !== null && <span className="metric-chip metric-chip-highlight">Job match {Math.round(jobMatch)}%</span>}
                  </div>
                  {skills.length > 0 && (
                    <div className="skill-chip-list">
                      {skills.slice(0, 6).map((skill) => (
                        <span className="skill-chip" key={typeof skill === "string" ? skill : skill.name}>
                          {typeof skill === "string" ? skill : `${skill.name} ${Math.round(skill.score || 0)}%`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" className="outline-btn" onClick={() => handleExport(report)} disabled={exportingId === report.id}>
                  <Download size={17} /> {exportingId === report.id ? "Preparing..." : "Download PDF"}
                </button>
              </article>
            )
          })
        )}
      </section>
    </div>
  )
}
