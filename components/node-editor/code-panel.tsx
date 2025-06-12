"use client"
import { PanelHeader } from "./panel-header"
import { CodeEditor } from "./code-editor"
import { ConsoleOutput } from "./console-output"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Terminal, Play, RefreshCw, Plus, Minus, Maximize2, Minimize2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface CodePanelProps {
  showSettings: boolean
  setShowSettings: (show: boolean) => void
  showConsole: boolean
  setShowConsole: (show: boolean) => void
  codeValue: string
  setCodeValue: (value: string) => void
  isCodeChanged: boolean
  setIsCodeChanged: (changed: boolean) => void
  codeMode: string
  setCodeMode: (mode: string) => void
  codeLanguage: string
  setCodeLanguage: (language: string) => void
  fontSize: number
  setFontSize: (size: number) => void
  isFullscreen: boolean
  setIsFullscreen: (fullscreen: boolean) => void
  timeout: number
  setTimeout: (timeout: number) => void
  continueOnFail: boolean
  setContinueOnFail: (continueOnFail: boolean) => void
  useSandbox: boolean
  setUseSandbox: (use: boolean) => void
  consoleOutput: string[]
  setConsoleOutput: (logs: string[]) => void
  handleTestNode: () => void
  isExecuting: boolean
  copyToClipboard: (text: string, message?: string) => void
  formatJson: (json: string) => string
  nodeName: string
  setNodeName: (name: string) => void
  nodeDescription: string
  setNodeDescription: (description: string) => void
  nodeEnabled: boolean
  setNodeEnabled: (enabled: boolean) => void
  retryOnFail: boolean
  setRetryOnFail: (retry: boolean) => void
  maxRetries: number
  setMaxRetries: (retries: number) => void
  retryWait: number
  setRetryWait: (wait: number) => void
  setIsSettingsChanged: (changed: boolean) => void
}

/**
 * CodePanel component.
 *
 * A panel for editing code and node settings.
 */
export function CodePanel({
  showSettings,
  setShowSettings,
  showConsole,
  setShowConsole,
  codeValue,
  setCodeValue,
  isCodeChanged,
  setIsCodeChanged,
  codeMode,
  setCodeMode,
  codeLanguage,
  setCodeLanguage,
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
  consoleOutput,
  setConsoleOutput,
  handleTestNode,
  isExecuting,
  copyToClipboard,
  formatJson,
  nodeName,
  setNodeName,
  nodeDescription,
  setNodeDescription,
  nodeEnabled,
  setNodeEnabled,
  retryOnFail,
  setRetryOnFail,
  maxRetries,
  setMaxRetries,
  retryWait,
  setRetryWait,
  setIsSettingsChanged,
}: CodePanelProps) {
  const handleIncreaseFont = () => setFontSize((prev) => Math.min(prev + 2, 24))
  const handleDecreaseFont = () => setFontSize((prev) => Math.max(prev - 2, 10))

  return (
    <div className="flex flex-col h-full flex-1 bg-white">
      <PanelHeader
        title=""
        actions={
          <>
            <div className="flex items-center gap-2">
              <Button
                variant={!showSettings ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowSettings(false)}
                className="h-8"
              >
                Parameters
              </Button>
              <Button
                variant={showSettings ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowSettings(true)}
                className="h-8"
              >
                Settings
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConsole(!showConsole)}
                className={cn("h-8", showConsole && "bg-muted")}
              >
                <Terminal className="h-4 w-4 mr-1" />
                Console
              </Button>
              <Button onClick={handleTestNode} disabled={isExecuting} className="gap-1.5 h-8" size="sm">
                {isExecuting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Test Step
                  </>
                )}
              </Button>
            </div>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-4">
        {!showSettings ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-4 flex-1">
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

              <div className="flex flex-col items-end space-y-2 ml-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleIncreaseFont}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Increase font size</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleDecreaseFont}>
                        <Minus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Decrease font size</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
              height={isFullscreen ? "calc(100vh - 300px)" : "200px"}
              onCopy={(text) => copyToClipboard(text, "Code copied to clipboard")}
              onFormat={() => setCodeValue(formatJson(codeValue))}
            />

            {showConsole && <ConsoleOutput logs={consoleOutput} onClear={() => setConsoleOutput([])} />}

            <div className="flex items-center gap-2">
              <div className="flex-1">
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
        ) : (
          <div className="space-y-6">
            <div>
              <Label htmlFor="node-name" className="text-sm font-medium block mb-1.5">
                Node Name
              </Label>
              <Input
                id="node-name"
                value={nodeName}
                onChange={(e) => {
                  setNodeName(e.target.value)
                  setIsSettingsChanged(true)
                }}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="node-description" className="text-sm font-medium block mb-1.5">
                Description
              </Label>
              <Textarea
                id="node-description"
                value={nodeDescription}
                onChange={(e) => {
                  setNodeDescription(e.target.value)
                  setIsSettingsChanged(true)
                }}
                placeholder="Add a description for this node..."
                className="w-full resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="node-enabled" className="text-sm font-medium cursor-pointer">
                  Enable Node
                </Label>
                <Switch
                  id="node-enabled"
                  checked={nodeEnabled}
                  onCheckedChange={(checked) => {
                    setNodeEnabled(checked)
                    setIsSettingsChanged(true)
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="retry-on-fail" className="text-sm font-medium cursor-pointer">
                  Retry on Failure
                </Label>
                <Switch
                  id="retry-on-fail"
                  checked={retryOnFail}
                  onCheckedChange={(checked) => {
                    setRetryOnFail(checked)
                    setIsSettingsChanged(true)
                  }}
                />
              </div>

              {retryOnFail && (
                <div className="pl-6 space-y-4 border-l-2 border-muted">
                  <div>
                    <Label htmlFor="max-retries" className="text-sm font-medium block mb-1.5">
                      Max Retries
                    </Label>
                    <Input
                      id="max-retries"
                      type="number"
                      min="1"
                      max="10"
                      value={maxRetries}
                      onChange={(e) => {
                        setMaxRetries(Number.parseInt(e.target.value))
                        setIsSettingsChanged(true)
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="retry-wait" className="text-sm font-medium block mb-1.5">
                      Wait Between Retries (ms)
                    </Label>
                    <Input
                      id="retry-wait"
                      type="number"
                      min="100"
                      step="100"
                      value={retryWait}
                      onChange={(e) => {
                        setRetryWait(Number.parseInt(e.target.value))
                        setIsSettingsChanged(true)
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
