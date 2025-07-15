"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Edit, 
  Link, 
  Files, 
  FileQuestion,
  AlertCircle,
  ExternalLink,
  MoreHorizontal,
  Loader2,
  Upload,
  RefreshCw,
  Filter,
  X,
  ChevronDown,
  Database,
  Globe,
  ArrowUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types
interface KnowledgeSource {
  id: string;
  name: string;
  type: "document" | "website" | "api" | "database" | "custom";
  description: string;
  url?: string;
  dateAdded: string;
  status: "active" | "processing" | "error" | "inactive";
  size?: string;
  lastSync?: string;
}

// Empty State Component
function EmptyState({
  onAddSource
}: {
  onAddSource: () => void;
}) {
  return (
    <div className="bg-background border-border hover:border-border/80 text-center
      border-2 border-dashed rounded-xl p-14 w-full max-w-[620px] mx-auto mt-8
      group hover:bg-muted/50 transition duration-500 hover:duration-200">
      <div className="flex justify-center isolate">
        <div className="bg-background size-12 grid place-items-center rounded-xl relative left-2.5 top-1.5 -rotate-6 shadow-lg ring-1 ring-border group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="bg-background size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
          <Link className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="bg-background size-12 grid place-items-center rounded-xl relative right-2.5 top-1.5 rotate-6 shadow-lg ring-1 ring-border group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
          <Files className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
      <h2 className="text-foreground font-medium mt-6">Nenhuma fonte de conhecimento</h2>
      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
        Adicione documentos, sites ou APIs para enriquecer a base de conhecimento dos seus agentes.
      </p>
      <Button
        onClick={onAddSource}
        className="mt-4 shadow-sm active:shadow-none"
      >
        Adicionar fonte
      </Button>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: KnowledgeSource["status"] }) {
  const variants = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400"
  };

  const statusText = {
    active: "Ativo",
    processing: "Processando",
    error: "Erro",
    inactive: "Inativo"
  };

  const icons = {
    active: null,
    processing: <Loader2 className="w-3 h-3 mr-1 animate-spin" />,
    error: <AlertCircle className="w-3 h-3 mr-1" />,
    inactive: null
  };

  return (
    <Badge variant="outline" className={`${variants[status]} flex items-center`}>
      {icons[status]}
      {statusText[status]}
    </Badge>
  );
}

