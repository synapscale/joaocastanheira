"use client"

import clsx from 'clsx'
import Image from 'next/image'

export type LogoVariant = 'full' | 'icon'

interface BrandLogoProps {
  variant?: LogoVariant
  className?: string
  size?: number
}

/**
 * Componente padronizado para logotipo SynapScale.
 * Usa as imagens oficiais da marca SynapScale.
 */
export default function BrandLogo({ variant = 'full', className, size = 64 }: BrandLogoProps) {
  if (variant === 'icon') {
    return (
      <div className={clsx("flex items-center justify-center", className)}>
        <Image
          src="/images/synapscale-symbol-orange.png"
          alt="SynapScale"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </div>
    )
  }

  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <Image
        src="/images/synapscale-logo-full.png"
        alt="SynapScale"
        width={size * 3}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  )
} 