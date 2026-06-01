import React from "react"

export default function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="text-sm font-medium text-slate-600">{title}</div>
      <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
      {hint ? <div className="mt-2 text-xs text-slate-500">{hint}</div> : null}
    </div>
  )
}