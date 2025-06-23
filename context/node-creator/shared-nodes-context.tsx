"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { NodeTemplate } from './types';
import { SharedNodesState, SharedNodesAction, WorkflowNodeDefinition } from './shared-nodes-types';
import { convertToWorkflowFormat } from '@/lib/adapters/node-format-adapter';

// Estado inicial
const initialState: SharedNodesState = {
  sharedNodes: [],
  isLoading: false,
  error: null,
};

// Reducer
function sharedNodesReducer(state = initialState, action: SharedNodesAction): SharedNodesState {
  switch (action.type) {
    case 'SET_SHARED_NODES':
      return { ...state, sharedNodes: action.payload };
    case 'ADD_SHARED_NODE':
      return { ...state, sharedNodes: [...state.sharedNodes, action.payload] };
    case 'UPDATE_SHARED_NODE':
      return {
        ...state,
        sharedNodes: state.sharedNodes.map(node =>
          node.id === action.payload.id ? action.payload : node
        ),
      };
    case 'DELETE_SHARED_NODE':
      return {
        ...state,
        sharedNodes: state.sharedNodes.filter(node => node.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Tipos para o contexto
interface SharedNodesContextType {
  state: SharedNodesState;
  dispatch: React.Dispatch<SharedNodesAction>;
  addNodeToWorkflow: (template: NodeTemplate) => void;
  updateNodeInWorkflow: (node: WorkflowNodeDefinition) => void;
  deleteNodeFromWorkflow: (id: string) => void;
  syncNodesWithWorkflow: () => void;
}

// Contexto
export const SharedNodesContext = createContext<SharedNodesContextType | undefined>(undefined);

// Provider
export function SharedNodesProvider({ children }: { children: React.ReactNode }) {
  const [persistedNodes, setPersistedNodes] = useLocalStorage<WorkflowNodeDefinition[]>(
    'shared-workflow-nodes',
    []
  );
  
  const [state, dispatch] = useReducer(sharedNodesReducer, {
    ...initialState,
    sharedNodes: persistedNodes,
  });

  // Sincronizar com localStorage
  useEffect(() => {
    setPersistedNodes(state.sharedNodes);
  }, [state.sharedNodes, setPersistedNodes]);

  // Ações
  const addNodeToWorkflow = (template: NodeTemplate) => {
    // Converter do formato do NodeCreator para o formato do Workflow
    const workflowNode = convertToWorkflowFormat(template);
    
    // Verificar se já existe um node com o mesmo templateId
    const existingNode = state.sharedNodes.find(
      node => node.isCustom && node.templateId === template.id
    );
    
    if (existingNode) {
      // Atualizar o node existente
      dispatch({
        type: 'UPDATE_SHARED_NODE',
        payload: { ...workflowNode, id: existingNode.id },
      });
    } else {
      // Adicionar novo node
      dispatch({ type: 'ADD_SHARED_NODE', payload: workflowNode });
    }
  };

  const updateNodeInWorkflow = (node: WorkflowNodeDefinition) => {
    dispatch({ type: 'UPDATE_SHARED_NODE', payload: node });
  };

  const deleteNodeFromWorkflow = (id: string) => {
    dispatch({ type: 'DELETE_SHARED_NODE', payload: id });
  };

  const syncNodesWithWorkflow = () => {
    // Implementação futura: sincronizar com API ou outro mecanismo
    console.log('Syncing nodes with workflow...');
  };

  return (
    <SharedNodesContext.Provider
      value={{
        state,
        dispatch,
        addNodeToWorkflow,
        updateNodeInWorkflow,
        deleteNodeFromWorkflow,
        syncNodesWithWorkflow,
      }}
    >
      {children}
    </SharedNodesContext.Provider>
  );
}

// Hook para usar o contexto
export function useSharedNodes() {
  const context = useContext(SharedNodesContext);
  
  if (!context) {
    throw new Error('useSharedNodes must be used within a SharedNodesProvider');
  }
  
  return context;
}
