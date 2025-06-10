"use client";

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NodeQuickActions } from '@/components/node-quick-actions';

// Mock useWorkflow hook
const mockExecuteNode = jest.fn();
let nodeDisabled = false;
const mockToggleNodeDisabled = jest.fn(() => {
  nodeDisabled = !nodeDisabled;
});
const mockRemoveNode = jest.fn();
const mockDuplicateNode = jest.fn();

jest.mock('@/context/workflow-context', () => ({
  useWorkflow: () => ({
    removeNode: mockRemoveNode,
    duplicateNode: mockDuplicateNode,
    executeNode: mockExecuteNode,
    toggleNodeDisabled: mockToggleNodeDisabled,
  }),
}));

describe('NodeQuickActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nodeDisabled = false;
  });

  it('calls executeNode with the node id when execute is clicked', () => {
    render(
      <NodeQuickActions onEditClick={() => {}} nodeWidth={70} nodeId="node-1" />
    );

    const executeButton = screen.getByRole('button', { name: /execute node/i });
    fireEvent.click(executeButton);

    expect(mockExecuteNode).toHaveBeenCalledWith('node-1');
  });

  it('toggles node disabled state when toggle is clicked', () => {
    render(
      <NodeQuickActions onEditClick={() => {}} nodeWidth={70} nodeId="node-1" />
    );

    const toggleButton = screen.getByRole('button', { name: /toggle active state/i });
    expect(nodeDisabled).toBe(false);
    fireEvent.click(toggleButton);
    expect(mockToggleNodeDisabled).toHaveBeenCalledWith('node-1');
    expect(nodeDisabled).toBe(true);
  });
});
