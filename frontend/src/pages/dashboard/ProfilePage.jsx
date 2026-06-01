import React from "react"
import Input from "../../components/Input"
import Button from "../../components/Button"

export default function ProfilePage() {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Profile</h2>
        <p className="mt-1 text-sm text-slate-600">Local-only profile form (no backend yet).</p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-700">Full name</label>
          <Input defaultValue="Alireza" />
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-700">Email</label>
          <Input type="email" defaultValue="you@example.com" />
        </div>

        <div className="flex gap-3">
          <Button>Save changes</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </div>
  )
}