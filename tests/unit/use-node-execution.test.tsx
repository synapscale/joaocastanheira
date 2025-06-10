import { renderHook, act } from '@testing-library/react'
import { useNodeExecution } from '@/hooks/use-node-execution'

// Mock variable context
jest.mock('@/context/variable-context', () => ({
  useVariables: () => ({
    variables: [],
    resolveVariableValue: jest.fn(),
    trackVariableUsage: jest.fn(),
  }),
}))

describe('useNodeExecution', () => {
  it('skips execution when node is disabled', async () => {
    const node = {
      id: 'node-1',
      type: 'code',
      name: 'Test',
      position: { x: 0, y: 0 },
      inputs: [],
      outputs: [],
      disabled: true,
    }

    const { result } = renderHook(() => useNodeExecution({ node }))

    await act(async () => {
      await result.current.executeNode('console.log("hi")')
    })

    expect(result.current.executionStatus).toBe('warning')
    expect(result.current.consoleOutput).toContain('Node disabled: execution skipped')
  })
})
