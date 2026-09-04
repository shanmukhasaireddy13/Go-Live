"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group"
      richColors
      closeButton
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-500" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-500" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-500" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-red-500" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-(--color-signal)" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--color-card)",
          "--normal-text": "var(--color-ink)",
          "--normal-border": "var(--color-rule)",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans text-xs shadow-xl border border-(--color-rule) backdrop-blur-md",
          title: "font-bold text-xs",
          description: "text-[11px] text-(--color-muted)",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
