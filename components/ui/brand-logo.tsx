"use client"

import clsx from 'clsx'

export type LogoVariant = 'full' | 'icon'

interface BrandLogoProps {
  variant?: LogoVariant
  className?: string
  size?: number // tamanho base para ícone
}

const Icon = ({ className, size = 64 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 566.93 566.93"
    width={size}
    height={size}
    className={clsx(className)}
  >
    <path
      fill="#EA5923"
      d="M357.99,286.3l-147.16,146.97,43.38-126.96-.17-.24c.54-1.35,.78-2.85,.6-4.43-.52-4.69-4.64-8.15-9.35-8.15h-33.24l-.32-.64c-4.99-.08-9.02-4.16-9.02-9.17,0-2,.64-3.84,1.72-5.34l-.13-.25,146.09-145.89-42.3,125.89,.16,.24c-.54,1.35-.78,2.85-.6,4.43,.52,4.69,4.65,8.15,9.36,8.15h33.24l.32,.64c4.99,.08,9.02,4.16,9.02,9.17,0,2-.64,3.83-1.72,5.34l.13,.25Zm84.03-38.96h-59.19c-4.97,0-7.65-5.83-4.42-9.61l109.68-128.24h-230.1L100.01,267.23c-.4,.37-.78,.76-1.16,1.16l-1.81,1.8,.09,.18c-3.82,4.85-6.12,10.95-6.18,17.59-.13,15.98,13.32,29.06,29.31,29.06h59.19c4.97,0,7.65,5.83,4.43,9.61l-109.68,128.24h230.1l157.97-157.74c.4-.37,.78-.76,1.16-1.16l1.81-1.81-.09-.18c3.82-4.85,6.13-10.95,6.18-17.59,.13-15.98-13.32-29.06-29.31-29.06"
    />
  </svg>
)

// Logo completo (símbolo + texto)
function FullLogoSvg({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 850.39 283.46"
      className={clsx(className)}
    >
      <path
        fill="#EA5923"
        d="M112.16,144.45l-52.98,52.91 15.62-45.71-.06-.09c.2-.49.28-1.03.22-1.6-.19-1.69-1.67-2.93-3.37-2.93h-11.97l-.12-.23c-1.8-.03-3.25-1.5-3.25-3.3 0-.72.23-1.38.62-1.92l-.05-.09 52.6-52.52-15.23,45.32.06.09c-.2.49-.28 1.03-.22 1.6.19 1.69 1.67 2.94 3.37 2.94h11.97l.12.23c1.8.03 3.25 1.5 3.25 3.3 0 .72-.23 1.38-.62 1.92l.05.09Zm30.25-14.03h-21.31c-1.79 0-2.76-2.1-1.59-3.46l39.49-46.17H76.16l-56.88 56.79c-.14.13-.28.27-.42.42l-.65.65.03.07c-1.38 1.75-2.2 3.94-2.22 6.33-.05 5.75 4.8 10.46 10.55 10.46h21.31c1.79 0 2.76 2.1 1.59 3.46L9.98 205.14H92.83l56.87-56.79c.14-.13.28-.27.42-.42l.65-.65-.03-.07c1.38-1.75 2.21-3.94 2.22-6.33.05-5.75-4.8-10.55-10.55-10.46"
      />
      <text
        x="200"
        y="200"
        fontFamily="'Inter', sans-serif"
        fontSize="160"
        fontWeight="800"
        fill="#1D1D1B"
      >
        SynapScale
      </text>
    </svg>
  )
}

/**
 * Componente padronizado para logotipo SynapScale.
 * Os arquivos devem estar dentro da pasta `public/images`.
 * - full  -> /images/synapscale-full.png
 * - icon  -> /images/synapscale-symbol.png
 */
export default function BrandLogo({ variant = 'full', className, size = 64 }: BrandLogoProps) {
  if (variant === 'icon') {
    return <Icon size={size} className={className} />
  }

  return <FullLogoSvg className={className} />
} 