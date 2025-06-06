"use client"

import { useVariables } from "@/context/variable-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Variable } from "@/types/variable"

interface VariableUsageListProps {
  variable: Variable
}

export function VariableUsageList({ variable }: VariableUsageListProps) {
  const { getVariableUsage } = useVariables()
  const usages = getVariableUsage(variable.id)

  return (
    <div>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {usages.map((usage, index) => (
              <TableRow key={index}>
                <TableCell>{usage.nodeId}</TableCell>
                <TableCell>{usage.parameterKey}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
