interface ConnectionEndpointsProps {
  connectionData: {
    fromX?: number
    fromY?: number
    toX?: number
    toY?: number
    path: string
  }
}

export function ConnectionEndpoints({ connectionData }: ConnectionEndpointsProps) {
  return (
    <>
      {connectionData.fromX !== undefined && connectionData.fromY !== undefined && (
        <circle
          cx={connectionData.fromX}
          cy={connectionData.fromY}
          r={4}
          fill="#9ca3af"
          stroke="#ffffff"
          strokeWidth={1}
          className="connection-endpoint"
        />
      )}

      {connectionData.toX !== undefined && connectionData.toY !== undefined && (
        <circle
          cx={connectionData.toX}
          cy={connectionData.toY}
          r={4}
          fill="#9ca3af"
          stroke="#ffffff"
          strokeWidth={1}
          className="connection-endpoint"
        />
      )}
    </>
  )
}
