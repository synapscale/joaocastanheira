import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { NodeQuickActions } from '@/components/node-quick-actions'
import { WorkflowProvider, useWorkflow } from '@/context/workflow-context'

interface WrapperProps { children: React.ReactNode }

function setupNode(node) {
  const Setup: React.FC<WrapperProps> = ({ children }) => {
    const { addNode } = useWorkflow()
    React.useEffect(() => {
      addNode(node)
    }, [])
    return <>{children}</>
  }

  return ({ children }: WrapperProps) => (
    <WorkflowProvider>
      <Setup>{children}</Setup>
    </WorkflowProvider>
  )
}

describe('NodeQuickActions', () => {
  it('does not execute a disabled node', () => {
    const node = {
      id: 'node-1',
      type: 'code',
      name: 'Test',
      position: { x: 0, y: 0 },
      inputs: [],
      outputs: [],
      disabled: true,
    }
    const wrapper = setupNode(node)
    window.alert = jest.fn()

    const { getByTitle } = render(
      <NodeQuickActions onEditClick={() => {}} nodeWidth={70} nodeId="node-1" />, { wrapper },
    )

    fireEvent.click(getByTitle('Execute node'))
    expect(window.alert).not.toHaveBeenCalled()
  })
})
