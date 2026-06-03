import React, { useState, useEffect } from "react"
import { getProfile } from "../../api/userApi"

function safeJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null")
  } catch {
    return null
  }
}

function normalizeUser(data) {
  const candidate =
    data?.user ||
    data?.data?.user ||
    data?.profile ||
    data?.data?.profile ||
    data ||
    {}

  return {
    id: candidate?.id || candidate?._id || null,
    fullName:
      candidate?.fullName ||
      candidate?.name ||
      candidate?.displayName ||
      candidate?.username ||
      candidate?.email ||
      "User",
    email: candidate?.email || "Email not available",
    role: candidate?.role || "USER",
    emailVerified:
      candidate?.emailVerified === true ||
      candidate?.isVerified === true ||
      candidate?.verified === true,
  }
}

function readInitialUser() {
  const authUser = safeJson("auth_user")
  if (authUser) return normalizeUser(authUser)

  const oldUser = safeJson("user")
  if (oldUser) return normalizeUser(oldUser)

  return {
    fullName: "User",
    email: "Email not available",
    role: "USER",
    emailVerified: false,
  }
}

export default function SettingsPage() {
  const [user, setUser] = useState(() => readInitialUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    getProfile()
      .then((data) => {
        if (!mounted) return

        console.log("PROFILE FROM BACKEND FULL:", data)

        const nextUser = normalizeUser(data)

        setUser(nextUser)
        localStorage.setItem("auth_user", JSON.stringify(nextUser))
        localStorage.removeItem("user")
        localStorage.removeItem("userName")

        window.dispatchEvent(new Event("auth-user-changed"))
      })
      .catch((err) => {
        console.error("GET PROFILE ERROR:", err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const fullName = user?.fullName || "User"
  const email = user?.email || "Email not available"

  const role =
    String(user?.role || "USER").toUpperCase() === "ADMIN" ? "ADMIN" : "USER"

  const verified = user?.emailVerified === true

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
            <div className="list-row-subtitle">
              {loading ? "Loading..." : fullName}
            </div>
          </div>
          <div className="badge">{role}</div>
        </div>

        <div className="list-row">
          <div>
            <div className="list-row-title">Email</div>
            <div className="list-row-subtitle">
              {loading ? "Loading..." : email}
            </div>
          </div>
          <div className="badge">{verified ? "Verified" : "Not Verified"}</div>
        </div>
      </section>
    </div>
  )
}
