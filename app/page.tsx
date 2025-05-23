/**
 * Home Page Component
 *
 * This component serves as the entry point of the application.
 * It automatically redirects users to the canvas page.
 *
 * @returns {null} - Renders nothing as it redirects immediately
 */
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  // Redirect to canvas page on component mount
  useEffect(() => {
    router.push("/canvas")
    // The empty dependency array ensures this effect runs only once on mount
  }, [router])

  // Return null as we're redirecting and don't need to render anything
  return null
}
