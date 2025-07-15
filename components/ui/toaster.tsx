"use client"

import { ToastProvider } from "@/components/ui/toast"

export function Toaster() {
  return (
    <ToastProvider position="top-right" maxToasts={5} defaultDuration={5000}>
      <div />
    </ToastProvider>
  )
}
