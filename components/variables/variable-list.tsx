"use client"

import type React from "react"

import { useState } from "react"
import { useVariables } from "@/context/variable-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { VariableDialog } from "./variable-dialog"
import { VariableValueDisplay } from "./variable-value-display"
import { VariableUsageDialog } from "./variable-usage-dialog"
import { MoreHorizontal, Edit, Trash2, Copy, Eye } from "lucide-react"
import type { Variable, VariableScope } from "@/types/variable"

interface VariableListProps {
  variables: Variable[]
  scope: VariableScope
  emptyState: {
    title: string
    description: string
    action: React.ReactNode
  }
}

export function VariableList({ variables, scope, emptyState }: VariableListProps) {
  const { deleteVariable, getVariableUsage } = useVariables()
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null)
  const [viewingVariable, setViewingVariable] = useState<Variable | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [variableToDelete, setVariableToDelete] = useState<Variable | null>(null)

  const handleEdit = (variable: Variable) => {
    setEditingVariable(variable)
  }

  const handleDelete = (variable: Variable) => {
    setVariableToDelete(variable)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (variableToDelete) {
      deleteVariable(variableToDelete.id)
      setDeleteConfirmOpen(false)
      setVariableToDelete(null)
    }
  }

  const handleViewUsage = (variable: Variable) => {
    setViewingVariable(variable)
  }

  if (variables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium mb-2">{emptyState.title}</h3>
        <p className="text-muted-foreground text-center mb-6">{emptyState.description}</p>
        {emptyState.action}
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variables.map((variable) => (
                <TableRow key={variable.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {variable.name}
                      {variable.isSystem && (
                        <Badge variant="secondary" className="text-xs">
                          System
                        </Badge>
                      )}
                      {variable.encrypted && (
                        <Badge variant="outline" className="text-xs">
                          Encrypted
                        </Badge>
                      )}
                    </div>
                    {variable.description && (
                      <p className="text-xs text-muted-foreground mt-1">{variable.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-1 py-0.5 rounded text-sm">{variable.key}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{variable.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <VariableValueDisplay variable={variable} />
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const usageCount = getVariableUsage(variable.id).length
                      if (usageCount === 0) return <span className="text-muted-foreground">Not used</span>
                      return (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => handleViewUsage(variable)}
                        >
                          {usageCount} {usageCount === 1 ? "place" : "places"}
                        </Button>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(variable)} disabled={variable.isSystem}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewUsage(variable)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Usage
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(`{{variables.${variable.key}}}`)
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Reference
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(variable)}
                          className="text-red-600"
                          disabled={variable.isSystem}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Variable Dialog */}
      {editingVariable && (
        <VariableDialog
          open={!!editingVariable}
          onOpenChange={(open) => !open && setEditingVariable(null)}
          variable={editingVariable}
        />
      )}

      {/* View Usage Dialog */}
      {viewingVariable && (
        <VariableUsageDialog
          open={!!viewingVariable}
          onOpenChange={(open) => !open && setViewingVariable(null)}
          variable={viewingVariable}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the variable "{variableToDelete?.name}".
              {getVariableUsage(variableToDelete?.id || "").length > 0 && (
                <span className="block mt-2 font-medium text-red-500">
                  Warning: This variable is currently in use. Deleting it may cause errors in your workflow.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
