/**
 * Canvas Page Component
 *
 * This page displays the main workflow editor canvas where users can
 * create and edit their workflow diagrams.
 *
 * @returns {JSX.Element} The workflow editor component
 */
"use client"

import { WorkflowEditor } from "@/components/workflow-editor"

export default function CanvasPage() {
  return (
    <div className="h-full w-full">
      {/* The WorkflowEditor component handles all canvas functionality */}
      <WorkflowEditor />
    </div>
  )
}
