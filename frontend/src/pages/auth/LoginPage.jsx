import React from "react"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    navigate("/app")
  }

  return (
    <form onSubmit={handleSubmit} className="form-stack">
      <div>
        <label className="form-label">Email Address</label>
        <input type="email" placeholder="you@example.com" defaultValue="john@company.com" />
      </div>

      <div>
        <label className="form-label">Password</label>
        <input type="password" placeholder="••••••••" defaultValue="12345678" />
      </div>

      <button type="submit" className="primary-btn">
        Login
      </button>

      <div className="secondary-link">
        Demo login enabled for frontend routing preview
      </div>
    </form>
  )
}
