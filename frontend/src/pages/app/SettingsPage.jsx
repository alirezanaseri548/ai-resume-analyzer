import React from "react"

export default function SettingsPage() {
  return (
    <div className="page-card">
      <h1 className="page-title">Settings</h1>
      <div className="page-subtitle">
        Manage your account preferences and workspace configuration.
      </div>

      <section className="list-card">
        <div className="list-row">
          <div>
            <div className="list-row-title">Profile Name</div>
            <div className="list-row-subtitle">John Smith</div>
          </div>
          <div className="badge">Active</div>
        </div>

        <div className="list-row">
          <div>
            <div className="list-row-title">Email</div>
            <div className="list-row-subtitle">john@company.com</div>
          </div>
          <div className="badge">Verified</div>
        </div>
      </section>
    </div>
  )
}
