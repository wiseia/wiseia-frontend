import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#0A4F9D] text-white hover:bg-[#0A4F9D]/80",
        secondary:
          "border-transparent bg-[#6C757D] text-white hover:bg-[#6C757D]/80",
        destructive:
          "border-transparent bg-[#DC3545] text-white hover:bg-[#DC3545]/80",
        success:
          "border-transparent bg-[#28A745] text-white hover:bg-[#28A745]/80",
        warning:
          "border-transparent bg-[#FFC107] text-black hover:bg-[#FFC107]/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }