interface Window {
  workflowCanvas?: {
    editConnectionLabel: (connectionId: string, position: { x: number; y: number }) => void
    openNodePanelForConnection: (connectionId: string, position: { x: number; y: number }) => void
  }
}
