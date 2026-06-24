import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-2xl border border-pink-100 bg-pink-50/10 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-550 disabled:cursor-not-allowed disabled:opacity-50 text-gray-700 placeholder:text-gray-400 shadow-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
