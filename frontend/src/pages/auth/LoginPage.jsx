import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api/api"

function normalizeUser(data, fallbackEmail) {
  const candidate =
    data?.user ||
    data?.data?.user ||
    data?.profile ||
    data?.data?.profile ||
    data

  return {
    id: candidate?.id || candidate?._id || null,
    fullName:
      candidate?.fullName ||
      candidate?.name ||
      candidate?.displayName ||
      candidate?.username ||
      fallbackEmail ||
      "User",
    email: candidate?.email || fallbackEmail || "Email not available",
    role: candidate?.role || "USER",
    emailVerified:
      candidate?.emailVerified === true ||
      candidate?.isVerified === true ||
      candidate?.verified === true,
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      })

      const token =
        res.data?.access_token ||
        res.data?.accessToken ||
        res.data?.token ||
        res.data?.data?.access_token ||
        res.data?.data?.token

      if (!token) {
        throw new Error("Login succeeded but no token returned from backend")
      }

      const normalizedUser = normalizeUser(res.data, email)

      localStorage.removeItem("user")
      localStorage.removeItem("userName")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("token")

      localStorage.setItem("access_token", token)
      localStorage.setItem("auth_user", JSON.stringify(normalizedUser))

      window.dispatchEvent(new Event("auth-user-changed"))

      navigate("/app")
    } catch (err) {
      const msg =
        err?.response?.data?.message
          ? JSON.stringify(err.response.data.message)
          : err?.response?.data
          ? JSON.stringify(err.response.data)
          : err?.message || "Login failed"

      console.error("LOGIN ERROR:", err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-stack">
      <div>
        <label className="form-label">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="form-label">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <div style={{ color: "red", whiteSpace: "pre-wrap" }}>{error}</div>}

      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  )
}
