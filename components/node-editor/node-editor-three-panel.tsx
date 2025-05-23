"use client"

import { useState } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Terminal, ExternalLink } from "lucide-react"
import { CodeEditor } from "./code-editor"
import { DataViewer } from "./data-viewer"
import { ConsoleOutput } from "./console-output"
import { EmptyState } from "./empty-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { Node } from "@/types/workflow"
import { useNodeExecution } from "@/hooks/use-node-execution"

interface NodeEditorThreePanelProps {
  node: Node
  nodeName: string
  codeValue: string
  setCodeValue: (value: string) => void
  codeLanguage: string
  setCodeLanguage: (language: string) => void
  codeMode: string
  setCodeMode: (mode: string) => void
  showMockData: boolean
  setShowMockData: (show: boolean) => void
  mockDataValue: string
  setMockDataValue: (value: string) => void
  showSettings: boolean
  setShowSettings: (show: boolean) => void
  showConsole: boolean
  setShowConsole: (show: boolean) => void
  fontSize: number
  setFontSize: (size: number) => void
  isFullscreen: boolean
  setIsFullscreen: (fullscreen: boolean) => void
  timeout: number
  setTimeout: (timeout: number) => void
  continueOnFail: boolean
  setContinueOnFail: (continueOnFail: boolean) => void
  useSandbox: boolean
  setUseSandbox: (useSandbox: boolean) => void
  isCodeChanged: boolean
  setIsCodeChanged: (changed: boolean) => void
  copyToClipboard: (text: string, message?: string) => void
  formatJson: (json: string) => string
  validateJson: (json: string) => boolean
}

/**
 * NodeEditorThreePanel component
 *
 * A three-panel layout for node editing similar to n8n:
 * - Left panel: Input data
 * - Center panel: Function/code editor
 * - Right panel: Output data
 */
