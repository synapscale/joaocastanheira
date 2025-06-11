"use client"

import { useVariables } from "@/context/variable-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Variable } from "@/types/variable"

interface VariableUsageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variable: Variable
}

export function VariableUsageDialog({ open, onOpenChange, variable }: VariableUsageDialogProps) {
  const { getVariableUsage } = useVariables()
  const usages = getVariableUsage(variable.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Variable Usage</DialogTitle>
          <DialogDescription>Locations where the variable "{variable.name}" is being used</DialogDescription>
        </DialogHeader>

        {usages.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">This variable is not currently used in any node</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Node</TableHead>
                <TableHead>Parameter</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usages.map((usage, index) => (
                <TableRow key={index}>
                  <TableCell>{usage.nodeId}</TableCell>
                  <TableCell>{usage.parameterKey}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Reference</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  )
}
