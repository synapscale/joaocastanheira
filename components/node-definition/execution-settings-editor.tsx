"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ExecutionSettings {
  timeout?: number
  retryOnFail?: boolean
  maxRetries?: number
  retryDelay?: number
  throttle?: {
    rate: number
    timeframe: number
  }
}

interface ExecutionSettingsEditorProps {
  settings: ExecutionSettings
  onChange: (settings: ExecutionSettings) => void
}

export function ExecutionSettingsEditor({ settings, onChange }: ExecutionSettingsEditorProps) {
  const updateSettings = (key: string, value: any) => {
    onChange({
      ...settings,
      [key]: value,
    })
  }

  const updateThrottle = (key: string, value: any) => {
    onChange({
      ...settings,
      throttle: {
        ...settings.throttle,
        [key]: value,
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Settings</CardTitle>
        <CardDescription>Configure how this node executes within a workflow</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                placeholder="30000"
                value={settings.timeout || ""}
                onChange={(e) => updateSettings("timeout", e.target.value ? Number(e.target.value) : undefined)}
              />
              <p className="text-xs text-muted-foreground">Maximum execution time in milliseconds</p>
            </div>

            <div className="flex flex-col justify-between space-y-2">
              <Label>Retry on Failure</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.retryOnFail || false}
                  onCheckedChange={(checked) => updateSettings("retryOnFail", checked)}
                />
                <span>{settings.retryOnFail ? "Enabled" : "Disabled"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Automatically retry execution on failure</p>
            </div>
          </div>

          {settings.retryOnFail && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="maxRetries">Maximum Retries</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  placeholder="3"
                  value={settings.maxRetries || ""}
                  onChange={(e) => updateSettings("maxRetries", e.target.value ? Number(e.target.value) : undefined)}
                />
                <p className="text-xs text-muted-foreground">Maximum number of retry attempts</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
                <Input
                  id="retryDelay"
                  type="number"
                  placeholder="1000"
                  value={settings.retryDelay || ""}
                  onChange={(e) => updateSettings("retryDelay", e.target.value ? Number(e.target.value) : undefined)}
                />
                <p className="text-xs text-muted-foreground">Delay between retry attempts in milliseconds</p>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">Throttling</h3>
            <p className="text-sm text-muted-foreground mb-4">Limit the execution rate of this node</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Rate Limit</Label>
                <Input
                  id="rate"
                  type="number"
                  placeholder="10"
                  value={settings.throttle?.rate || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined
                    if (value) {
                      updateThrottle("rate", value)
                    } else {
                      // If rate is removed, remove the entire throttle object
                      const { throttle, ...rest } = settings
                      onChange(rest)
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Maximum number of executions</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe (ms)</Label>
                <Input
                  id="timeframe"
                  type="number"
                  placeholder="60000"
                  value={settings.throttle?.timeframe || ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined
                    if (value) {
                      updateThrottle("timeframe", value)
                    } else if (settings.throttle?.rate) {
                      // If timeframe is removed but rate exists, set a default
                      updateThrottle("timeframe", 60000)
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Time period for the rate limit in milliseconds</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
