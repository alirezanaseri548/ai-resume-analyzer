import React, { useEffect, useState } from "react"
import { getMySkills } from "../../api/skillsApi"

export default function SkillsPage() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getMySkills()
        setSkills(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const average =
    skills.length > 0
      ? Math.round(skills.reduce((sum, item) => sum + Number(item.score || 0), 0) / skills.length)
      : 0

  return (
    <div className="page-card">
      <h1 className="page-title">Skills</h1>
      <div className="page-subtitle">
        Track extracted skills, technical strengths, and competency coverage.
      </div>

      <div className="stats-grid" style={{ marginBottom: "20px" }}>
        <div className="stat-card">
          <div className="stat-label">Detected Skills</div>
          <div className="stat-value">{skills.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Skill Score</div>
          <div className="stat-value">{average}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top Skill</div>
          <div className="stat-value" style={{ fontSize: "24px" }}>
            {skills[0]?.name || "-"}
          </div>
        </div>
      </div>

      <section className="list-card">
        {loading ? (
          <div>Loading skills...</div>
        ) : skills.length === 0 ? (
          <div>No skills found. Upload and analyze a resume first.</div>
        ) : (
          skills.map((skill) => (
            <div className="list-row" key={skill.id || skill.name}>
              <div>
                <div className="list-row-title">{skill.name}</div>
                <div className="list-row-subtitle">
                  Average score: {skill.score || 0}% · Found in {skill.count || 1} analyzed resume(s) · {skill.category || "General"}
                </div>
                <div style={{ marginTop: "8px", height: "8px", background: "#eee", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${skill.score || 0}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #5b5cf6, #8b5cf6)",
                      borderRadius: "999px",
                    }}
                  />
                </div>
              </div>
              <div className="badge">{skill.label || "Detected"}</div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
