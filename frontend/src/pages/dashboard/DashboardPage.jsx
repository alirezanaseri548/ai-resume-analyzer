import React from "react"
import StatCard from "../../components/StatCard"
import Button from "../../components/Button"
import { Link } from "react-router-dom"

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Overview</h2>
          <p className="mt-1 text-sm text-slate-600">Mock stats for your resume analysis workflow.</p>
        </div>
        <Link to="/app/resume">
          <Button>Analyze a Resume</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Resumes analyzed" value="12" hint="Last 30 days" />
        <StatCard title="Avg. match score" value="78%" hint="Across selected job roles" />
        <StatCard title="ATS issues found" value="34" hint="Formatting + keyword gaps" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h3 className="text-sm font-bold text-slate-800">Next steps</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>Upload your resume (PDF/DOCX) – UI placeholder</li>
          <li>Pick target job title</li>
          <li>Get suggestions + keyword gaps</li>
        </ul>
      </div>
    </div>
  )
}