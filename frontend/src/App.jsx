import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"

import AuthLayout from "./layouts/AuthLayout"
import DashboardLayout from "./layouts/DashboardLayout"

import LoginPage from "./pages/auth/LoginPage"
import DashboardPage from "./pages/app/DashboardPage"
import ResumesPage from "./pages/app/ResumesPage"
import AnalysisPage from "./pages/app/AnalysisPage"
import SkillsPage from "./pages/app/SkillsPage"
import ReportsPage from "./pages/app/ReportsPage"
import HistoryPage from "./pages/app/HistoryPage"
import SettingsPage from "./pages/app/SettingsPage"

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthLayout
            title="Welcome back"
            subtitle="Log in to access your resume analyzer dashboard."
          >
            <LoginPage />
          </AuthLayout>
        }
      />

      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="resumes" element={<ResumesPage />} />
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
