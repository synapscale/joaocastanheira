interface NodeLabelProps {
  name: string
}

export function NodeLabel({ name }: NodeLabelProps) {
  return (
    <div className="mt-2 text-sm font-medium text-center text-foreground/80 truncate max-w-full" title={name}>
      {name}
    </div>
  )
}
