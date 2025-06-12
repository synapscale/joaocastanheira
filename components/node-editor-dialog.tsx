"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Node } from "@/types/workflow"
import { useToast } from "@/components/ui/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { NodeInstance } from "@/types/node-definition"

// Smaller components
import { DialogHeader } from "@/components/node-editor/dialog-header"
import { DialogFooter } from "@/components/node-editor/dialog-footer"
import { NodeEditorThreePanel } from "@/components/node-editor/node-editor-three-panel"

interface NodeEditorDialogProps {
  node: Node | null
  open: boolean
  onClose: () => void
  onSave?: (node: Node) => void
  onDelete?: (nodeId: string) => void
  workflowName?: string
}

type ExecutionHistoryItem = {
  id: string
  time: Date
  status: "success" | "error" | "warning"
  duration: string
  input?: any
  output?: any
  error?: string
  warning?: string
}

/**
 * Dialog component for editing node properties and code
 *
 * Provides a comprehensive interface for configuring and testing nodes
 * with input, function, and output panels similar to n8n
 */
export function NodeEditorDialog({ node, open, onClose, onSave, onDelete, workflowName }: NodeEditorDialogProps) {
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")

  // Default panel sizes and state for resizable panels
  const defaultPanelSizes = [20, 60, 20]

  // Initialize panelSizes state with default values
  const [panelSizes, setPanelSizes] = useState(defaultPanelSizes)

  // Use a ref to store the panel sizes in local storage
  const panelSizesRef = useRef(panelSizes)

  // Update the ref whenever panelSizes changes
  useEffect(() => {
    panelSizesRef.current = panelSizes
  }, [panelSizes])

  // Load panel sizes from local storage on component mount
  useEffect(() => {
    try {
      const storedSizes = localStorage.getItem("node-editor-panel-sizes")
      if (storedSizes) {
        setPanelSizes(JSON.parse(storedSizes))
      }
    } catch (e) {
      console.error("Failed to load panel sizes", e)
    }
  }, [])

  // Update local storage when panel sizes change
  const handlePanelResize = useCallback(
    (sizes: number[]) => {
      setPanelSizes(sizes)
      try {
        localStorage.setItem("node-editor-panel-sizes", JSON.stringify(sizes))
      } catch (e) {
        console.error("Failed to save panel sizes", e)
      }
    },
    [setPanelSizes],
  )

  // State for responsive layout
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  // Panel state
  const [showSettings, setShowSettings] = useState(false)

  // Input state
  const [showMockData, setShowMockData] = useState(false)
  const [mockDataValue, setMockDataValue] = useState<string>(`[
  { "id": 1, "name": "Item 1", "value": 100 },
  { "id": 2, "name": "Item 2", "value": 200 },
  { "id": 3, "name": "Item 3", "value": 300 }
]`)
  const [inputData, setInputData] = useState<any>(null)

  // Code state
  const [codeValue, setCodeValue] = useState<string>(`// Loop over input items and add a new field
for (const item of $input.all()) {
  item.json.myNewField = 1;
}

return $input.all();`)
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const [codeMode, setCodeMode] = useState("runOnceForAllItems")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [isCodeChanged, setIsCodeChanged] = useState(false)

  // Execution state
  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "success" | "error" | "warning">("idle")
  const [isExecuting, setIsExecuting] = useState(false)

  // Console state
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [showConsole, setShowConsole] = useState(false)

  // Output state
  const [outputData, setOutputData] = useState<any>(null)
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistoryItem[]>([])
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<string[]>([])
  const [inputViewMode, setInputViewMode] = useState<"json" | "table" | "raw">("json")
  const [outputViewMode, setOutputViewMode] = useState<"json" | "table" | "raw">("json")

  // Node settings
  const [nodeName, setNodeName] = useState("")
  const [nodeDescription, setNodeDescription] = useState("")
  const [nodeEnabled, setNodeEnabled] = useState(true)
  const [retryOnFail, setRetryOnFail] = useState(false)
  const [maxRetries, setMaxRetries] = useState(3)
  const [retryWait, setRetryWait] = useState(1000)
  const [isSettingsChanged, setIsSettingsChanged] = useState(false)

  // Execution settings
  const [timeout, setTimeout] = useState(3000)
  const [continueOnFail, setContinueOnFail] = useState(false)
  const [useSandbox, setUseSandbox] = useState(true)

  // Delete confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  // Keyboard shortcut state
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true)

  // Convert workflow node to node instance
  const nodeToInstance = (node: Node): NodeInstance => {
    return {
      definitionId: node.type, // Assuming node.type corresponds to a definition ID
      id: node.id,
      name: node.name,
      position: node.position,
      parameterValues: node.data || {},
      notes: node.description,
      disabled: node.locked,
    }
  }

  // Convert node instance back to workflow node
  const instanceToNode = (instance: NodeInstance): Node => {
    return {
      id: instance.id,
      type: instance.definitionId,
      name: instance.name,
      position: instance.position,
      inputs: [], // These would need to be populated from the definition
      outputs: [], // These would need to be populated from the definition
      data: instance.parameterValues,
      description: instance.notes,
      locked: instance.disabled,
    }
  }

  const handleExecutionError = useCallback(
    (error: any, startTime: number) => {
      setIsExecuting(false)
      setExecutionStatus("error")

      const executionTime = ((Date.now() - startTime) / 1000).toFixed(1)

      // Add to console
      setConsoleOutput((prev) => [...prev, `[${new Date().toLocaleTimeString()}] [error] ${error.message || error}`])

      // Add to execution history
      const newExecution = {
        id: `exec-${Date.now()}`,
        time: new Date(),
        status: "error" as const,
        duration: `${executionTime}s`,
        input: inputData,
        error: error.message || error,
      }

      setExecutionHistory((prev) => [newExecution, ...prev])

      toast({
        title: "Execution failed",
        description: error.message || error,
        variant: "destructive",
      })
    },
    [inputData, toast],
  )

  const handleSaveNode = useCallback(() => {
    if (onSave && node) {
      // Convert the current node state to a Node instance
      const updatedNode: Node = {
        ...node,
        name: nodeName,
        description: nodeDescription,
        locked: !nodeEnabled,
        data: {
          ...node.data,
          code: codeValue,
          codeMode,
          codeLanguage,
          timeout,
          continueOnFail,
          useSandbox,
          retryOnFail,
          maxRetries,
          retryWait,
        },
      }

      onSave(updatedNode)

      toast({
        title: "Node saved",
        description: "Your changes have been saved successfully",
      })

      setIsCodeChanged(false)
      setIsSettingsChanged(false)
    }
  }, [
    node,
    nodeName,
    nodeDescription,
    nodeEnabled,
    codeValue,
    codeMode,
    codeLanguage,
    timeout,
    continueOnFail,
    useSandbox,
    retryOnFail,
    maxRetries,
    retryWait,
    onSave,
    toast,
  ])

  const handleTestNodeExecution = useCallback(() => {
    if (!inputData && executionStatus !== "success") {
      toast({
        title: "No input data",
        description: "Please execute previous nodes or set mock data first",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)
    setExecutionStatus("running")
    setConsoleOutput([])
    setShowConsole(true)

    // Simulate code execution with the current input data
    const startTime = Date.now()

    // Add console logs during execution
    const addConsoleLog = (message: string, type: "log" | "error" | "warn" = "log") => {
      const timestamp = new Date().toLocaleTimeString()
      setConsoleOutput((prev) => [...prev, `[${timestamp}] [${type}] ${message}`])
    }

    // Simulate execution steps
    addConsoleLog("Starting execution...")

    setTimeout(() => {
      addConsoleLog("Preparing input data...")
    }, 300)

    setTimeout(() => {
      addConsoleLog("Executing code...")

      // Check for common errors in the code
      if (codeValue.includes("JSON.parse(") && !codeValue.includes("try {")) {
        addConsoleLog("Warning: JSON.parse() without try/catch detected", "warn")
      }

      if (codeValue.includes("undefined.")) {
        addConsoleLog("Error: Cannot read property of undefined", "error")

        setTimeout(() => {
          setExecutionStatus("error")
          setIsExecuting(false)

          const executionTime = ((Date.now() - startTime) / 1000).toFixed(1)

          // Add to execution history
          const newExecution = {
            id: `exec-${Date.now()}`,
            time: new Date(),
            status: "error" as const,
            duration: `${executionTime}s`,
            input: inputData,
            error: "TypeError: Cannot read property of undefined",
          }

          setExecutionHistory((prev) => [newExecution, ...prev])

          toast({
            title: "Execution failed",
            description: "TypeError: Cannot read property of undefined",
            variant: "destructive",
          })
        }, 800)

        return
      }

      // Random chance of warning
      if (Math.random() > 0.7) {
        addConsoleLog("Warning: Performance issue detected - consider optimizing your code", "warn")

        setTimeout(() => {
          try {
            // For demo purposes, we'll simulate code execution
            const data = inputData || JSON.parse(mockDataValue)

            addConsoleLog("Processing items: " + data.length)

            // Simple transformation based on the code (just for demo)
            const result = data.map((item: any) => {
              addConsoleLog(`Processing item ${item.id}`)
              return {
                ...item,
                myNewField: 1,
              }
            })

            addConsoleLog("Execution completed with warnings")
            setOutputData(result)
            setExecutionStatus("warning")

            const executionTime = ((Date.now() - startTime) / 1000).toFixed(1)

            // Add to execution history
            const newExecution = {
              id: `exec-${Date.now()}`,
              time: new Date(),
              status: "warning" as const,
              duration: `${executionTime}s`,
              input: data,
              output: result,
              warning: "Performance issue detected - consider optimizing your code",
            }

            setExecutionHistory((prev) => [newExecution, ...prev])

            toast({
              title: "Execution completed with warnings",
              description: `Node executed in ${executionTime}s`,
            })
          } catch (error) {
            handleExecutionError(error, startTime)
          } finally {
            setIsExecuting(false)
          }
        }, 800)

        return
      }

      // Successful execution path
      setTimeout(() => {
        try {
          // For demo purposes, we'll simulate code execution
          const data = inputData || JSON.parse(mockDataValue)

          addConsoleLog("Processing items: " + data.length)

          // Simple transformation based on the code (just for demo)
          const result = data.map((item: any) => {
            addConsoleLog(`Processing item ${item.id}`)
            return {
              ...item,
              myNewField: 1,
            }
          })

          addConsoleLog("Execution completed successfully")
          setOutputData(result)
          setExecutionStatus("success")

          const executionTime = ((Date.now() - startTime) / 1000).toFixed(1)

          // Add to execution history
          const newExecution = {
            id: `exec-${Date.now()}`,
            time: new Date(),
            status: "success" as const,
            duration: `${executionTime}s`,
            input: data,
            output: result,
          }

          setExecutionHistory((prev) => [newExecution, ...prev])

          toast({
            title: "Execution successful",
            description: `Node executed in ${executionTime}s`,
          })
        } catch (error) {
          handleExecutionError(error, startTime)
        } finally {
          setIsExecuting(false)
        }
      }, 800)
    }, 600)
  }, [inputData, executionStatus, toast, codeValue, mockDataValue, handleExecutionError])

  // Auto-collapse panels on mobile/tablet
  useEffect(() => {
    if (isMobile) {
      setLeftPanelCollapsed(true)
      setRightPanelCollapsed(true)
    } else if (isTablet) {
      setRightPanelCollapsed(true)
    } else {
      setLeftPanelCollapsed(false)
      setRightPanelCollapsed(false)
    }
  }, [isMobile, isTablet])

  const isFirstRender = useRef(true)

  // Update state when node changes
  useEffect(() => {
    if (!node) return

    // Avoid unnecessary updates on first render
    if (isFirstRender.current) {
      isFirstRender.current = false
    }

    // Move all state updates inside useEffect
    // and avoid conditional updates that might occur during rendering
    setNodeName(node.name)
    setNodeDescription(node.description || "")
    setNodeEnabled(node.locked !== true)

    // Load code from node data if available
    if (node.data?.code) {
      setCodeValue(node.data.code)
      setCodeMode(node.data.codeMode || "runOnceForAllItems")
      setCodeLanguage(node.data.codeLanguage || "javascript")
    }

    // Load execution settings from node data if available
    if (node.data) {
      setTimeout(node.data.timeout || 3000)
      setContinueOnFail(node.data.continueOnFail || false)
      setUseSandbox(node.data.useSandbox !== false)
      setRetryOnFail(node.data.retryOnFail || false)
      setMaxRetries(node.data.maxRetries || 3)
      setRetryWait(node.data.retryWait || 1000)
    }

    // Reset execution status when node changes
    setExecutionStatus("idle")
    setShowMockData(false)
    setIsCodeChanged(false)
    setIsSettingsChanged(false)

    // Load sample execution history only if it's empty
    if (executionHistory.length === 0) {
      setExecutionHistory([
        {
          id: "exec-1",
          time: new Date(Date.now() - 120000), // 2 minutes ago
          status: "success",
          duration: "1.2s",
          input: [
            { id: 1, name: "Item 1", value: 100 },
            { id: 2, name: "Item 2", value: 200 },
            { id: 3, name: "Item 3", value: 300 },
          ],
          output: [
            { id: 1, name: "Item 1", value: 100, myNewField: 1 },
            { id: 2, name: "Item 2", value: 200, myNewField: 1 },
            { id: 3, name: "Item 3", value: 300, myNewField: 1 },
          ],
        },
        {
          id: "exec-2",
          time: new Date(Date.now() - 600000), // 10 minutes ago
          status: "error",
          duration: "0.8s",
          input: [
            { id: 1, name: "Item 1", value: 100 },
            { id: 2, name: "Item 2", value: 200 },
            { id: 3, name: "Item 3", value: 300 },
          ],
          error: "Unexpected token in JSON at position 42",
        },
        {
          id: "exec-3",
          time: new Date(Date.now() - 3600000), // 1 hour ago
          status: "success",
          duration: "1.5s",
          input: [
            { id: 1, name: "Item 1", value: 100 },
            { id: 2, name: "Item 2", value: 200 },
          ],
          output: [
            { id: 1, name: "Item 1", value: 100, myNewField: 1 },
            { id: 2, name: "Item 2", value: 200, myNewField: 1 },
          ],
        },
        {
          id: "exec-4",
          time: new Date(Date.now() - 10800000), // 3 hours ago
          status: "warning",
          duration: "1.1s",
          input: [
            { id: 1, name: "Item 1", value: 100 },
            { id: 2, name: "Item 2", value: 200 },
          ],
          output: [
            { id: 1, name: "Item 1", value: 100, myNewField: 1 },
            { id: 2, name: "Item 2", value: 200, myNewField: 1 },
          ],
          warning: "Execution completed but with warnings: Deprecated function used",
        },
      ])
    }
  }, [node, executionHistory.length])

  // Function to copy text to clipboard
  const copyToClipboard = useCallback(
    (text: string, message = "Copied to clipboard") => {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: message,
          duration: 2000,
        })
      })
    },
    [toast],
  )

  // Function to format JSON with proper indentation
  const formatJson = useCallback((json: string): string => {
    try {
      const parsed = JSON.parse(json)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return json
    }
  }, [])

  // Function to validate JSON
  const validateJson = useCallback((json: string): boolean => {
    try {
      JSON.parse(json)
      return true
    } catch (e) {
      return false
    }
  }, [])

  const handleExecutePrevious = () => {
    setIsExecuting(true)
    setExecutionStatus("running")
    setConsoleOutput([])
    setShowConsole(true)

    // Simulate fetching data from previous nodes
    const addConsoleLog = (message: string) => {
      const timestamp = new Date().toLocaleTimeString()
      setConsoleOutput((prev) => [...prev, `[${timestamp}] [log] ${message}`])
    }

    addConsoleLog("Executing previous nodes...")

    setTimeout(() => {
      addConsoleLog("Fetching data from node: HTTP Request")
    }, 400)

    setTimeout(() => {
      addConsoleLog("Fetching data from node: Data Transform")
    }, 800)

    setTimeout(() => {
      addConsoleLog("Processing results...")
    }, 1200)

    setTimeout(() => {
      try {
        const mockPreviousData = [
          { id: 1, name: "Item 1", value: 100 },
          { id: 2, name: "Item 2", value: 200 },
          { id: 3, name: "Item 3", value: 300 },
        ]

        addConsoleLog(`Received ${mockPreviousData.length} items`)
        addConsoleLog("Execution completed successfully")

        setInputData(mockPreviousData)
        setExecutionStatus("success")

        toast({
          title: "Previous nodes executed",
          description: "Data retrieved successfully",
        })
      } catch (error) {
        setExecutionStatus("error")
        setConsoleOutput((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [error] Failed to execute previous nodes`,
        ])

        toast({
          title: "Execution failed",
          description: "Failed to execute previous nodes",
          variant: "destructive",
        })
      } finally {
        setIsExecuting(false)
      }
    }, 2000)
  }

  const handleSetMockData = () => {
    if (!showMockData) {
      setShowMockData(true)
      return
    }

    try {
      // Validate JSON
      const parsedData = JSON.parse(mockDataValue)
      setInputData(parsedData)
      setShowMockData(false)
      setExecutionStatus("success")

      toast({
        title: "Mock data set",
        description: "You can now test the node with this data",
      })
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please provide valid JSON data",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNode = () => {
    if (onDelete && node) {
      onDelete(node.id)
      toast({
        title: "Node deleted",
      })
      onClose()
    }
  }

  // Add keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!keyboardShortcutsEnabled) return

      // Save with Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleSaveNode()
        onClose()
      }

      // Execute with Ctrl+Enter or Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        handleTestNodeExecution()
      }

      // Toggle console with Ctrl+` or Cmd+`
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault()
        setShowConsole(!showConsole)
      }

      // Toggle settings with Ctrl+, or Cmd+,
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault()
        setShowSettings(!showSettings)
      }
    },
    [keyboardShortcutsEnabled, showConsole, showSettings, handleSaveNode, handleTestNodeExecution, onClose],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  // Add a warning if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isCodeChanged || isSettingsChanged) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isCodeChanged, isSettingsChanged])

  if (!node || !open) {
    return null
  }

  // Function to safely close the dialog
  const safeClose = () => {
    if (typeof onClose === "function") {
      onClose()
    }
  }

  // Convert workflow node to node instance for the editor
  const nodeInstance: NodeInstance = {
    definitionId: node.type,
    id: node.id,
    name: node.name,
    position: node.position,
    parameterValues: {
      ...node.data,
      code: codeValue,
    },
    notes: node.description,
    disabled: node.locked,
  }

  const handleSaveInstance = (instance: NodeInstance) => {
    if (onSave) {
      // Convert back to workflow node
      const updatedNode: Node = {
        ...node,
        name: instance.name,
        description: instance.notes,
        locked: instance.disabled,
        data: instance.parameterValues,
      }

      onSave(updatedNode)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={safeClose}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] flex flex-col p-0">
        <DialogHeader
          node={node}
          nodeName={nodeName}
          setNodeName={setNodeName}
          onClose={safeClose}
          workflowName={workflowName}
        />

        <div className="flex-1 overflow-hidden p-4">
          {/* Novo layout de três painéis estilo n8n */}
          <NodeEditorThreePanel
            node={node}
            nodeName={nodeName}
            codeValue={codeValue}
            setCodeValue={setCodeValue}
            codeLanguage={codeLanguage}
            setCodeLanguage={setCodeLanguage}
            codeMode={codeMode}
            setCodeMode={setCodeMode}
            inputData={inputData}
            outputData={outputData}
            executionStatus={executionStatus}
            isExecuting={isExecuting}
            handleTestNodeExecution={handleTestNodeExecution}
            handleExecutePrevious={handleExecutePrevious}
            showMockData={showMockData}
            setShowMockData={setShowMockData}
            mockDataValue={mockDataValue}
            setMockDataValue={setMockDataValue}
            handleSetMockData={handleSetMockData}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            showConsole={showConsole}
            setShowConsole={setShowConsole}
            consoleOutput={consoleOutput}
            setConsoleOutput={setConsoleOutput}
            fontSize={fontSize}
            setFontSize={setFontSize}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
            timeout={timeout}
            setTimeout={setTimeout}
            continueOnFail={continueOnFail}
            setContinueOnFail={setContinueOnFail}
            useSandbox={useSandbox}
            setUseSandbox={setUseSandbox}
            isCodeChanged={isCodeChanged}
            setIsCodeChanged={setIsCodeChanged}
            copyToClipboard={copyToClipboard}
            formatJson={formatJson}
            validateJson={validateJson}
          />
        </div>

        <DialogFooter
          isCodeChanged={isCodeChanged}
          isSettingsChanged={isSettingsChanged}
          onDelete={() => setIsDeleteConfirmOpen(true)}
          onCancel={safeClose}
          onSave={() => {
            handleSaveNode()
            safeClose()
          }}
        />
      </DialogContent>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this node?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the node and remove it from the workflow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNode} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
