"use client"

import type React from "react"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(0 0% 100%)",
          "--normal-text": "hsl(210 40% 11%)",
          "--normal-border": "hsl(214 32% 91%)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