export function NodeEditorThreePanel({
  node,
  nodeName,
  codeValue,
  setCodeValue,
  codeLanguage,
  setCodeLanguage,
  codeMode,
  setCodeMode,
  showMockData,
  setShowMockData,
  mockDataValue,
  setMockDataValue,
  showSettings,
  setShowSettings,
  showConsole,
  setShowConsole,
  fontSize,
  setFontSize,
  isFullscreen,
  setIsFullscreen,
  timeout,
  setTimeout,
  continueOnFail,
  setContinueOnFail,
  useSandbox,
  setUseSandbox,
  isCodeChanged,
  setIsCodeChanged,
  copyToClipboard,
  formatJson,
  validateJson,
}: NodeEditorThreePanelProps) {
  const [activeTab, setActiveTab] = useState<"parameters" | "settings">("parameters")

  const {
    isExecuting,
    executionStatus,
    inputData,
    outputData,
    consoleOutput,
    executeNode,
    setMockInput,
    clearExecution,
    setConsoleOutput,
  } = useNodeExecution({
    node,
    timeout,
    useSandbox,
  })

  // Handle test node execution
  const handleTestNodeExecution = async () => {
    await executeNode(codeValue, inputData)
  }

  // Handle execute previous nodes
  const handleExecutePrevious = () => {
    // This would be implemented based on workflow context
    console.log("Execute previous nodes")
  }

  // Handle set mock data
  const handleSetMockData = () => {
    try {
      const parsedData = JSON.parse(mockDataValue)
      setMockInput(parsedData)
      setShowMockData(false)
    } catch (error) {
      console.error("Invalid JSON:", error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Test Step Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-medium">{nodeName}</div>
        <Button
          onClick={handleTestNodeExecution}
          disabled={isExecuting}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isExecuting ? "Executing..." : "Test step"}
        </Button>
      </div>

      {/* Main Three-Panel Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border">
        {/* INPUT Panel */}
        <ResizablePanel defaultSize={25} minSize={20} className="bg-white">
          <div className="flex flex-col h-full">
            <div className="bg-gray-100 p-3 font-medium text-sm border-b">INPUT</div>
            <div className="flex-1 overflow-auto p-4">
              {showMockData ? (
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted px-3 py-1.5 text-xs font-medium">
                      <span className="text-muted-foreground">Mock Data (JSON)</span>
                    </div>
                    <textarea
                      value={mockDataValue}
                      onChange={(e) => setMockDataValue(e.target.value)}
                      className="w-full p-3 font-mono focus:outline-none resize-none"
                      style={{
                        minHeight: "200px",
                        fontSize: `${fontSize}px`,
                      }}
                      spellCheck="false"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {validateJson(mockDataValue) ? (
                        <span className="text-green-600">Valid JSON</span>
                      ) : (
                        <span className="text-red-600">Invalid JSON</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowMockData(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSetMockData}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {inputData ? (
                    <DataViewer data={inputData} onCopy={(text) => copyToClipboard(text)} />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4 h-full">
                      <p className="text-muted-foreground mb-4">No input data yet</p>
                      <div className="flex flex-col gap-2 w-full">
                        <Button variant="outline" onClick={handleExecutePrevious} className="w-full" size="sm">
                          Execute previous nodes
                        </Button>
                        <Button onClick={() => setShowMockData(true)} className="w-full" size="sm">
                          Set mock data
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* FUNCTION Panel */}
        <ResizablePanel defaultSize={50} minSize={30} className="bg-white">
          <div className="flex flex-col h-full">
            <div className="bg-gray-100 p-3 font-medium text-sm border-b flex justify-between items-center">
              <span>FUNCTION</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConsole(!showConsole)}
                  className={showConsole ? "bg-muted" : ""}
                >
                  <Terminal className="h-4 w-4 mr-1" />
                  Console
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Docs
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "parameters" | "settings")}>
              <div className="px-4 pt-4">
                <TabsList className="grid w-[400px] grid-cols-2">
                  <TabsTrigger value="parameters">Parameters</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="parameters" className="flex-1 overflow-hidden m-0 border-0 p-0">
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code-mode" className="text-sm font-medium block mb-1">
                        Mode
                      </Label>
                      <Select
                        value={codeMode}
                        onValueChange={(value) => {
                          setCodeMode(value)
                          setIsCodeChanged(true)
                        }}
                      >
                        <SelectTrigger id="code-mode" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="runOnceForAllItems">Run Once for All Items</SelectItem>
                          <SelectItem value="runOnceForEachItem">Run Once for Each Item</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="code-language" className="text-sm font-medium block mb-1">
                        Language
                      </Label>
                      <Select
                        value={codeLanguage}
                        onValueChange={(value) => {
                          setCodeLanguage(value)
                          setIsCodeChanged(true)
                        }}
                      >
                        <SelectTrigger id="code-language" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <CodeEditor
                    value={codeValue}
                    onChange={(value) => {
                      setCodeValue(value)
                      setIsCodeChanged(true)
                    }}
                    isChanged={isCodeChanged}
                    fontSize={fontSize}
                    height="calc(100vh - 350px)"
                    onCopy={(text) => copyToClipboard(text, "Code copied to clipboard")}
                    onFormat={() => setCodeValue(formatJson(codeValue))}
                    language={codeLanguage}
                    showConsole={showConsole}
                    toggleConsole={() => setShowConsole(!showConsole)}
                  />

                  {showConsole && <ConsoleOutput logs={consoleOutput} onClear={() => setConsoleOutput([])} />}

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="timeout" className="text-sm font-medium">
                        Timeout (ms)
                      </Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={timeout}
                        onChange={(e) => setTimeout(Number.parseInt(e.target.value))}
                        className="w-24 h-8"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="continue-on-fail" checked={continueOnFail} onCheckedChange={setContinueOnFail} />
                      <Label htmlFor="continue-on-fail" className="text-sm font-medium">
                        Continue on fail
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="use-sandbox" checked={useSandbox} onCheckedChange={setUseSandbox} />
                      <Label htmlFor="use-sandbox" className="text-sm font-medium">
                        Use sandbox
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="flex-1 overflow-auto m-0 border-0 p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="node-name" className="text-sm font-medium block mb-1.5">
                      Node Name
                    </Label>
                    <Input id="node-name" value={nodeName} className="w-full" disabled />
                  </div>

                  <div>
                    <Label htmlFor="node-type" className="text-sm font-medium block mb-1.5">
                      Node Type
                    </Label>
                    <Input id="node-type" value={node.type} className="w-full" disabled />
                  </div>

                  <div>
                    <Label htmlFor="node-id" className="text-sm font-medium block mb-1.5">
                      Node ID
                    </Label>
                    <Input id="node-id" value={node.id} className="w-full" disabled />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* OUTPUT Panel */}
        <ResizablePanel defaultSize={25} minSize={20} className="bg-white">
          <div className="flex flex-col h-full">
            <div className="bg-gray-100 p-3 font-medium text-sm border-b">OUTPUT</div>
            <div className="flex-1 overflow-auto p-4">
              {executionStatus === "idle" && (
                <EmptyState
                  icon={<Play className="h-6 w-6 text-muted-foreground" />}
                  title="Execute this node to view data"
                  description="Click the 'Test step' button to execute this node"
                />
              )}

              {executionStatus === "running" && (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
                  <p className="text-muted-foreground">Executing node...</p>
                </div>
              )}

              {executionStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                  <div className="text-red-500 mr-3">⚠️</div>
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Execution Failed</h4>
                    <p className="text-sm text-red-700">
                      {executionStatus === "error" && "An error occurred during execution."}
                    </p>
                  </div>
                </div>
              )}

              {executionStatus === "warning" && (
                <div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start mb-4">
                    <div className="text-yellow-500 mr-3">⚠️</div>
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Execution Completed with Warnings</h4>
                      <p className="text-sm text-yellow-700">There were warnings during execution.</p>
                    </div>
                  </div>
                  {outputData && <DataViewer data={outputData} onCopy={(text) => copyToClipboard(text)} />}
                </div>
              )}

              {executionStatus === "success" && outputData && (
                <DataViewer data={outputData} onCopy={(text) => copyToClipboard(text)} />
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Help text */}
      <div className="mt-4 text-xs text-muted-foreground">
        <p>
          Type $ for a list of special vars/methods. Debug by using console.log() statements and viewing their output in
          the browser console.
        </p>
      </div>
    </div>
  )
}