// Main Component
export default function KnowledgeBasePage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "document" as KnowledgeSource["type"],
    description: "",
    url: ""
  });

  // Load real data from API
  useEffect(() => {
    const fetchKnowledgeSources = async () => {
      try {
        const response = await fetch('/api/knowledge-sources', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('synapsefrontend_auth_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSources(data);
        } else {
          console.error('Failed to fetch knowledge sources');
          setSources([]);
        }
      } catch (error) {
        console.error('Error fetching knowledge sources:', error);
        setSources([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledgeSources();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission for adding a new source
  const handleAddSource = () => {
    const newSource: KnowledgeSource = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      description: formData.description,
      url: formData.url,
      dateAdded: new Date().toISOString().split('T')[0],
      status: "processing",
      lastSync: new Date().toISOString().split('T')[0]
    };

    setSources(prev => [...prev, newSource]);
    setAddDialogOpen(false);
    resetForm();
    
    // Show success toast
    toast.success("Fonte adicionada", {
      description: `${newSource.name} foi adicionada à base de conhecimento.`,
    });

    // Simulate processing completion
    setTimeout(() => {
      setSources(prev => 
        prev.map(source => 
          source.id === newSource.id 
            ? { ...source, status: "active" } 
            : source
        )
      );
      
      toast("Processamento concluído", {
        description: `${newSource.name} está pronta para uso.`,
      });
    }, 3000);
  };

  // Handle form submission for editing a source
  const handleEditSource = () => {
    if (!selectedSource) return;
    
    setSources(prev => 
      prev.map(source => 
        source.id === selectedSource.id 
          ? { 
              ...source, 
              name: formData.name,
              type: formData.type,
              description: formData.description,
              url: formData.url
            } 
          : source
      )
    );
    
    setEditDialogOpen(false);
    resetForm();
    
    toast("Fonte atualizada", {
      description: `As alterações em ${formData.name} foram salvas.`,
    });
  };

  // Handle source deletion
  const handleDeleteSource = () => {
    if (!selectedSource) return;
    
    setSources(prev => prev.filter(source => source.id !== selectedSource.id));
    setDeleteDialogOpen(false);
    
    toast("Fonte removida", {
      description: `${selectedSource.name} foi removida da base de conhecimento.`,
    });
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      type: "document",
      description: "",
      url: ""
    });
    setSelectedSource(null);
  };

  // Open edit dialog and populate form
  const openEditDialog = (source: KnowledgeSource) => {
    setSelectedSource(source);
    setFormData({
      name: source.name,
      type: source.type,
      description: source.description,
      url: source.url || ""
    });
    setEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (source: KnowledgeSource) => {
    setSelectedSource(source);
    setDeleteDialogOpen(true);
  };

  // Filter sources based on active tab
  const filteredSources = sources.filter(source => {
    if (activeTab === "all") return true;
    if (activeTab === "documents") return source.type === "document";
    if (activeTab === "websites") return source.type === "website";
    if (activeTab === "apis") return source.type === "api" || source.type === "database";
    if (activeTab === "active") return source.status === "active";
    if (activeTab === "processing") return source.status === "processing";
    if (activeTab === "error") return source.status === "error";
    return true;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Base de Conhecimento</h1>
        <p className="text-muted-foreground">
          Gerencie as fontes de conhecimento utilizadas pelos seus agentes de IA.
        </p>
      </div>
      
      <Separator />
      
      {/* Tabs and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-4 sm:grid-cols-7 w-full sm:w-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
            <TabsTrigger value="apis">APIs/DBs</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="processing">Processando</TabsTrigger>
            <TabsTrigger value="error">Erros</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar fonte
        </Button>
      </div>
      
      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-20"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        ) : sources.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState onAddSource={() => setAddDialogOpen(true)} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Adicionado em</TableHead>
                    <TableHead>Última Sincronização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell>
                        <span className="font-medium">{source.name}</span>
                        {source.url && (
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-blue-600 underline inline-flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Link
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground capitalize">{source.type}</span>
                      </TableCell>
                      <TableCell>
                        <span className="max-w-xs truncate block">{source.description}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={source.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{source.dateAdded}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{source.lastSync || '-'}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(source)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(source)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {sources.length === 0 && (
                  <TableCaption>Nenhuma fonte de conhecimento encontrada</TableCaption>
                )}
              </Table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add Source Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Adicionar fonte de conhecimento</DialogTitle>
            <DialogDescription>
              Adicione uma nova fonte para enriquecer a base de conhecimento dos seus agentes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Ex: Manual do Produto" 
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select 
                name="type" 
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as KnowledgeSource["type"] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Documento</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="database">Banco de Dados</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Descreva brevemente esta fonte de conhecimento" 
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="url">URL (opcional)</Label>
              <Input 
                id="url" 
                name="url" 
                placeholder="https://" 
                value={formData.url}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">
                Para documentos, você poderá fazer upload após criar a fonte.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleAddSource}
              disabled={!formData.name || !formData.description}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Source Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar fonte de conhecimento</DialogTitle>
            <DialogDescription>
              Atualize as informações desta fonte de conhecimento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input 
                id="edit-name" 
                name="name" 
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Tipo</Label>
              <Select 
                name="type" 
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as KnowledgeSource["type"] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Documento</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="database">Banco de Dados</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea 
                id="edit-description" 
                name="description" 
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-url">URL (opcional)</Label>
              <Input 
                id="edit-url" 
                name="url" 
                value={formData.url}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleEditSource}
              disabled={!formData.name || !formData.description}
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover fonte de conhecimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{selectedSource?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSource}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 