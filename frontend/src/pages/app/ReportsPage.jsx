import React, { useEffect, useState } from "react"
import api from "../../api/api"

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await api.get("/reports")
        setReports(res.data?.items || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="page-card">
      <h1 className="page-title">Reports</h1>
      <div className="page-subtitle">
        View generated reports and exportable summaries for hiring decisions.
      </div>

      <section className="list-card">
        {loading ? (
          <div>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div>No reports found. Analyze a resume to generate a report.</div>
        ) : (
          reports.map((report) => {
            const content = report.content || {}

            return (
              <div className="list-row" key={report.id}>
                <div>
                  <div className="list-row-title">{report.title}</div>
                  <div className="list-row-subtitle">
                    Generated: {new Date(report.createdAt).toLocaleString()}
                  </div>
                  {content.atsScore !== undefined && (
                    <div className="list-row-subtitle">
                      ATS: {content.atsScore}% · Keyword Match: {content.keywordMatch || 0}% · Readability: {content.readabilityScore || 0}%
                    </div>
                  )}
                  {Array.isArray(content.skills) && content.skills.length > 0 && (
                    <div className="list-row-subtitle">
                      Top skills: {content.skills.slice(0, 5).map((s) => `${s.name} ${s.score}%`).join(", ")}
                    </div>
                  )}
                </div>
                <div className="badge">Ready</div>
              </div>
            )
          })
        )}
      </section>
    </div>
  )
}
