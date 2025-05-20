"use client"

import React from "react"
import { ChatInterface } from "@chat-interativo/chat/chat-interface"
import { AppProvider } from "../../contexts/chat-interativo/app-context";
import { Metadata } from "next";

export const metadata: Metadata = {
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function ChatPage() {
  return (
    <AppProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Chat Interativo</h1>
        <div className="bg-white rounded-lg shadow-md p-4">
          <ChatInterface />
        </div>
      </div>
    </AppProvider>
  )
}
