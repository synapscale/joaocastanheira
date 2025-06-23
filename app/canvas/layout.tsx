"use client"

import React from "react"

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
