import React, { useEffect, useMemo, useState } from "react"
import { Download, Gauge, Lightbulb, ShieldCheck, Sparkles } from "lucide-react"
import { getLatestAnalysis } from "../../api/resume"
import { downloadAnalysisPdf } from "../../utils/pdfReport"

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function scoreClass(score) {
  const value = Number(score || 0)
  if (value >= 80) return "score-good"
  if (value >= 60) return "score-medium"
  return "score-low"
}

function ScoreCard({ label, value, icon: Icon, tone = "score-medium" }) {
  const score = Math.max(0, Math.min(100, Math.round(Number(value || 0))))

  return (
    <article className={`analysis-score-card ${tone}`}>
      <div className="analysis-score-topline">
        <span className="analysis-score-icon"><Icon size={18} /></span>
        <span className="analysis-score-label">{label}</span>
      </div>
      <div className="analysis-score-value">{score}%</div>
      <div className="score-bar" aria-label={`${label}: ${score}%`}>
        <span style={{ width: `${score}%` }} />
      </div>
    </article>
  )
}

function InsightList({ title, values, tone, icon: Icon }) {
  const items = toArray(values)
  return (
    <section className={`insight-card ${tone || ""}`}>
      <div className="insight-heading"><Icon size={18} /><span>{title}</span></div>
      {items.length ? (
        <ul className="insight-list">
          {items.map((item, index) => <li key={`${title}-${index}`}>{String(item)}</li>)}
        </ul>
      ) : <div className="muted-text">No items recorded.</div>}
    </section>
  )
}

export default function AnalysisPage() {
  const [data, setData] = useState({
    averageAtsScore: 0,
    keywordMatch: 0,
    readabilityScore: 0,
    latest: null,
  })
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await getLatestAnalysis()
        if (mounted) setData(res || {})
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || "Failed to load analysis")
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const latest = data.latest
  const jobMatch = latest?.jobMatch || null
  const skills = toArray(latest?.skills)
  const report = useMemo(() => ({
    title: latest ? `Resume Analysis - ${latest.resume?.originalFileName || "Resume"}` : "Resume Analysis Report",
    fileName: latest?.resume?.originalFileName,
    atsScore: latest?.atsScore || data.averageAtsScore,
    keywordMatch: data.keywordMatch,
    readabilityScore: data.readabilityScore,
    skills,
    strengths: latest?.strengths,
    weaknesses: latest?.weaknesses,
    suggestions: latest?.suggestions,
    jobMatch,
  }), [latest, data.averageAtsScore, data.keywordMatch, data.readabilityScore, skills, jobMatch])

  function handleExport() {
    try {
      setExporting(true)
      const fileName = `${(latest?.resume?.originalFileName || "resume-analysis").replace(/\.[^.]+$/, "")}-analysis.pdf`
      downloadAnalysisPdf(report, fileName)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <div className="page-card loading-state">Loading analysis...</div>
  }

  return (
    <div className="page-stack">
      <section className="page-card analysis-header-card">
        <div className="section-heading-row">
          <div>
            <h1 className="page-title">Analysis</h1>
            <div className="page-subtitle">
              Review ATS compatibility, keyword coverage, readability, and actionable resume improvements.
            </div>
          </div>
          <button type="button" className="primary-btn export-btn" onClick={handleExport} disabled={!latest || exporting}>
            <Download size={18} /> {exporting ? "Preparing PDF..." : "Export PDF"}
          </button>
        </div>

        {error && <div className="feedback feedback-error" role="alert">{error}</div>}

        <div className="analysis-score-grid">
          <ScoreCard label="Average ATS Score" value={data.averageAtsScore} icon={Gauge} tone={scoreClass(data.averageAtsScore)} />
          <ScoreCard label="Keyword Match" value={data.keywordMatch} icon={Sparkles} tone={scoreClass(data.keywordMatch)} />
          <ScoreCard label="Readability" value={data.readabilityScore} icon={ShieldCheck} tone={scoreClass(data.readabilityScore)} />
        </div>
      </section>

      {latest ? (
        <>
          <section className="page-card latest-analysis-card">
            <div className="section-heading-row compact-heading">
              <div>
                <div className="eyebrow">Latest resume</div>
                <h2 className="section-title">{latest.resume?.originalFileName || "Latest Resume"}</h2>
                <div className="page-subtitle">Analyzed {latest.createdAt ? new Date(latest.createdAt).toLocaleString() : "recently"}</div>
              </div>
              <div className={`hero-score ${scoreClass(latest.atsScore)}`}>
                <span>{Math.round(Number(latest.atsScore || 0))}%</span>
                <small>ATS score</small>
              </div>
            </div>

            <div className="analysis-detail-grid">
              <div className="detail-panel">
                <div className="detail-panel-title">Detected skills</div>
                <div className="skill-chip-list large-chips">
                  {skills.length ? skills.map((skill) => (
                    <span className="skill-chip" key={typeof skill === "string" ? skill : skill.name}>
                      {typeof skill === "string" ? skill : `${skill.name} - ${Math.round(skill.score || 0)}%`}
                    </span>
                  )) : <span className="muted-text">No skills detected.</span>}
                </div>
              </div>

              <div className="detail-panel">
                <div className="detail-panel-title">Experience</div>
                <div className="detail-panel-copy">{latest.experienceSummary || "No experience summary available."}</div>
                <div className="detail-panel-title detail-panel-title-spaced">Education</div>
                <div className="detail-panel-copy">{latest.educationSummary || "No education summary available."}</div>
              </div>
            </div>
          </section>

          {jobMatch && (
            <section className="page-card job-match-card">
              <div className="section-heading-row compact-heading">
                <div>
                  <div className="eyebrow">Target role comparison</div>
                  <h2 className="section-title">Job description match</h2>
                </div>
                <div className={`hero-score ${scoreClass(jobMatch.matchScore)}`}>
                  <span>{Math.round(Number(jobMatch.matchScore || 0))}%</span>
                  <small>match</small>
                </div>
              </div>
              <div className="match-columns">
                <div>
                  <div className="detail-panel-title">Matched keywords</div>
                  <div className="skill-chip-list large-chips">
                    {toArray(jobMatch.matchedSkills).length ? toArray(jobMatch.matchedSkills).map((item) => <span className="skill-chip chip-success" key={item}>{item}</span>) : <span className="muted-text">None detected</span>}
                  </div>
                </div>
                <div>
                  <div className="detail-panel-title">Missing keywords</div>
                  <div className="skill-chip-list large-chips">
                    {toArray(jobMatch.missingSkills).length ? toArray(jobMatch.missingSkills).map((item) => <span className="skill-chip chip-warning" key={item}>{item}</span>) : <span className="muted-text">None detected</span>}
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="insight-grid">
            <InsightList title="Strengths" values={latest.strengths} tone="insight-success" icon={ShieldCheck} />
            <InsightList title="Areas to improve" values={latest.weaknesses} tone="insight-warning" icon={Gauge} />
            <InsightList title="Suggestions" values={latest.suggestions} tone="insight-info" icon={Lightbulb} />
          </div>
        </>
      ) : (
        <section className="page-card empty-state">
          <div className="section-icon"><Sparkles size={22} /></div>
          <h2 className="section-title">No analysis yet</h2>
          <div className="page-subtitle">Upload a resume from the Resumes page to see scores and recommendations.</div>
        </section>
      )}
    </div>
  )
}
