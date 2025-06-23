/**
 * Tipos para o SharedNodes que conecta o Canvas de Criação com o Canvas de Workflow
 */

import { NodeTemplate } from './types';

export interface WorkflowNodeDefinition {
  id: string;
  type: string;
  name: string;
  description: string;
  category: string;
  inputs: {
    id: string;
    name: string;
    type: string;
    description?: string;
  }[];
  outputs: {
    id: string;
    name: string;
    type: string;
    description?: string;
  }[];
  properties: {
    id: string;
    name: string;
    type: string;
    defaultValue?: any;
    required?: boolean;
    options?: any[];
    description?: string;
  }[];
  icon?: string;
  author?: string;
  version?: string;
  isCustom: boolean;
  templateId?: string;
}

export interface SharedNodesState {
  sharedNodes: WorkflowNodeDefinition[];
  isLoading: boolean;
  error: string | null;
}

export type SharedNodesAction =
  | { type: 'SET_SHARED_NODES'; payload: WorkflowNodeDefinition[] }
  | { type: 'ADD_SHARED_NODE'; payload: WorkflowNodeDefinition }
  | { type: 'UPDATE_SHARED_NODE'; payload: WorkflowNodeDefinition }
  | { type: 'DELETE_SHARED_NODE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
