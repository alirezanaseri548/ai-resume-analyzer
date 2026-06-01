import React from "react"

export default function HistoryPage() {
  return (
    <div className="page-card">
      <h1 className="page-title">History</h1>
      <div className="page-subtitle">
        Review recent dashboard activity and processed candidate actions.
      </div>

      <section className="list-card">
        <div className="list-row">
          <div>
            <div className="list-row-title">Resume analyzed for Backend Engineer</div>
            <div className="list-row-subtitle">10 minutes ago</div>
          </div>
          <div className="badge">Done</div>
        </div>
        <div className="list-row">
          <div>
            <div className="list-row-title">New report exported</div>
            <div className="list-row-subtitle">Today at 08:10</div>
          </div>
          <div className="badge">Success</div>
        </div>
      </section>
    </div>
  )
}
