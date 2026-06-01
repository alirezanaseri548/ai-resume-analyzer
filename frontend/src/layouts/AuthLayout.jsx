import React from "react"
import { Lock, BarChart3, Sparkles, Target } from "lucide-react"

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <section className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-badge">AI</div>
          <div>
            <div className="auth-brand-title">Resume Analyzer</div>
            <div className="auth-brand-subtitle">Smart hiring intelligence</div>
          </div>
        </div>

        <div className="auth-hero">
          <h1>Professional AI workspace for resume analysis</h1>
          <p>
            Review resumes, analyze candidate quality, track skills, and manage
            reports from one premium dashboard experience.
          </p>

          <div className="auth-pills">
            <div className="auth-pill">
              <BarChart3 size={18} />
              <span>Analysis</span>
            </div>
            <div className="auth-pill">
              <Sparkles size={18} />
              <span>Skills</span>
            </div>
            <div className="auth-pill">
              <Target size={18} />
              <span>Reports</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-card">
          <div className="auth-card-icon">
            <Lock size={28} strokeWidth={2.2} />
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  )
}
