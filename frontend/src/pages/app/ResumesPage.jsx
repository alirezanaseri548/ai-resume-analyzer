import React from "react"

export default function ResumesPage() {
  return (
    <div className="page-card">
      <h1 className="page-title">Resumes</h1>
      <div className="page-subtitle">
        Browse uploaded resumes and review applicant document summaries.
      </div>

      <section className="list-card">
        <div className="list-row">
          <div>
            <div className="list-row-title">Ali Ahmadi - Frontend Developer</div>
            <div className="list-row-subtitle">Uploaded 2 hours ago</div>
          </div>
          <div className="badge">PDF</div>
        </div>

        <div className="list-row">
          <div>
            <div className="list-row-title">Sara Mohammadi - UI Designer</div>
            <div className="list-row-subtitle">Uploaded yesterday</div>
          </div>
          <div className="badge">DOCX</div>
        </div>

        <div className="list-row">
          <div>
            <div className="list-row-title">Reza Karimi - Data Analyst</div>
            <div className="list-row-subtitle">Uploaded 3 days ago</div>
          </div>
          <div className="badge">PDF</div>
        </div>
      </section>
    </div>
  )
}
