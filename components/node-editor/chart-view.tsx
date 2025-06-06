"use client"

import { memo, useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BarChart, LineChart, AreaChart, DonutChart } from "@tremor/react"

interface ChartViewProps {
  data: any
  emptyMessage?: string
}

type ChartType = "bar" | "line" | "area" | "donut"

/**
 * ChartView component for visualizing data in various chart formats
 */
function ChartViewComponent({ data, emptyMessage = "No data to display" }: ChartViewProps) {
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [xAxis, setXAxis] = useState<string>("")
  const [yAxis, setYAxis] = useState<string>("")

  // Extract available fields for charting
  const fields = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
      return { all: [], numeric: [], categorical: [] }
    }

    const sample = data[0]
    const allFields = Object.keys(sample)

    const numericFields = allFields.filter(
      (key) => typeof sample[key] === "number" || (typeof sample[key] === "string" && !isNaN(Number(sample[key]))),
    )

    const categoricalFields = allFields.filter((key) => typeof sample[key] === "string" && isNaN(Number(sample[key])))

    return { all: allFields, numeric: numericFields, categorical: categoricalFields }
  }, [data])

  // Set default axes if not set
  useMemo(() => {
    if (fields.categorical.length > 0 && !xAxis) {
      setXAxis(fields.categorical[0])
    } else if (fields.all.length > 0 && !xAxis) {
      setXAxis(fields.all[0])
    }

    if (fields.numeric.length > 0 && !yAxis) {
      setYAxis(fields.numeric[0])
    }
  }, [fields, xAxis, yAxis])

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0 || !xAxis || !yAxis) {
      return []
    }

    // For pie/donut charts, aggregate data by category
    if (chartType === "pie" || chartType === "donut") {
      const aggregated: Record<string, number> = {}

      data.forEach((item) => {
        const key = String(item[xAxis] || "Unknown")
        const value = Number(item[yAxis] || 0)

        if (isNaN(value)) return

        if (key in aggregated) {
          aggregated[key] += value
        } else {
          aggregated[key] = value
        }
      })

      return Object.entries(aggregated).map(([name, value]) => ({
        name,
        value,
      }))
    }

    // For bar/line charts, use data directly
    return data.map((item) => ({
      [xAxis]: item[xAxis],
      [yAxis]: Number(item[yAxis] || 0),
    }))
  }, [data, xAxis, yAxis, chartType])

  // If no data or invalid data, show empty message
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
    return <div className="text-center p-4 text-muted-foreground">{emptyMessage}</div>
  }

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="chart-type">Chart Type</Label>
          <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
            <SelectTrigger id="chart-type">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="donut">Donut Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="x-axis">X-Axis / Category</Label>
          <Select value={xAxis} onValueChange={setXAxis}>
            <SelectTrigger id="x-axis">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {fields.all.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="y-axis">Y-Axis / Value</Label>
          <Select value={yAxis} onValueChange={setYAxis}>
            <SelectTrigger id="y-axis">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {fields.numeric.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-[350px] mt-4">
        {chartType === "bar" && (
          <BarChart
            data={chartData}
            index={xAxis}
            categories={[yAxis]}
            colors={["blue"]}
            yAxisWidth={48}
            showLegend={false}
          />
        )}

        {chartType === "line" && (
          <LineChart
            data={chartData}
            index={xAxis}
            categories={[yAxis]}
            colors={["blue"]}
            yAxisWidth={48}
            showLegend={false}
          />
        )}

        {chartType === "area" && (
          <AreaChart
            data={chartData}
            index={xAxis}
            categories={[yAxis]}
            colors={["blue"]}
            yAxisWidth={48}
            showLegend={false}
          />
        )}

        {chartType === "donut" && (
          <DonutChart
            data={chartData}
            category="value"
            index="name"
            colors={["blue", "cyan", "indigo", "violet", "fuchsia", "pink"]}
          />
        )}
      </div>
    </div>
  )
}

export const ChartView = memo(ChartViewComponent)
