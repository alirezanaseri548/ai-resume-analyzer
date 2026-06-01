import React from "react"
import { cn } from "../lib/cn"

export default function Button({ className, variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-60 disabled:cursor-not-allowed"
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    outline: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
  }
  return <button className={cn(base, variants[variant], className)} {...props} />
}