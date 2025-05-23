"use client"

import { useState } from "react"
import { Play, Clock, CheckCircle, XCircle, AlertCircle, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * ExecutionsView component.
 *
 * Displays a list of workflow execution history with filtering and export options.
 * Shows execution details like status, time, duration, and execution mode.
 *
 * @remarks
 * This component is displayed in the "Executions" tab of the workflow editor.
 * It provides filtering capabilities and actions for each execution.
 */
export function ExecutionsView() {
  const [filter, setFilter] = useState("")

  // Mock execution data - in a real app, this would come from an API
  const executions = [
    {
      id: "exec-001",
      startTime: new Date(Date.now() - 1000 * 60 * 5),
      duration: "2.3s",
      status: "success",
      mode: "manual",
      nodes: 5,
    },
    {
      id: "exec-002",
      startTime: new Date(Date.now() - 1000 * 60 * 30),
      duration: "1.8s",
      status: "error",
      mode: "scheduled",
      nodes: 5,
    },
    {
      id: "exec-003",
      startTime: new Date(Date.now() - 1000 * 60 * 60),
      duration: "3.1s",
      status: "success",
      mode: "webhook",
      nodes: 5,
    },
    {
      id: "exec-004",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
      duration: "2.7s",
      status: "warning",
      mode: "manual",
      nodes: 5,
    },
    {
      id: "exec-005",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 3),
      duration: "1.5s",
      status: "success",
      mode: "scheduled",
      nodes: 5,
    },
  ]

  /**
   * Returns the appropriate icon for the execution status
   *
   * @param status - The execution status (success, error, warning)
   * @returns A React element with the appropriate icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  /**
   * Returns the appropriate icon for the execution mode
   *
   * @param mode - The execution mode (manual, scheduled, webhook)
   * @returns A React element with the appropriate icon
   */
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "manual":
        return <Play className="h-4 w-4 text-blue-500" />
      case "scheduled":
        return <Clock className="h-4 w-4 text-purple-500" />
      case "webhook":
        return <Globe className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  /**
   * Formats a date for display in the UI
   *
   * @param date - The date to format
   * @returns A formatted date string
   */
  const formatDate = (date: Date) => {
    return date.toLocaleString()
  }

  // Filter executions based on the search input
  const filteredExecutions = executions.filter(
    (exec) => exec.id.includes(filter) || exec.status.includes(filter) || exec.mode.includes(filter),
  )

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 w-full max-w-md">
          <Input
            placeholder="Filter executions..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9"
            aria-label="Filter executions"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Filter options">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem checked>Show Successful</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Show Failed</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Show Warnings</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="gap-1.5">
            <Play className="h-4 w-4" />
            Run Now
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExecutions.length > 0 ? (
              filteredExecutions.map((execution) => (
                <TableRow key={execution.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(execution.status)}
                      <span className="ml-2 capitalize">{execution.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{execution.id}</TableCell>
                  <TableCell>{formatDate(execution.startTime)}</TableCell>
                  <TableCell>{execution.duration}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {getModeIcon(execution.mode)}
                      <span className="capitalize">{execution.mode}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No executions found matching your filter
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}

/**
 * Globe icon component.
 *
 * A simple SVG icon for the Globe/Web symbol.
 *
 * @param className - Optional CSS class name for styling
 */
function Globe({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
