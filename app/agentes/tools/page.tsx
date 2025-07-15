"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Filter, 
  Loader2, 
  MoreHorizontal, 
  X,
  Check,
  AlertCircle,
  Wrench,
  ArrowUpDown,
  ChevronDown,
  Settings,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

// Definir o tipo Tool localmente, se não estiver definido
export type Tool = {
  id: string;
  name: string;
  description: string;
  type: string;
  isActive: boolean;
  updatedAt: string;
};

// Empty State Component
function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="bg-background border-border hover:border-border/80 text-center border-2 border-dashed rounded-xl p-14 w-full max-w-[620px] group hover:bg-muted/50 transition duration-500 hover:duration-200">
      <div className="flex justify-center isolate">
        <div className="bg-background size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
          <Wrench className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
      <h2 className="text-foreground font-medium mt-6">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{description}</p>
      <Button
        onClick={action.onClick}
        variant="outline"
        className="mt-4 shadow-sm active:shadow-none"
      >
        {action.label}
      </Button>
    </div>
  );
}

// Tool Form Component
function ToolForm({
  tool,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  tool?: Tool;
  onSubmit: (data: Omit<Tool, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState<Omit<Tool, "id" | "createdAt" | "updatedAt">>({
    name: tool?.name || "",
    description: tool?.description || "",
    type: tool?.type || "function",
    isActive: tool?.isActive ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Ferramenta</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Calculadora, Pesquisa Web, etc."
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          required
        >
          <option value="function">Função</option>
          <option value="api">API</option>
          <option value="database">Banco de Dados</option>
          <option value="other">Outro</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descreva o propósito e funcionamento desta ferramenta"
          rows={4}
          required
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="isActive">Status</Label>
          <p className="text-sm text-muted-foreground">
            {formData.isActive ? "Ativa" : "Inativa"}
          </p>
        </div>
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={handleSwitchChange}
        />
      </div>
      
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tool ? "Atualizar" : "Criar"} Ferramenta
        </Button>
      </DialogFooter>
    </form>
  );
}

// Delete Confirmation Dialog
function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  toolName,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  toolName: string;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Excluir Ferramenta
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir a ferramenta <span className="font-semibold text-foreground">{toolName}</span>? Esta ação não pode ser desfeita.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export default function ToolsManagementPage() {
  // State
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Real data fetch
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/agent-tools', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('synapsefrontend_auth_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTools(data);
        } else {
          console.error('Failed to fetch agent tools');
          setTools([]);
        }
      } catch (error) {
        console.error('Error fetching agent tools:', error);
        setTools([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Handlers
  const handleAddTool = async (data: Omit<Tool, "id" | "createdAt" | "updatedAt">) => {
    setIsSubmitting(true);
    
    try {
      // Real API call to create tool
      const response = await fetch('/api/agent-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('synapsefrontend_auth_token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create tool');
      }
      
      const newTool = await response.json();
      setTools((prev) => [...prev, newTool]);
      setIsAddDialogOpen(false);
      toast.success("Ferramenta criada com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar ferramenta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTool = async (data: Omit<Tool, "id" | "createdAt" | "updatedAt">) => {
    if (!selectedTool) return;
    
    setIsSubmitting(true);
    
    try {
      // Real API call to update tool
      const response = await fetch(`/api/agent-tools/${selectedTool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('synapsefrontend_auth_token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update tool');
      }
      
      const updatedTool = await response.json();
      setTools((prev) => 
        prev.map((tool) => (tool.id === selectedTool.id ? updatedTool : tool))
      );
      
      setIsEditDialogOpen(false);
      setSelectedTool(null);
      toast.success("Ferramenta atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar ferramenta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTool = async () => {
    if (!selectedTool) return;
    
    setIsDeleting(true);
    
    try {
      // Real API call to delete tool
      const response = await fetch(`/api/agent-tools/${selectedTool.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('synapsefrontend_auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete tool');
      }
      
      setTools((prev) => prev.filter((tool) => tool.id !== selectedTool.id));
      setIsDeleteDialogOpen(false);
      setSelectedTool(null);
      toast.success("Ferramenta excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir ferramenta. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEditDialog = (tool: Tool) => {
    setSelectedTool(tool);
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (tool: Tool) => {
    setSelectedTool(tool);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ferramentas dos Agentes</h1>
          <p className="text-muted-foreground">
            Gerencie as ferramentas disponíveis para seus agentes de IA.
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              <span>Nova Ferramenta</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Ferramenta</DialogTitle>
            </DialogHeader>
            <ToolForm 
              onSubmit={handleAddTool} 
              onCancel={() => setIsAddDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Separator />
      
      {/* Main Content */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando ferramentas...</p>
          </div>
        ) : tools.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <EmptyState
              title="Nenhuma ferramenta encontrada"
              description="Adicione ferramentas para expandir as capacidades dos seus agentes de IA."
              action={{
                label: "Adicionar Ferramenta",
                onClick: () => setIsAddDialogOpen(true),
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atualizado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell>
                      <span className="font-medium">{tool.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="max-w-xs truncate block">{tool.description}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{tool.type}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tool.isActive ? "default" : "secondary"} className={cn(
                        "px-2 py-1 text-xs",
                        tool.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      )}>
                        <div className="flex items-center gap-1">
                          {tool.isActive ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                              <span>Ativa</span>
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
                              <span>Inativa</span>
                            </>
                          )}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{new Date(tool.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(tool)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleOpenDeleteDialog(tool)}
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
              {tools.length === 0 && (
                <TableCaption>Nenhuma ferramenta encontrada</TableCaption>
              )}
            </Table>
          </div>
        )}
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Ferramenta</DialogTitle>
          </DialogHeader>
          {selectedTool && (
            <ToolForm 
              tool={selectedTool}
              onSubmit={handleEditTool} 
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteTool}
        toolName={selectedTool?.name || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
} 