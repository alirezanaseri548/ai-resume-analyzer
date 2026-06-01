import React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Crosshair,
  BarChart4,
  History,
  Settings,
  LogOut
} from "lucide-react"

function SidebarItem({ to, icon: Icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
      end={to === "/app"}
    >
      <Icon size={21} strokeWidth={2.1} />
      <span>{children}</span>
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="sidebar-shell">
      <div className="sidebar-panel">
        <div className="sidebar-brand">
          <div className="sidebar-brand-badge">AI</div>
          <div>
            <div className="sidebar-brand-title">Resume Analyzer</div>
            <div className="sidebar-brand-subtitle">Dashboard Panel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <SidebarItem to="/app" icon={LayoutDashboard}>Dashboard</SidebarItem>
          <SidebarItem to="/app/resumes" icon={FileText}>Resumes</SidebarItem>
          <SidebarItem to="/app/analysis" icon={BarChart3}>Analysis</SidebarItem>
          <SidebarItem to="/app/skills" icon={Crosshair}>Skills</SidebarItem>
          <SidebarItem to="/app/reports" icon={BarChart4}>Reports</SidebarItem>
          <SidebarItem to="/app/history" icon={History}>History</SidebarItem>
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-section-label">Account</div>
        <nav className="sidebar-nav sidebar-bottom">
          <SidebarItem to="/app/settings" icon={Settings}>Settings</SidebarItem>
          <SidebarItem to="/login" icon={LogOut}>Logout</SidebarItem>
        </nav>
      </div>
    </aside>
  )
}
