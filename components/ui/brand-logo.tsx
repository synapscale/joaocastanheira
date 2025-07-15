"use client"

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import Image from 'next/image'
import { motion } from 'framer-motion'

export type LogoVariant = 'full' | 'icon'

interface BrandLogoProps {
  variant?: LogoVariant
  className?: string
  size?: number
  animated?: boolean
  darkMode?: boolean
}

/**
 * Componente padronizado para logotipo SynapScale.
 * Usa as imagens oficiais da marca SynapScale com opções de animação e responsividade.
 */
export default function BrandLogo({ 
  variant = 'full', 
  className, 
  size = 64, 
  animated = true,
  darkMode = false
}: BrandLogoProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Animation variants
  const logoVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5
      }
    },
    hover: { 
      scale: 1.05,
      transition: { 
        duration: 0.3
      }
    }
  }

  // Determine image source based on variant and dark mode
  const getImageSrc = () => {
    if (variant === 'icon') {
      return darkMode 
        ? "/images/synapscale-symbol-orange.png" 
        : "/images/synapscale-symbol-orange.png"
    }
    
    return darkMode 
      ? "/images/synapscale-logo-full.png" 
      : "/images/synapscale-logo-full.png"
  }

  // Calculate dimensions based on variant
  const getDimensions = () => {
    if (variant === 'icon') {
      return { width: size, height: size }
    }
    return { width: size * 3, height: size }
  }

  const dimensions = getDimensions()
  
  if (!isMounted) {
    // Simple non-animated version for SSR
    return (
      <div className={clsx("flex items-center justify-center", className)}>
        <Image
          src={getImageSrc()}
          alt="SynapScale"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain"
          priority
        />
      </div>
    )
  }

  if (animated) {
    return (
      <motion.div 
        className={clsx("flex items-center justify-center", className)}
        initial="initial"
        animate="animate"
        whileHover={isHovered ? "hover" : "animate"}
        variants={logoVariants}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={getImageSrc()}
          alt="SynapScale"
          width={dimensions.width}
          height={dimensions.height}
          className={clsx(
            "object-contain transition-all duration-300",
            isHovered ? "drop-shadow-lg" : "drop-shadow-none"
          )}
          priority
        />
      </motion.div>
    )
  }

  // Non-animated version
  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <Image
        src={getImageSrc()}
        alt="SynapScale"
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
        priority
      />
    </div>
  )
} 