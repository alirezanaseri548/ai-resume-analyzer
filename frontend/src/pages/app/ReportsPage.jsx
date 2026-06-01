import React from "react"

export default function ReportsPage() {
  return (
    <div className="page-card">
      <h1 className="page-title">Reports</h1>
      <div className="page-subtitle">
        View generated reports and exportable summaries for hiring decisions.
      </div>

      <section className="list-card">
        <div className="list-row">
          <div>
            <div className="list-row-title">Weekly Hiring Report</div>
            <div className="list-row-subtitle">Generated today at 09:30</div>
          </div>
          <div className="badge">Ready</div>
        </div>
        <div className="list-row">
          <div>
            <div className="list-row-title">Skills Distribution Report</div>
            <div className="list-row-subtitle">Generated yesterday</div>
          </div>
          <div className="badge">Export</div>
        </div>
      </section>
    </div>
  )
}
