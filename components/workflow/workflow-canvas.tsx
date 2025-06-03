/**
 * Canvas de Workflow - Componente principal para criação e edição de workflows
 */
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Connection,
  EdgeChange,
  NodeChange,
  ReactFlowProvider,
  ReactFlowInstance,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Trash2, 
  Copy, 
  Undo, 
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Eye,
  EyeOff
} from 'lucide-react';

import { NodePalette } from './node-palette';
import { NodeConfigurator } from './node-configurator';
import { WorkflowSettings } from './workflow-settings';
import { ExecutionPanel } from './execution-panel';
import { apiService, Workflow, Node as ApiNode } from '@/lib/api/service';
import { useToast } from '@/hooks/use-toast';

// Tipos personalizados para o workflow
interface WorkflowNode extends Node {
  data: {
    label: string;
    type: string;
    icon: string;
    color: string;
    configuration: any;
    inputs: any[];
    outputs: any[];
    nodeId: string;
  };
}

interface WorkflowEdge extends Edge {
  data?: {
    sourcePort?: string;
    targetPort?: string;
  };
}

interface WorkflowCanvasProps {
  workflowId?: string;
  initialWorkflow?: Workflow;
  onSave?: (workflow: Workflow) => void;
  onExecute?: (workflowId: string) => void;
  readOnly?: boolean;
}

