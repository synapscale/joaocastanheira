import React from 'react'
jest.unmock('@testing-library/react')
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkflowProvider } from '@/context/workflow-context'
import { NodeQuickActions } from '@/components/node-quick-actions'

const disabledNode = {
  id: 'node-1',
  type: 'action',
  name: 'Test',
  position: { x: 0, y: 0 },
  inputs: [],
  outputs: [],
  disabled: true,
}

describe('NodeQuickActions', () => {
  it('does not execute disabled node', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    render(
      <WorkflowProvider initialNodes={[disabledNode]}>
        <NodeQuickActions nodeId="node-1" nodeWidth={70} onEditClick={() => {}} />
      </WorkflowProvider>
    )

    const executeButton = screen.getByRole('button', { name: 'Execute node' })
    fireEvent.click(executeButton)

    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
