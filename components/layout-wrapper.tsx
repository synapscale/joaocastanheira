"use client"

import { motion } from "framer-motion"
import { useSidebar } from "@/context/sidebar-context"
import { useEffect, useState } from "react"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isCollapsed } = useSidebar()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // No mobile, o conteúdo ocupa toda a largura
  if (isMobile) {
    return (
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    )
  }

  // No desktop, ajustar margem baseado no estado da sidebar
  return (
    <motion.div
      className="flex-1 overflow-auto"
      initial={false}
      animate={{
        marginLeft: isCollapsed ? "4.5rem" : "16rem"
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  )
}

