interface PlusIndicatorCircleProps {
  isHovered: boolean
}

export function PlusIndicatorCircle({ isHovered }: PlusIndicatorCircleProps) {
  return (
    <circle
      cx="8"
      cy="8"
      r="8"
      fill={isHovered ? "#4f46e5" : "#6366f1"}
      stroke="#ffffff"
      strokeWidth="1.5"
      className="transition-colors duration-150"
      style={{
        filter: isHovered ? "drop-shadow(0 0 2px rgba(99, 102, 241, 0.5))" : "none",
      }}
    />
  )
}
