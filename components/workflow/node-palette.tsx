/**
 * Paleta de Nodes - Componente para seleção e adição de nodes ao workflow
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Star, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { apiService, Node as ApiNode } from '@/lib/api/service';
import { useToast } from '@/hooks/use-toast';

interface NodePaletteProps {
  onAddNode: (node: ApiNode) => void;
}

// Categorias de nodes predefinidas
const NODE_CATEGORIES = [
  { id: 'all', name: 'Todos', icon: '📁' },
  { id: 'llm', name: 'LLM', icon: '🤖' },
  { id: 'transform', name: 'Transformação', icon: '🔄' },
  { id: 'api', name: 'API', icon: '🌐' },
  { id: 'condition', name: 'Condição', icon: '❓' },
  { id: 'trigger', name: 'Trigger', icon: '⚡' },
  { id: 'operation', name: 'Operação', icon: '⚙️' },
  { id: 'flow', name: 'Fluxo', icon: '🔀' },
  { id: 'input', name: 'Entrada', icon: '📥' },
  { id: 'output', name: 'Saída', icon: '📤' },
  { id: 'file_processor', name: 'Arquivos', icon: '📄' }
];

// Templates de nodes padrão
const DEFAULT_NODE_TEMPLATES: Partial<ApiNode>[] = [
  {
    id: 'template-llm-chat',
    name: 'Chat LLM',
    description: 'Conversa com modelo de linguagem',
    type: 'llm',
    category: 'llm',
    icon: '🤖',
    color: '#10b981',
    input_schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Mensagem para o LLM' },
        model: { type: 'string', description: 'Modelo a usar' }
      }
    },
    output_schema: {
      type: 'object',
      properties: {
        response: { type: 'string', description: 'Resposta do LLM' },
        tokens_used: { type: 'number', description: 'Tokens utilizados' }
      }
    },
    downloads_count: 1250,
    rating_average: 4.8,
    rating_count: 89
  },
  {
    id: 'template-text-transform',
    name: 'Transformar Texto',
    description: 'Aplica transformações em texto',
    type: 'transform',
    category: 'transform',
    icon: '🔄',
    color: '#3b82f6',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Texto a transformar' },
        operation: { type: 'string', description: 'Tipo de transformação' }
      }
    },
    output_schema: {
      type: 'object',
      properties: {
        transformed_text: { type: 'string', description: 'Texto transformado' }
      }
    },
    downloads_count: 890,
    rating_average: 4.5,
    rating_count: 67
  },
  {
    id: 'template-api-call',
    name: 'Chamada API',
    description: 'Faz requisições HTTP para APIs',
    type: 'api',
    category: 'api',
    icon: '🌐',
    color: '#f59e0b',
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL da API' },
        method: { type: 'string', description: 'Método HTTP' },
        headers: { type: 'object', description: 'Headers da requisição' },
        body: { type: 'object', description: 'Corpo da requisição' }
      }
    },
    output_schema: {
      type: 'object',
      properties: {
        response: { type: 'object', description: 'Resposta da API' },
        status_code: { type: 'number', description: 'Código de status' }
      }
    },
    downloads_count: 2100,
    rating_average: 4.7,
    rating_count: 156
  },
  {
    id: 'template-condition',
    name: 'Condição',
    description: 'Avalia condições e direciona fluxo',
    type: 'condition',
    category: 'condition',
    icon: '❓',
    color: '#8b5cf6',
    input_schema: {
      type: 'object',
      properties: {
        value: { type: 'any', description: 'Valor a avaliar' },
        condition: { type: 'string', description: 'Condição a verificar' }
      }
    },
    output_schema: {
      type: 'object',
      properties: {
        result: { type: 'boolean', description: 'Resultado da condição' },
        true_path: { type: 'any', description: 'Saída se verdadeiro' },
        false_path: { type: 'any', description: 'Saída se falso' }
      }
    },
    downloads_count: 1450,
    rating_average: 4.6,
    rating_count: 98
  },
  {
    id: 'template-file-reader',
    name: 'Ler Arquivo',
    description: 'Lê conteúdo de arquivos',
    type: 'file_processor',
    category: 'file_processor',
    icon: '📄',
    color: '#ef4444',
    input_schema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Caminho do arquivo' },
        encoding: { type: 'string', description: 'Codificação do arquivo' }
      }
    },
    output_schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Conteúdo do arquivo' },
        metadata: { type: 'object', description: 'Metadados do arquivo' }
      }
    },
    downloads_count: 780,
    rating_average: 4.3,
    rating_count: 45
  },
  {
    id: 'template-input',
    name: 'Entrada',
    description: 'Ponto de entrada do workflow',
    type: 'input',
    category: 'input',
    icon: '📥',
    color: '#06b6d4',
    input_schema: {
      type: 'object',
      properties: {}
    },
    output_schema: {
      type: 'object',
      properties: {
        data: { type: 'any', description: 'Dados de entrada' }
      }
    },
    downloads_count: 3200,
    rating_average: 4.9,
    rating_count: 234
  },
  {
    id: 'template-output',
    name: 'Saída',
    description: 'Ponto de saída do workflow',
    type: 'output',
    category: 'output',
    icon: '📤',
    color: '#84cc16',
    input_schema: {
      type: 'object',
      properties: {
        data: { type: 'any', description: 'Dados a retornar' }
      }
    },
    output_schema: {
      type: 'object',
      properties: {}
    },
    downloads_count: 2890,
    rating_average: 4.8,
    rating_count: 201
  }
];

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const [nodes, setNodes] = useState<ApiNode[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<ApiNode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('public');

  const { toast } = useToast();

  // Carregar nodes do backend
  useEffect(() => {
    loadNodes();
  }, []);

  // Filtrar nodes quando critérios mudam
  useEffect(() => {
    filterNodes();
  }, [nodes, searchTerm, selectedCategory, sortBy]);

  const loadNodes = async () => {
    setLoading(true);
    try {
      const response = await apiService.getNodes({
        page: 1,
        size: 100,
        is_public: activeTab === 'public'
      });
      
      // Combinar nodes do backend com templates padrão
      const allNodes = activeTab === 'public' 
        ? [...DEFAULT_NODE_TEMPLATES as ApiNode[], ...response.items]
        : response.items;
      
      setNodes(allNodes);
    } catch (error) {
      console.error('Erro ao carregar nodes:', error);
      // Usar apenas templates padrão em caso de erro
      setNodes(DEFAULT_NODE_TEMPLATES as ApiNode[]);
    } finally {
      setLoading(false);
    }
  };

  const filterNodes = () => {
    let filtered = nodes;

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(node => node.category === selectedCategory);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(node =>
        node.name.toLowerCase().includes(term) ||
        node.description?.toLowerCase().includes(term) ||
        node.type.toLowerCase().includes(term)
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'downloads':
          return (b.downloads_count || 0) - (a.downloads_count || 0);
        case 'rating':
          return (b.rating_average || 0) - (a.rating_average || 0);
        case 'recent':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredNodes(filtered);
  };

  const handleAddNode = (node: ApiNode) => {
    onAddNode(node);
    toast({
      title: 'Node adicionado',
      description: `${node.name} foi adicionado ao workflow`
    });
  };

  const handleDownloadNode = async (node: ApiNode) => {
    try {
      // Incrementar contador de downloads
      // await apiService.downloadNode(node.id);
      toast({
        title: 'Download iniciado',
        description: `${node.name} está sendo baixado`
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao baixar node',
        variant: 'destructive'
      });
    }
  };

  const NodeCard = ({ node }: { node: ApiNode }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{node.icon}</span>
            <div>
              <CardTitle className="text-sm">{node.name}</CardTitle>
              <p className="text-xs text-gray-500">{node.type}</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadNode(node);
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Baixar node</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAddNode(node)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {node.description}
        </p>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" style={{ backgroundColor: node.color + '20', color: node.color }}>
              {node.category}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            {node.rating_average && (
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{node.rating_average.toFixed(1)}</span>
              </div>
            )}
            {node.downloads_count && (
              <div className="flex items-center">
                <Download className="h-3 w-3 mr-1" />
                <span>{node.downloads_count}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Controles de filtro */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {NODE_CATEGORIES.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="downloads">Downloads</SelectItem>
              <SelectItem value="rating">Avaliação</SelectItem>
              <SelectItem value="recent">Recentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Tabs para nodes públicos/privados */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
          <TabsTrigger value="public">Públicos</TabsTrigger>
          <TabsTrigger value="private">Meus Nodes</TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="flex-1 mt-2">
          <ScrollArea className="h-full px-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Carregando nodes...
              </div>
            ) : filteredNodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum node encontrado</p>
                <p className="text-xs">Tente ajustar os filtros</p>
              </div>
            ) : (
              <div className="pb-4">
                {filteredNodes.map(node => (
                  <NodeCard key={node.id} node={node} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="private" className="flex-1 mt-2">
          <ScrollArea className="h-full px-4">
            <div className="text-center py-8 text-gray-500">
              <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Seus nodes personalizados</p>
              <p className="text-xs">Crie nodes customizados para reutilizar</p>
              <Button variant="outline" size="sm" className="mt-2">
                Criar Node
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Estatísticas */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Total de nodes:</span>
            <span className="font-medium">{nodes.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Filtrados:</span>
            <span className="font-medium">{filteredNodes.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Categoria:</span>
            <span className="font-medium">
              {NODE_CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

