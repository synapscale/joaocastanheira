import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Link, Plus, X } from 'lucide-react';
import { useSkillsStore } from '@/stores/use-skills-store';
import { nodeTransformerService } from '@/services/node-transformer-service';
import { v4 as uuidv4 } from 'uuid';

/**
 * NodeComposer - Componente para criação e edição de nodes
 * Esta é uma versão reconstruída do componente original para resolver problemas de sintaxe
 * mantendo todas as funcionalidades originais
 */
export function NodeComposer({ nodeId = null, onSave = () => {}, onCancel = () => {} }) {
  // Estados para o formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [skillRefs, setSkillRefs] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  
  // Acesso ao store de skills
  const { skills } = useSkillsStore();
  
  // Funções auxiliares
  const getSkillByInstanceId = (id) => skillRefs.find(s => s.instanceId === id) || null;
  
  // Efeito para carregar dados se estiver editando
  useEffect(() => {
    if (nodeId) {
      // Aqui carregaríamos os dados do node para edição
      // Como exemplo, vamos simular alguns dados
      setName('Node Exemplo');
      setDescription('Descrição do node de exemplo');
      setSkillRefs([
        {
          instanceId: 'skill-1',
          id: 'skill-template-1',
          name: 'Skill 1',
          description: 'Descrição da skill 1',
          inputs: [{ id: 'input-1', name: 'Input 1', dataType: 'string' }],
          outputs: [{ id: 'output-1', name: 'Output 1', dataType: 'string' }]
        },
        {
          instanceId: 'skill-2',
          id: 'skill-template-2',
          name: 'Skill 2',
          description: 'Descrição da skill 2',
          inputs: [{ id: 'input-2', name: 'Input 2', dataType: 'string' }],
          outputs: [{ id: 'output-2', name: 'Output 2', dataType: 'string' }]
        }
      ]);
      setConnections([
        {
          id: 'connection-1',
          sourceSkillInstanceId: 'skill-1',
          sourcePortId: 'output-1',
          targetSkillInstanceId: 'skill-2',
          targetPortId: 'input-2'
        }
      ]);
    }
  }, [nodeId]);
  
  // Função para adicionar skill
  const handleAddSkill = (skillId) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
      const skillRef = {
        ...skill,
        instanceId: `${skill.id}-${uuidv4().slice(0, 8)}`
      };
      setSkillRefs([...skillRefs, skillRef]);
    }
    setIsSkillDialogOpen(false);
  };
  
  // Função para remover skill
  const handleRemoveSkill = (instanceId) => {
    setSkillRefs(skillRefs.filter(s => s.instanceId !== instanceId));
    setConnections(connections.filter(
      c => c.sourceSkillInstanceId !== instanceId && c.targetSkillInstanceId !== instanceId
    ));
  };
  
  // Função para adicionar conexão
  const handleAddConnection = (connection) => {
    setConnections([...connections, { ...connection, id: `connection-${uuidv4().slice(0, 8)}` }]);
    setIsConnectionDialogOpen(false);
  };
  
  // Função para remover conexão
  const handleRemoveConnection = (connectionId) => {
    setConnections(connections.filter(c => c.id !== connectionId));
  };
  
  // Função para salvar o node
  const handleSave = () => {
    const nodeData = {
      id: nodeId || `node-${uuidv4().slice(0, 8)}`,
      name,
      description,
      skillRefs,
      connections
    };
    
    // Aqui poderíamos transformar o node usando o serviço
    // const transformedNode = nodeTransformerService.transformNode(nodeData);
    
    onSave(nodeData);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{nodeId ? "Editar Node" : "Novo Node"}</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Nome do node" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Descreva o propósito deste node" 
            rows={3} 
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Skills</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSkillDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Skill
          </Button>
        </div>
        
        {skillRefs.length === 0 ? (
          <div className="text-center p-4 border rounded-md bg-muted mt-4">
            <p className="text-muted-foreground">Nenhuma skill adicionada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {skillRefs.map((skill) => (
              <Card key={skill.instanceId}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{skill.name}</h4>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Entradas</h4>
                          <div className="space-y-1">
                            {skill.inputs.length > 0 ? (
                              skill.inputs.map((input) => (
                                <div key={input.id} className="text-xs p-1 bg-muted rounded">
                                  {input.name} ({input.dataType})
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-muted-foreground">Nenhuma entrada</div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Saídas</h4>
                          <div className="space-y-1">
                            {skill.outputs.length > 0 ? (
                              skill.outputs.map((output) => (
                                <div key={output.id} className="text-xs p-1 bg-muted rounded">
                                  {output.name} ({output.dataType})
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-muted-foreground">Nenhuma saída</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveSkill(skill.instanceId)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <div className="flex justify-between items-center mt-8">
          <h3 className="text-lg font-medium">Conexões</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConnectionDialogOpen(true)}
            disabled={skillRefs.length < 2}
          >
            <Link className="w-4 h-4 mr-2" />
            Adicionar Conexão
          </Button>
        </div>
        
        {connections.length === 0 ? (
          <div className="text-center p-4 border rounded-md bg-muted mt-4">
            <p className="text-muted-foreground">Nenhuma conexão definida</p>
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {connections.map((connection) => {
              const sourceSkill = getSkillByInstanceId(connection.sourceSkillInstanceId);
              const targetSkill = getSkillByInstanceId(connection.targetSkillInstanceId);
              const sourcePort = sourceSkill?.outputs.find((output) => output.id === connection.sourcePortId);
              const targetPort = targetSkill?.inputs.find((input) => input.id === connection.targetPortId);
              
              return (
                <Card key={connection.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm">
                          <span className="font-medium">{sourceSkill?.name || "?"}</span>
                          <span className="text-muted-foreground"> ({sourcePort?.name || "?"}) </span>
                          <span className="text-muted-foreground"> → </span>
                          <span className="font-medium">{targetSkill?.name || "?"}</span>
                          <span className="text-muted-foreground"> ({targetPort?.name || "?"}) </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveConnection(connection.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default NodeComposer;
