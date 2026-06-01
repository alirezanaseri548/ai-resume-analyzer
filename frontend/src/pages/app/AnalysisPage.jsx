import React from "react"

export default function AnalysisPage() {
  return (
    <div className="page-card">
      <h1 className="page-title">Analysis</h1>
      <div className="page-subtitle">
        Review candidate scoring, ATS compatibility, and resume quality indicators.
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Average ATS Score</div>
          <div className="stat-value">84%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Keyword Match</div>
          <div className="stat-value">72%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Readability Score</div>
          <div className="stat-value">91%</div>
        </div>
      </div>
    </div>
  )
}
