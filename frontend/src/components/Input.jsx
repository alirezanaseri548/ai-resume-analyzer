import React from "react"
import { cn } from "../lib/cn"

export default function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100",
        className
      )}
      {...props}
    />
  )
}