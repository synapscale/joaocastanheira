"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { NodeCreatorState, NodeCreatorAction, NodeTemplate, NodePort, NodeProperty } from './types';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Estado inicial
const initialState: NodeCreatorState = {
  nodeTemplates: [],
  selectedNodeTemplate: null,
  isLoading: false,
  error: null,
};

// Reducer
function nodeCreatorReducer(state = initialState, action: NodeCreatorAction): NodeCreatorState {
  switch (action.type) {
    case 'SET_NODE_TEMPLATES':
      return { ...state, nodeTemplates: action.payload };
    case 'ADD_NODE_TEMPLATE':
      return { ...state, nodeTemplates: [...state.nodeTemplates, action.payload] };
    case 'UPDATE_NODE_TEMPLATE':
      return {
        ...state,
        nodeTemplates: state.nodeTemplates.map(template =>
          template.id === action.payload.id ? action.payload : template
        ),
      };
    case 'DELETE_NODE_TEMPLATE':
      return {
        ...state,
        nodeTemplates: state.nodeTemplates.filter(template => template.id !== action.payload),
      };
    case 'SELECT_NODE_TEMPLATE':
      return { ...state, selectedNodeTemplate: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Tipos para o contexto
interface NodeCreatorContextType {
  state: NodeCreatorState;
  dispatch: React.Dispatch<NodeCreatorAction>;
  addNodeTemplate: (template: Omit<NodeTemplate, 'id' | 'createdAt' | 'updatedAt' | 'published'>) => void;
  updateNodeTemplate: (template: NodeTemplate) => void;
  deleteNodeTemplate: (id: string) => void;
  selectNodeTemplate: (template: NodeTemplate | null) => void;
  publishNodeTemplate: (id: string) => void;
}

// Contexto
export const NodeCreatorContext = createContext<NodeCreatorContextType | undefined>(undefined);

// Provider
export function NodeCreatorProvider({ children }: { children: React.ReactNode }) {
  const [persistedTemplates, setPersistedTemplates] = useLocalStorage<NodeTemplate[]>(
    'node-creator-templates',
    []
  );
  
  const [state, dispatch] = useReducer(nodeCreatorReducer, {
    ...initialState,
    nodeTemplates: persistedTemplates,
  });

  // Sincronizar com localStorage
  useEffect(() => {
    setPersistedTemplates(state.nodeTemplates);
  }, [state.nodeTemplates, setPersistedTemplates]);

  // Ações
  const addNodeTemplate = (template: Omit<NodeTemplate, 'id' | 'createdAt' | 'updatedAt' | 'published'>) => {
    const now = new Date().toISOString();
    const newTemplate: NodeTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      published: false,
    };
    
    dispatch({ type: 'ADD_NODE_TEMPLATE', payload: newTemplate });
  };

  const updateNodeTemplate = (template: NodeTemplate) => {
    const updatedTemplate = {
      ...template,
      updatedAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'UPDATE_NODE_TEMPLATE', payload: updatedTemplate });
  };

  const deleteNodeTemplate = (id: string) => {
    dispatch({ type: 'DELETE_NODE_TEMPLATE', payload: id });
  };

  const selectNodeTemplate = (template: NodeTemplate | null) => {
    dispatch({ type: 'SELECT_NODE_TEMPLATE', payload: template });
  };

  const publishNodeTemplate = (id: string) => {
    const template = state.nodeTemplates.find(t => t.id === id);
    if (template) {
      const publishedTemplate = {
        ...template,
        published: true,
        updatedAt: new Date().toISOString(),
      };
      
      dispatch({ type: 'UPDATE_NODE_TEMPLATE', payload: publishedTemplate });
    }
  };

  return (
    <NodeCreatorContext.Provider
      value={{
        state,
        dispatch,
        addNodeTemplate,
        updateNodeTemplate,
        deleteNodeTemplate,
        selectNodeTemplate,
        publishNodeTemplate,
      }}
    >
      {children}
    </NodeCreatorContext.Provider>
  );
}

// Hook para usar o contexto
export function useNodeCreator() {
  const context = useContext(NodeCreatorContext);
  
  if (!context) {
    throw new Error('useNodeCreator must be used within a NodeCreatorProvider');
  }
  
  return context;
}
