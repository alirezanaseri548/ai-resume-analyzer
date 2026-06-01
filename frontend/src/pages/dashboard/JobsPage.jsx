import React from "react"

const jobs = [
  { id: 1, title: "Frontend Developer", company: "Acme", match: 82 },
  { id: 2, title: "React Engineer", company: "Nova", match: 76 },
  { id: 3, title: "UI Engineer", company: "Orbit", match: 71 },
]

export default function JobsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Job Matches</h2>
        <p className="mt-1 text-sm text-slate-600">Mock job list for UI demonstration.</p>
      </div>

      <div className="grid gap-3">
        {jobs.map((j) => (
          <div key={j.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-slate-900">{j.title}</div>
                <div className="text-xs text-slate-500">{j.company}</div>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                Match: {j.match}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}