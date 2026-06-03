import React, { useEffect, useState } from "react"
import { getLatestAnalysis } from "../../api/resume"

export default function AnalysisPage() {
  const [data, setData] = useState({
    averageAtsScore: 0,
    keywordMatch: 0,
    readabilityScore: 0,
    latest: null,
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await getLatestAnalysis()
        setData(res)
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [])

  return (
    <div className="page-card">
      <h1 className="page-title">Analysis</h1>
      <div className="page-subtitle">
        Review candidate scoring, ATS compatibility, and resume quality indicators.
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Average ATS Score</div>
          <div className="stat-value">{data.averageAtsScore || 0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Keyword Match</div>
          <div className="stat-value">{data.keywordMatch || 0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Readability Score</div>
          <div className="stat-value">{data.readabilityScore || 0}%</div>
        </div>
      </div>

      {data.latest && (
        <section className="list-card" style={{ marginTop: "20px" }}>
          <div className="list-row">
            <div>
              <div className="list-row-title">
                {data.latest.resume?.originalFileName || "Latest Resume"}
              </div>
              <div className="list-row-subtitle">
                ATS Score: {data.latest.atsScore || 0}%
              </div>
              <div className="list-row-subtitle">
                Experience: {data.latest.experienceSummary || "-"}
              </div>
            </div>
            <div className="badge">Latest</div>
          </div>
        </section>
      )}
    </div>
  )
}