export function WorkflowCanvas({
  workflowId,
  initialWorkflow,
  onSave,
  onExecute,
  readOnly = false
}: WorkflowCanvasProps) {
  // Estados do React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Estados do componente
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [workflowData, setWorkflowData] = useState<Partial<Workflow>>({
    name: 'Novo Workflow',
    description: '',
    category: '',
    tags: [],
    is_public: false,
    definition: { nodes: [], connections: [] }
  });

  // Estados da UI
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [activeTab, setActiveTab] = useState('design');
  const [sidebarWidth, setSidebarWidth] = useState(320);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Carregar workflow inicial
  useEffect(() => {
    if (initialWorkflow) {
      setWorkflowData(initialWorkflow);
      loadWorkflowDefinition(initialWorkflow.definition);
    } else if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId, initialWorkflow]);

  // Carregar workflow do backend
  const loadWorkflow = async (id: string) => {
    try {
      const workflow = await apiService.getWorkflow(id);
      setWorkflowData(workflow);
      loadWorkflowDefinition(workflow.definition);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar workflow',
        variant: 'destructive'
      });
    }
  };

  // Carregar definição do workflow no canvas
  const loadWorkflowDefinition = (definition: any) => {
    if (definition?.nodes) {
      const flowNodes: WorkflowNode[] = definition.nodes.map((node: any) => ({
        id: node.id,
        type: 'custom',
        position: { x: node.position?.x || 0, y: node.position?.y || 0 },
        data: {
          label: node.name || node.label,
          type: node.type,
          icon: node.icon || '🔧',
          color: node.color || '#6366f1',
          configuration: node.configuration || {},
          inputs: node.inputs || [],
          outputs: node.outputs || [],
          nodeId: node.nodeId || node.id
        }
      }));
      setNodes(flowNodes);
    }

    if (definition?.connections) {
      const flowEdges: WorkflowEdge[] = definition.connections.map((conn: any) => ({
        id: conn.id || `${conn.source}-${conn.target}`,
        source: conn.source,
        target: conn.target,
        sourceHandle: conn.sourceHandle,
        targetHandle: conn.targetHandle,
        data: {
          sourcePort: conn.sourcePort,
          targetPort: conn.targetPort
        }
      }));
      setEdges(flowEdges);
    }
  };

  // Salvar workflow
  const handleSave = async () => {
    try {
      const definition = {
        nodes: nodes.map(node => ({
          id: node.id,
          name: node.data.label,
          type: node.data.type,
          position: node.position,
          icon: node.data.icon,
          color: node.data.color,
          configuration: node.data.configuration,
          inputs: node.data.inputs,
          outputs: node.data.outputs,
          nodeId: node.data.nodeId
        })),
        connections: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          sourcePort: edge.data?.sourcePort,
          targetPort: edge.data?.targetPort
        }))
      };

      const workflowToSave = {
        ...workflowData,
        definition
      };

      let savedWorkflow: Workflow;
      if (workflowId) {
        savedWorkflow = await apiService.updateWorkflow(workflowId, workflowToSave);
      } else {
        savedWorkflow = await apiService.createWorkflow(workflowToSave as any);
      }

      setWorkflowData(savedWorkflow);
      onSave?.(savedWorkflow);

      toast({
        title: 'Sucesso',
        description: 'Workflow salvo com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar workflow',
        variant: 'destructive'
      });
    }
  };

  // Executar workflow
  const handleExecute = async () => {
    if (!workflowId && !workflowData.id) {
      toast({
        title: 'Aviso',
        description: 'Salve o workflow antes de executar',
        variant: 'destructive'
      });
      return;
    }

    setIsExecuting(true);
    try {
      const id = workflowId || workflowData.id!;
      const result = await apiService.executeWorkflow(id);
      setExecutionResults(result);
      onExecute?.(id);

      toast({
        title: 'Sucesso',
        description: 'Workflow executado com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao executar workflow',
        variant: 'destructive'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Adicionar node ao canvas
  const handleAddNode = useCallback((nodeTemplate: ApiNode) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: nodeTemplate.name,
        type: nodeTemplate.type,
        icon: nodeTemplate.icon,
        color: nodeTemplate.color,
        configuration: {},
        inputs: nodeTemplate.input_schema?.properties ? Object.keys(nodeTemplate.input_schema.properties) : [],
        outputs: nodeTemplate.output_schema?.properties ? Object.keys(nodeTemplate.output_schema.properties) : [],
        nodeId: nodeTemplate.id
      }
    };

    setNodes(nds => [...nds, newNode]);
  }, [setNodes]);

  // Conectar nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  // Selecionar node
  const onNodeClick = useCallback((event: React.MouseEvent, node: WorkflowNode) => {
    setSelectedNode(node);
  }, []);

  // Atualizar configuração do node
  const handleNodeConfigUpdate = useCallback((nodeId: string, configuration: any) => {
    setNodes(nds => 
      nds.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, configuration } }
          : node
      )
    );
  }, [setNodes]);

  // Deletar node selecionado
  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes(nds => nds.filter(node => node.id !== selectedNode.id));
      setEdges(eds => eds.filter(edge => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  // Duplicar node selecionado
  const handleDuplicateNode = useCallback(() => {
    if (selectedNode) {
      const newNode: WorkflowNode = {
        ...selectedNode,
        id: `node-${Date.now()}`,
        position: {
          x: selectedNode.position.x + 50,
          y: selectedNode.position.y + 50
        }
      };
      setNodes(nds => [...nds, newNode]);
    }
  }, [selectedNode, setNodes]);

  // Controles de zoom
  const handleZoomIn = () => reactFlowInstance?.zoomIn();
  const handleZoomOut = () => reactFlowInstance?.zoomOut();
  const handleFitView = () => reactFlowInstance?.fitView();

  // Exportar workflow
  const handleExport = () => {
    const definition = {
      nodes: nodes.map(node => ({
        id: node.id,
        name: node.data.label,
        type: node.data.type,
        position: node.position,
        configuration: node.data.configuration
      })),
      connections: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      }))
    };

    const dataStr = JSON.stringify({ ...workflowData, definition }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowData.name || 'workflow'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Componente customizado para nodes
  const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <div className="flex items-center">
        <span className="text-lg mr-2">{data.icon}</span>
        <div>
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">{data.type}</div>
        </div>
      </div>
    </div>
  );

  const nodeTypes = {
    custom: CustomNode
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar esquerda - Paleta de nodes */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Paleta de Nodes</h2>
        </div>
        <ScrollArea className="flex-1">
          <NodePalette onAddNode={handleAddNode} />
        </ScrollArea>
      </div>

      {/* Canvas principal */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar superior */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Input
              value={workflowData.name || ''}
              onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
              className="w-64"
              placeholder="Nome do workflow"
              disabled={readOnly}
            />
            <Badge variant="outline">{nodes.length} nodes</Badge>
            <Badge variant="outline">{edges.length} conexões</Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMiniMap(!showMiniMap)}
            >
              {showMiniMap ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleFitView}>
              <Maximize className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={readOnly}>
              <Save className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              onClick={handleExecute} 
              disabled={isExecuting || readOnly}
            >
              <Play className="h-4 w-4 mr-2" />
              {isExecuting ? 'Executando...' : 'Executar'}
            </Button>
          </div>
        </div>

        {/* Canvas do React Flow */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            {showMiniMap && (
              <MiniMap
                nodeColor={(node) => node.data.color || '#6366f1'}
                nodeStrokeWidth={3}
                zoomable
                pannable
              />
            )}
            {showGrid && (
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={20} 
                size={1} 
              />
            )}
            
            {/* Panel de controles personalizados */}
            <Panel position="top-left">
              <Card className="w-64">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Controles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedNode && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">
                        Node selecionado: {selectedNode.data.label}
                      </p>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={handleDuplicateNode}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleDeleteNode}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Sidebar direita - Configurações */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="execution">Execução</TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="flex-1 p-4">
            <WorkflowSettings
              workflow={workflowData}
              onChange={setWorkflowData}
              readOnly={readOnly}
            />
          </TabsContent>

          <TabsContent value="config" className="flex-1 p-4">
            {selectedNode ? (
              <NodeConfigurator
                node={selectedNode}
                onConfigUpdate={handleNodeConfigUpdate}
                readOnly={readOnly}
              />
            ) : (
              <div className="text-center text-gray-500 mt-8">
                Selecione um node para configurar
              </div>
            )}
          </TabsContent>

          <TabsContent value="execution" className="flex-1 p-4">
            <ExecutionPanel
              workflowId={workflowId || workflowData.id}
              executionResults={executionResults}
              isExecuting={isExecuting}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Wrapper com ReactFlowProvider
export function WorkflowCanvasWrapper(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas {...props} />
    </ReactFlowProvider>
  );
}

