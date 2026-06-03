import React, { useEffect, useState } from "react"
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

function readAuthUser() {
  try {
    const raw =
      JSON.parse(localStorage.getItem("auth_user") || "null") ||
      JSON.parse(localStorage.getItem("user") || "null") ||
      {}

    return {
      fullName:
        raw?.fullName ||
        raw?.name ||
        raw?.user?.fullName ||
        raw?.user?.name ||
        raw?.profile?.fullName ||
        raw?.profile?.name ||
        raw?.email ||
        raw?.user?.email ||
        raw?.profile?.email ||
        "User",
      email: raw?.email || raw?.user?.email || raw?.profile?.email || "",
    }
  } catch {
    return {
      fullName: "User",
      email: "",
    }
  }
}

export default function DashboardLayout() {
  const location = useLocation()
  const title = getHeaderTitle(location.pathname)

  const [headerUser, setHeaderUser] = useState(() => readAuthUser())

  useEffect(() => {
    setHeaderUser(readAuthUser())
  }, [location.pathname])

  useEffect(() => {
    function syncUser() {
      setHeaderUser(readAuthUser())
    }

    window.addEventListener("storage", syncUser)
    window.addEventListener("auth-user-changed", syncUser)

    return () => {
      window.removeEventListener("storage", syncUser)
      window.removeEventListener("auth-user-changed", syncUser)
    }
  }, [])

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
                <div className="header-user-name">{headerUser.fullName}</div>
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
