interface PlusIndicatorCircleProps {
  isHovered: boolean
}

export function PlusIndicatorCircle({ isHovered }: PlusIndicatorCircleProps) {
  return (
    <circle
      cx="8"
      cy="8"
      r="8"
      fill={isHovered ? "#3b82f6" : "#ffffff"}
      stroke={isHovered ? "#ffffff" : "#3b82f6"}
      strokeWidth="1.5"
      className="transition-colors duration-150"
      style={{
        filter: isHovered ? "drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))" : "none",
      }}
    />
  )
}
