"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export function Switch({ checked, onCheckedChange, className, ...props }: { checked?: boolean; onCheckedChange?: (v: boolean) => void; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  )
}
