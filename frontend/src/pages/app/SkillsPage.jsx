import React from "react"

export default function SkillsPage() {
  return (
    <div className="page-card">
      <h1 className="page-title">Skills</h1>
      <div className="page-subtitle">
        Track extracted skills, technical strengths, and competency coverage.
      </div>

      <section className="list-card">
        <div className="list-row">
          <div>
            <div className="list-row-title">JavaScript</div>
            <div className="list-row-subtitle">Found in 74 resumes</div>
          </div>
          <div className="badge">Core</div>
        </div>
        <div className="list-row">
          <div>
            <div className="list-row-title">React</div>
            <div className="list-row-subtitle">Found in 53 resumes</div>
          </div>
          <div className="badge">High Demand</div>
        </div>
        <div className="list-row">
          <div>
            <div className="list-row-title">Python</div>
            <div className="list-row-subtitle">Found in 46 resumes</div>
          </div>
          <div className="badge">Trending</div>
        </div>
      </section>
    </div>
  )
}
