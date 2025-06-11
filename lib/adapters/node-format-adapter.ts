import { NodeTemplate } from '@/contexts/node-creator/types';
import { WorkflowNodeDefinition } from '@/contexts/node-creator/shared-nodes-types';

/**
 * Converte um NodeTemplate do formato do Canvas de Criação para o formato do Canvas de Workflow
 */
export function convertToWorkflowFormat(template: NodeTemplate): WorkflowNodeDefinition {
  return {
    id: crypto.randomUUID(),
    type: template.name.toLowerCase().replace(/\s+/g, '-'),
    name: template.name,
    description: template.description,
    category: template.category,
    inputs: template.inputs.map(input => ({
      id: input.id,
      name: input.name,
      type: input.type,
      description: input.description,
    })),
    outputs: template.outputs.map(output => ({
      id: output.id,
      name: output.name,
      type: output.type,
      description: output.description,
    })),
    properties: template.properties.map(prop => ({
      id: prop.id,
      name: prop.name,
      type: prop.type,
      defaultValue: prop.defaultValue,
      required: prop.required,
      options: prop.options,
      description: prop.description,
    })),
    icon: template.icon,
    author: template.author,
    version: template.version,
    isCustom: true,
    templateId: template.id,
  };
}

/**
 * Converte um WorkflowNodeDefinition do formato do Canvas de Workflow para o formato do Canvas de Criação
 */
export function convertToCreatorFormat(node: WorkflowNodeDefinition): NodeTemplate {
  const now = new Date().toISOString();
  
  return {
    id: node.templateId || crypto.randomUUID(),
    name: node.name,
    description: node.description,
    category: node.category,
    inputs: node.inputs.map(input => ({
      id: input.id,
      name: input.name,
      type: input.type,
      description: input.description,
    })),
    outputs: node.outputs.map(output => ({
      id: output.id,
      name: output.name,
      type: output.type,
      description: output.description,
    })),
    properties: node.properties.map(prop => ({
      id: prop.id,
      name: prop.name,
      type: prop.type,
      defaultValue: prop.defaultValue,
      required: prop.required,
      options: prop.options,
      description: prop.description,
    })),
    icon: node.icon,
    author: node.author,
    version: node.version,
    createdAt: now,
    updatedAt: now,
    published: true,
  };
}
