"use client"

import { useState } from "react"
import { PlusCircle, Trash2, Save, X, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useCustomAttributes, type CustomAttribute } from "@/hooks/use-custom-attributes"
import AttributeHelp from "./attribute-help"

interface CustomAttributesManagerProps {
  onClose: () => void
}

export default function CustomAttributesManager({ onClose }: CustomAttributesManagerProps) {
  const { customAttributes, addCustomAttribute, updateCustomAttribute, removeCustomAttribute } = useCustomAttributes()

  const [newAttribute, setNewAttribute] = useState<Omit<CustomAttribute, "id">>({
    name: "",
    description: "",
    selector: "",
    priority: 50,
    extractName: false,
    extractPath: false,
    findParentComponent: false,
    parentSelector: "",
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingAttribute, setEditingAttribute] = useState<CustomAttribute | null>(null)

  const handleAddAttribute = () => {
    if (!newAttribute.name || !newAttribute.selector) return

    addCustomAttribute(newAttribute)
    setNewAttribute({
      name: "",
      description: "",
      selector: "",
      priority: 50,
      extractName: false,
      extractPath: false,
      findParentComponent: false,
      parentSelector: "",
    })
  }

  const handleEditAttribute = (attribute: CustomAttribute) => {
    setEditingId(attribute.id)
    setEditingAttribute({ ...attribute })
  }

  const handleSaveEdit = () => {
    if (editingId && editingAttribute) {
      updateCustomAttribute(editingId, editingAttribute)
      setEditingId(null)
      setEditingAttribute(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingAttribute(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-medium">Gerenciar Atributos Personalizados</h2>
          <div className="flex items-center space-x-1">
            <AttributeHelp />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2 mb-2">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Defina atributos personalizados para identificar componentes em sua aplicação. Os atributos com maior
              prioridade serão verificados primeiro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="attr-name">Nome do Atributo</Label>
              <Input
                id="attr-name"
                value={newAttribute.name}
                onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                placeholder="Ex: data-my-component"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="attr-selector">Seletor CSS</Label>
              <Input
                id="attr-selector"
                value={newAttribute.selector}
                onChange={(e) => setNewAttribute({ ...newAttribute, selector: e.target.value })}
                placeholder="Ex: [data-my-component]"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="attr-description">Descrição</Label>
              <Input
                id="attr-description"
                value={newAttribute.description}
                onChange={(e) => setNewAttribute({ ...newAttribute, description: e.target.value })}
                placeholder="Descrição do atributo"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="attr-priority">Prioridade</Label>
              <Input
                id="attr-priority"
                type="number"
                min="0"
                max="100"
                value={newAttribute.priority}
                onChange={(e) => setNewAttribute({ ...newAttribute, priority: Number.parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="extract-name"
                  checked={newAttribute.extractName}
                  onCheckedChange={(checked) => setNewAttribute({ ...newAttribute, extractName: checked === true })}
                />
                <Label htmlFor="extract-name" className="text-sm">
                  Extrair Nome
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="extract-path"
                  checked={newAttribute.extractPath}
                  onCheckedChange={(checked) => setNewAttribute({ ...newAttribute, extractPath: checked === true })}
                />
                <Label htmlFor="extract-path" className="text-sm">
                  Extrair Caminho
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="find-parent"
                checked={newAttribute.findParentComponent}
                onCheckedChange={(checked) =>
                  setNewAttribute({ ...newAttribute, findParentComponent: checked === true })
                }
              />
              <Label htmlFor="find-parent" className="text-sm">
                Buscar Componente Pai
              </Label>
            </div>

            {newAttribute.findParentComponent && (
              <div className="mt-2">
                <Label htmlFor="parent-selector">Seletor do Componente Pai</Label>
                <Input
                  id="parent-selector"
                  value={newAttribute.parentSelector || ""}
                  onChange={(e) => setNewAttribute({ ...newAttribute, parentSelector: e.target.value })}
                  placeholder="Ex: .model-selector, [data-component='ModelSelector']"
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Button
                onClick={handleAddAttribute}
                disabled={!newAttribute.name || !newAttribute.selector}
                className="mt-4"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Atributo
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <h3 className="font-medium mb-3">Atributos Definidos</h3>

          {customAttributes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhum atributo personalizado definido</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customAttributes.map((attribute) => (
                <div key={attribute.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  {editingId === attribute.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`edit-name-${attribute.id}`}>Nome</Label>
                          <Input
                            id={`edit-name-${attribute.id}`}
                            value={editingAttribute?.name || ""}
                            onChange={(e) =>
                              setEditingAttribute((prev) => (prev ? { ...prev, name: e.target.value } : null))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-selector-${attribute.id}`}>Seletor</Label>
                          <Input
                            id={`edit-selector-${attribute.id}`}
                            value={editingAttribute?.selector || ""}
                            onChange={(e) =>
                              setEditingAttribute((prev) => (prev ? { ...prev, selector: e.target.value } : null))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-description-${attribute.id}`}>Descrição</Label>
                          <Input
                            id={`edit-description-${attribute.id}`}
                            value={editingAttribute?.description || ""}
                            onChange={(e) =>
                              setEditingAttribute((prev) => (prev ? { ...prev, description: e.target.value } : null))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-priority-${attribute.id}`}>Prioridade</Label>
                          <Input
                            id={`edit-priority-${attribute.id}`}
                            type="number"
                            min="0"
                            max="100"
                            value={editingAttribute?.priority || 0}
                            onChange={(e) =>
                              setEditingAttribute((prev) =>
                                prev ? { ...prev, priority: Number.parseInt(e.target.value) || 0 } : null,
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-extract-name-${attribute.id}`}
                            checked={editingAttribute?.extractName || false}
                            onCheckedChange={(checked) =>
                              setEditingAttribute((prev) => (prev ? { ...prev, extractName: checked === true } : null))
                            }
                          />
                          <Label htmlFor={`edit-extract-name-${attribute.id}`} className="text-sm">
                            Extrair Nome
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-extract-path-${attribute.id}`}
                            checked={editingAttribute?.extractPath || false}
                            onCheckedChange={(checked) =>
                              setEditingAttribute((prev) => (prev ? { ...prev, extractPath: checked === true } : null))
                            }
                          />
                          <Label htmlFor={`edit-extract-path-${attribute.id}`} className="text-sm">
                            Extrair Caminho
                          </Label>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox
                          id={`edit-find-parent-${attribute.id}`}
                          checked={editingAttribute?.findParentComponent || false}
                          onCheckedChange={(checked) =>
                            setEditingAttribute((prev) =>
                              prev ? { ...prev, findParentComponent: checked === true } : null,
                            )
                          }
                        />
                        <Label htmlFor={`edit-find-parent-${attribute.id}`} className="text-sm">
                          Buscar Componente Pai
                        </Label>
                      </div>

                      {editingAttribute?.findParentComponent && (
                        <div className="mt-2">
                          <Label htmlFor={`edit-parent-selector-${attribute.id}`}>Seletor do Componente Pai</Label>
                          <Input
                            id={`edit-parent-selector-${attribute.id}`}
                            value={editingAttribute?.parentSelector || ""}
                            onChange={(e) =>
                              setEditingAttribute((prev) => (prev ? { ...prev, parentSelector: e.target.value } : null))
                            }
                            placeholder="Ex: .model-selector, [data-component='ModelSelector']"
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div className="flex justify-end space-x-2 mt-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="h-3.5 w-3.5 mr-1.5" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium flex items-center">
                            {attribute.name}
                            <Badge variant="outline" className="ml-2 text-xs">
                              Prioridade: {attribute.priority}
                            </Badge>
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {attribute.description || "Sem descrição"}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEditAttribute(attribute)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Editar</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  onClick={() => removeCustomAttribute(attribute.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remover</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      <div className="text-sm">
                        <div className="flex items-center mt-1">
                          <span className="font-medium w-20">Seletor:</span>
                          <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">
                            {attribute.selector}
                          </code>
                        </div>

                        <div className="flex items-center mt-1.5">
                          <span className="font-medium w-20">Extração:</span>
                          <div className="flex space-x-2">
                            {attribute.extractName && (
                              <Badge variant="secondary" className="text-xs">
                                Nome
                              </Badge>
                            )}
                            {attribute.extractPath && (
                              <Badge variant="secondary" className="text-xs">
                                Caminho
                              </Badge>
                            )}
                            {attribute.findParentComponent && (
                              <Badge variant="secondary" className="text-xs">
                                Busca Pai
                              </Badge>
                            )}
                            {!attribute.extractName && !attribute.extractPath && !attribute.findParentComponent && (
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Nenhuma</span>
                            )}
                          </div>
                        </div>

                        {attribute.findParentComponent && attribute.parentSelector && (
                          <div className="flex items-center mt-1">
                            <span className="font-medium w-20">Seletor Pai:</span>
                            <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">
                              {attribute.parentSelector}
                            </code>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
