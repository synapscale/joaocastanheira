"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { NodeExecution, NodeOperationMode } from "@/types/node-definition"

interface ExecutionSettingsEditorProps {
  execution: NodeExecution
  onChange: (execution: NodeExecution) => void
}

export function ExecutionSettingsEditor({ execution, onChange }: ExecutionSettingsEditorProps) {
  const updateExecution = (updates: Partial<NodeExecution>) => {
    onChange({ ...execution, ...updates })
  }

  const updateRetry = (updates: Partial<NodeExecution["retry"]>) => {
    onChange({
      ...execution,
      retry: {
        ...(execution.retry || { enabled: false, count: 3, interval: 1000 }),
        ...updates,
      },
    })
  }

  const updateThrottle = (updates: Partial<NodeExecution["throttle"]>) => {
    onChange({
      ...execution,
      throttle: {
        ...(execution.throttle || { enabled: false, rate: 1, interval: "second" }),
        ...updates,
      },
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Execution Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="execution-mode">Operation Mode</Label>
            <Select
              value={execution.mode}
              onValueChange={(value) => updateExecution({ mode: value as NodeOperationMode })}
            >
              <SelectTrigger id="execution-mode">
                <SelectValue placeholder="Select execution mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="singleItem">Process Single Item</SelectItem>
                <SelectItem value="allItems">Process All Items Together</SelectItem>
                <SelectItem value="batch">Process in Batches</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {execution.mode === "singleItem" && "Node will execute once for each item in the input."}
              {execution.mode === "allItems" && "Node will execute once with all items in the input."}
              {execution.mode === "batch" && "Node will execute in batches of items."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="execution-timeout">Timeout (ms)</Label>
            <Input
              id="execution-timeout"
              type="number"
              value={execution.timeout || 30000}
              onChange={(e) => updateExecution({ timeout: Number.parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Maximum time in milliseconds the node is allowed to execute before timing out.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="continue-on-fail"
              checked={execution.continueOnFail || false}
              onCheckedChange={(checked) => updateExecution({ continueOnFail: checked })}
            />
            <Label htmlFor="continue-on-fail">Continue on Fail</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Retry Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="retry-enabled"
              checked={execution.retry?.enabled || false}
              onCheckedChange={(checked) => updateRetry({ enabled: checked })}
            />
            <Label htmlFor="retry-enabled">Enable Retry on Failure</Label>
          </div>

          {execution.retry?.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-muted">
              <div className="space-y-2">
                <Label htmlFor="retry-count">Max Retry Count</Label>
                <Input
                  id="retry-count"
                  type="number"
                  min="1"
                  max="10"
                  value={execution.retry?.count || 3}
                  onChange={(e) => updateRetry({ count: Number.parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Maximum number of retry attempts.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retry-interval">Retry Interval (ms)</Label>
                <Input
                  id="retry-interval"
                  type="number"
                  min="100"
                  step="100"
                  value={execution.retry?.interval || 1000}
                  onChange={(e) => updateRetry({ interval: Number.parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Time to wait between retry attempts in milliseconds.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Throttling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="throttle-enabled"
              checked={execution.throttle?.enabled || false}
              onCheckedChange={(checked) => updateThrottle({ enabled: checked })}
            />
            <Label htmlFor="throttle-enabled">Enable Rate Limiting</Label>
          </div>

          {execution.throttle?.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-muted">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="throttle-rate">Rate Limit</Label>
                  <Input
                    id="throttle-rate"
                    type="number"
                    min="1"
                    value={execution.throttle?.rate || 1}
                    onChange={(e) => updateThrottle({ rate: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="throttle-interval">Interval</Label>
                  <Select
                    id="throttle-interval"
                    value={execution.throttle?.interval || "second"}
                    onValueChange={(value) =>
                      updateThrottle({
                        interval: value as "second" | "minute" | "hour",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="second">Per Second</SelectItem>
                      <SelectItem value="minute">Per Minute</SelectItem>
                      <SelectItem value="hour">Per Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Limits the execution rate to {execution.throttle?.rate || 1} {execution.throttle?.interval || "second"}
                (s).
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
