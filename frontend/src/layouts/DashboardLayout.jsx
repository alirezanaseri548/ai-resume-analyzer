import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "../components/Sidebar"

function getHeaderTitle(pathname) {
  if (pathname === "/app") return "Dashboard"
  if (pathname.includes("/app/resumes")) return "Resumes"
  if (pathname.includes("/app/analysis")) return "Analysis"
  if (pathname.includes("/app/skills")) return "Skills"
  if (pathname.includes("/app/reports")) return "Reports"
  if (pathname.includes("/app/history")) return "History"
  if (pathname.includes("/app/settings")) return "Settings"
  return "Dashboard"
}

export default function DashboardLayout() {
  const location = useLocation()
  const title = getHeaderTitle(location.pathname)

  return (
    <div className="dashboard-shell">
      <div className="dashboard-frame">
        <Sidebar />

        <main className="dashboard-main">
          <header className="dashboard-header">
            <div className="container-page dashboard-header-inner">
              <div>
                <div className="dashboard-header-title">{title}</div>
                <div className="dashboard-header-subtitle">
                  Resume Analyzer workspace
                </div>
              </div>

              <div className="header-user">
                <div className="header-user-avatar" />
                <div className="header-user-name">John Smith</div>
              </div>
            </div>
          </header>

          <div className="container-page dashboard-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
