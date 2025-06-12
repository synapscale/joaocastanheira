/**
 * Tipos para o Canvas de Criação de Nodes
 */

export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs: NodePort[];
  outputs: NodePort[];
  properties: NodeProperty[];
  icon?: string;
  author?: string;
  version?: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface NodePort {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface NodeProperty {
  id: string;
  name: string;
  type: string;
  defaultValue?: any;
  required?: boolean;
  options?: any[];
  description?: string;
}

export interface NodeCreatorState {
  nodeTemplates: NodeTemplate[];
  selectedNodeTemplate: NodeTemplate | null;
  isLoading: boolean;
  error: string | null;
}

export type NodeCreatorAction =
  | { type: 'SET_NODE_TEMPLATES'; payload: NodeTemplate[] }
  | { type: 'ADD_NODE_TEMPLATE'; payload: NodeTemplate }
  | { type: 'UPDATE_NODE_TEMPLATE'; payload: NodeTemplate }
  | { type: 'DELETE_NODE_TEMPLATE'; payload: string }
  | { type: 'SELECT_NODE_TEMPLATE'; payload: NodeTemplate | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
