import React from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthLayout from "../../layouts/AuthLayout"
import Input from "../../components/Input"
import Button from "../../components/Button"

export default function RegisterPage() {
  const nav = useNavigate()

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start analyzing resumes with AI (simulated)"
    >
      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-700">Full name</label>
          <Input placeholder="Your name" required />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-700">Email</label>
          <Input type="email" placeholder="you@example.com" required />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-700">Password</label>
          <Input type="password" placeholder="Create a password" required />
        </div>

        <Button type="button" onClick={() => nav("/app")}>
          Create account
        </Button>

        <p className="text-center text-xs text-slate-600">
          Have an account? <Link className="font-semibold" to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}