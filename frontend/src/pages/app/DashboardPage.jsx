import React, { useEffect, useState } from "react"
import { getDashboardSummary } from "../../api/dashboardApi"

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    totalResumes: 0,
    completedAnalysis: 0,
    matchedCandidates: 0,
    avgAtsScore: 0,
    reportCount: 0,
    recentActivity: [],
  })

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardSummary()
        setSummary(data)
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [])

  return (
    <div>
      <section className="page-card">
        <h1 className="page-title">Dashboard Overview</h1>
        <div className="page-subtitle">
          Monitor resume analysis performance, candidate insights, and workflow activity.
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Resumes</div>
            <div className="stat-value">{summary.totalResumes || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed Analysis</div>
            <div className="stat-value">{summary.completedAnalysis || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average ATS</div>
            <div className="stat-value">{summary.avgAtsScore || 0}%</div>
          </div>
        </div>
      </section>

      <section className="list-card">
        {summary.recentActivity?.length ? (
          summary.recentActivity.map((item) => (
            <div className="list-row" key={item.id}>
              <div>
                <div className="list-row-title">
                  {item.eventType} - {item.resume?.originalFileName || "Resume"}
                </div>
                <div className="list-row-subtitle">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="badge">{item.eventType}</div>
            </div>
          ))
        ) : (
          <div className="list-row">
            <div>
              <div className="list-row-title">No recent activity</div>
              <div className="list-row-subtitle">Upload and analyze a resume to see activity here.</div>
            </div>
            <div className="badge">Empty</div>
          </div>
        )}
      </section>
    </div>
  )
}
