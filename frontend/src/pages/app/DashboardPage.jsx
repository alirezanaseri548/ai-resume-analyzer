import React from "react"

export default function DashboardPage() {
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
            <div className="stat-value">248</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed Analysis</div>
            <div className="stat-value">194</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Matched Candidates</div>
            <div className="stat-value">63</div>
          </div>
        </div>
      </section>

      <section className="list-card">
        <div className="list-row">
          <div>
            <div className="list-row-title">Senior Frontend Developer</div>
            <div className="list-row-subtitle">12 resumes processed today</div>
          </div>
          <div className="badge">Active</div>
        </div>

        <div className="list-row">
          <div>
            <div className="list-row-title">Backend Engineer</div>
            <div className="list-row-subtitle">8 resumes processed today</div>
          </div>
          <div className="badge">Reviewing</div>
        </div>

        <div className="list-row">
          <div>
            <div className="list-row-title">Product Designer</div>
            <div className="list-row-subtitle">5 resumes processed today</div>
          </div>
          <div className="badge">Pending</div>
        </div>
      </section>
    </div>
  )
}
