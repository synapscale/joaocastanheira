import React from 'react'
import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WorkflowProvider, useWorkflow } from '@/context/workflow-context'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorkflowProvider>{children}</WorkflowProvider>
)

describe('WorkflowContext', () => {
  it('toggleNodeDisabled updates node disabled state', () => {
    const { result } = renderHook(() => useWorkflow(), { wrapper })

    act(() => {
      result.current.addNode({
        id: 'node-1',
        type: 'action',
        name: 'Test',
        position: { x: 0, y: 0 },
        inputs: [],
        outputs: [],
      })
    })

    act(() => {
      result.current.toggleNodeDisabled('node-1')
    })

    const node = result.current.nodes.find((n) => n.id === 'node-1')
    expect(node?.disabled).toBe(true)
  })

  it('executeNode can be called without error', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const { result } = renderHook(() => useWorkflow(), { wrapper })

    act(() => {
      result.current.addNode({
        id: 'node-2',
        type: 'action',
        name: 'Test',
        position: { x: 0, y: 0 },
        inputs: [],
        outputs: [],
      })
    })

    act(() => {
      result.current.executeNode('node-2')
    })

    expect(consoleSpy).toHaveBeenCalledWith('Execute node node-2')
    consoleSpy.mockRestore()
  })
})
