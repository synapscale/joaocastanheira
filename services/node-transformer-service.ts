/**
 * SERVIÇO DE TRANSFORMAÇÃO DE NODES
 *
 * Responsável por converter entre formatos internos e externos
 * Implementa padrão Transformer com validação robusta
 *
 * AI-Friendly Features:
 * - Interface clara e bem documentada
 * - Métodos com responsabilidade única
 * - Validação em múltiplas camadas
 * - Tratamento de erros específico
 */

import { SKILL_CATEGORIES, TRANSFORMATION_CONFIG, type DataType } from "@/config/node-system-config"
import type { Skill, CustomNode, SkillPort } from "@/types/skill-types"

/**
 * Formato de node compatível com canvas principal
 */
export interface CanvasNode {
  /** Identificador único */
  id: string
  /** Nome exibido */
  name: string
  /** Descrição funcional */
  description: string
  /** Categoria para organização */
  category: string
  /** Versão do node */
  version: string
  /** Metadados do autor */
  author: {
    name: string
    id?: string
  }
  /** Configuração de inputs */
  inputs: CanvasPort[]
  /** Configuração de outputs */
  outputs: CanvasPort[]
  /** Configurações visuais */
  ui: {
    color: string
    icon: string
    position?: { x: number; y: number }
  }
  /** Configuração de execução */
  execution: {
    language: string
    code: string
    dependencies?: string[]
  }
  /** Metadados adicionais */
  metadata: {
    tags: string[]
    complexity: "beginner" | "intermediate" | "advanced"
    license: string
    created: string
    updated: string
  }
}

/**
 * Porta de conexão para canvas
 */
export interface CanvasPort {
  /** Identificador da porta */
  id: string
  /** Nome exibido */
  name: string
  /** Tipo de dados */
  type: string
  /** Descrição da funcionalidade */
  description: string
  /** Se é obrigatório */
  required: boolean
  /** Valor padrão */
  defaultValue?: any
  /** Configurações de validação */
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

/**
 * Resultado de transformação
 */
export interface TransformationResult<T> {
  /** Sucesso da operação */
  success: boolean
  /** Dados transformados */
  data?: T
  /** Erros encontrados */
  errors: string[]
  /** Avisos não críticos */
  warnings: string[]
  /** Metadados da transformação */
  metadata: {
    sourceFormat: string
    targetFormat: string
    timestamp: string
    version: string
  }
}

/**
 * SERVIÇO DE TRANSFORMAÇÃO DE NODES
 *
 * Implementa conversões entre formatos com validação robusta
 * Singleton para garantir consistência
 */
export class NodeTransformerService {
  private static instance: NodeTransformerService

  /**
   * Obtém instância singleton
   */
  static getInstance(): NodeTransformerService {
    if (!NodeTransformerService.instance) {
      NodeTransformerService.instance = new NodeTransformerService()
    }
    return NodeTransformerService.instance
  }

  /**
   * Transforma skill em node compatível com canvas
   */
  skillToCanvasNode(skill: Skill): TransformationResult<CanvasNode> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Validar skill de entrada
      const validationResult = this.validateSkill(skill)
      if (!validationResult.isValid) {
        errors.push(...validationResult.errors)
      }
      warnings.push(...validationResult.warnings)

      // Obter configuração da categoria
      const category = SKILL_CATEGORIES[skill.type]
      if (!category) {
        warnings.push(`Categoria '${skill.type}' não encontrada, usando padrão`)
      }

      // Transformar inputs
      const canvasInputs = this.transformPorts(skill.inputs, "input")

      // Transformar outputs
      const canvasOutputs = this.transformPorts(skill.outputs, "output")

      // Construir node do canvas
      const canvasNode: CanvasNode = {
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.type,
        version: skill.version,
        author: {
          name: skill.author,
          id: skill.metadata?.authorId,
        },
        inputs: canvasInputs,
        outputs: canvasOutputs,
        ui: {
          color: category?.color || "#6B7280",
          icon: category?.icon || "package",
          position: skill.metadata?.position,
        },
        execution: {
          language: skill.implementation.language,
          code: skill.implementation.code,
          dependencies: skill.implementation.dependencies,
        },
        metadata: {
          tags: skill.metadata?.tags || [],
          complexity: this.inferComplexity(skill),
          license: skill.metadata?.license || "MIT",
          created: skill.createdAt,
          updated: skill.updatedAt,
        },
      }

      return {
        success: errors.length === 0,
        data: canvasNode,
        errors,
        warnings,
        metadata: {
          sourceFormat: "skill",
          targetFormat: "canvas-node",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        },
      }
    } catch (error) {
      errors.push(`Erro na transformação: ${error.message}`)

      return {
        success: false,
        errors,
        warnings,
        metadata: {
          sourceFormat: "skill",
          targetFormat: "canvas-node",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        },
      }
    }
  }

  /**
   * Transforma custom node em node compatível com canvas
   */
  customNodeToCanvasNode(customNode: CustomNode): TransformationResult<CanvasNode> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Validar custom node
      if (!customNode.name || !customNode.description) {
        errors.push("Nome e descrição são obrigatórios")
      }

      if (customNode.skills.length === 0) {
        errors.push("Custom node deve conter pelo menos uma skill")
      }

      // Obter configuração da categoria
      const category = SKILL_CATEGORIES[customNode.category]
      if (!category) {
        warnings.push(`Categoria '${customNode.category}' não encontrada`)
      }

      // Transformar inputs e outputs
      const canvasInputs = this.transformPorts(customNode.inputs, "input")
      const canvasOutputs = this.transformPorts(customNode.outputs, "output")

      // Gerar código composto
      const compositeCode = this.generateCompositeCode(customNode)

      const canvasNode: CanvasNode = {
        id: customNode.id,
        name: customNode.name,
        description: customNode.description,
        category: customNode.category,
        version: customNode.version,
        author: {
          name: customNode.author,
          id: customNode.metadata?.authorId,
        },
        inputs: canvasInputs,
        outputs: canvasOutputs,
        ui: {
          color: category?.color || "#6B7280",
          icon: category?.icon || "package",
        },
        execution: {
          language: "javascript",
          code: compositeCode,
          dependencies: this.extractDependencies(customNode),
        },
        metadata: {
          tags: customNode.metadata?.tags || [],
          complexity: "intermediate", // Custom nodes são sempre intermediários
          license: customNode.metadata?.license || "MIT",
          created: customNode.createdAt,
          updated: customNode.updatedAt,
        },
      }

      return {
        success: errors.length === 0,
        data: canvasNode,
        errors,
        warnings,
        metadata: {
          sourceFormat: "custom-node",
          targetFormat: "canvas-node",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        },
      }
    } catch (error) {
      errors.push(`Erro na transformação: ${error.message}`)

      return {
        success: false,
        errors,
        warnings,
        metadata: {
          sourceFormat: "custom-node",
          targetFormat: "canvas-node",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        },
      }
    }
  }

  /**
   * Valida skill antes da transformação
   */
  private validateSkill(skill: Skill): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Validações obrigatórias
    if (!skill.name?.trim()) {
      errors.push("Nome da skill é obrigatório")
    }

    if (!skill.description?.trim()) {
      errors.push("Descrição da skill é obrigatória")
    }

    if (!skill.implementation?.code?.trim()) {
      errors.push("Código de implementação é obrigatório")
    }

    // Validações de qualidade
    if (skill.name && skill.name.length < 3) {
      warnings.push("Nome da skill muito curto (mínimo 3 caracteres)")
    }

    if (skill.description && skill.description.length < 10) {
      warnings.push("Descrição muito curta (mínimo 10 caracteres)")
    }

    if (skill.inputs.length === 0) {
      warnings.push("Skill sem inputs pode ter utilidade limitada")
    }

    if (skill.outputs.length === 0) {
      warnings.push("Skill sem outputs pode não produzir resultados")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Transforma portas de skill para formato canvas
   */
  private transformPorts(ports: SkillPort[], type: "input" | "output"): CanvasPort[] {
    return ports.map((port) => ({
      id: port.id,
      name: port.name,
      type: this.mapDataType(port.dataType),
      description: port.description || `${type} ${port.name}`,
      required: port.required || false,
      defaultValue: port.defaultValue,
      validation: this.generateValidation(port),
    }))
  }

  /**
   * Mapeia tipos de dados internos para canvas
   */
  private mapDataType(internalType: DataType): string {
    const mapping = TRANSFORMATION_CONFIG.typeMapping.n8n
    return mapping[internalType as keyof typeof mapping] || internalType
  }

  /**
   * Gera validação para porta baseada no tipo
   */
  private generateValidation(port: SkillPort): CanvasPort["validation"] | undefined {
    if (!TRANSFORMATION_CONFIG.validation.enableTypeChecking) {
      return undefined
    }

    const validation: CanvasPort["validation"] = {}

    switch (port.dataType) {
      case "string":
        if (port.metadata?.minLength) validation.min = port.metadata.minLength
        if (port.metadata?.maxLength) validation.max = port.metadata.maxLength
        if (port.metadata?.pattern) validation.pattern = port.metadata.pattern
        break

      case "number":
        if (port.metadata?.min !== undefined) validation.min = port.metadata.min
        if (port.metadata?.max !== undefined) validation.max = port.metadata.max
        break
    }

    return Object.keys(validation).length > 0 ? validation : undefined
  }

  /**
   * Infere complexidade da skill baseada em características
   */
  private inferComplexity(skill: Skill): "beginner" | "intermediate" | "advanced" {
    let complexityScore = 0

    // Fatores que aumentam complexidade
    if (skill.inputs.length > 3) complexityScore += 1
    if (skill.outputs.length > 2) complexityScore += 1
    if (skill.implementation.dependencies && skill.implementation.dependencies.length > 0) complexityScore += 1
    if (skill.implementation.code.length > 500) complexityScore += 1
    if (skill.implementation.code.includes("async") || skill.implementation.code.includes("await")) complexityScore += 1
    if (skill.implementation.code.includes("try") || skill.implementation.code.includes("catch")) complexityScore += 1

    if (complexityScore >= 4) return "advanced"
    if (complexityScore >= 2) return "intermediate"
    return "beginner"
  }

  /**
   * Gera código composto para custom node
   */
  private generateCompositeCode(customNode: CustomNode): string {
    // Implementação simplificada - seria expandida conforme necessário
    return `
// Custom Node: ${customNode.name}
// Generated composite code

async function executeCustomNode(inputs, context) {
  // Implementação seria gerada baseada nas skills e conexões
  console.log('Executing custom node:', '${customNode.name}');
  
  // Placeholder para lógica composta
  return {
    success: true,
    outputs: inputs // Passthrough por enquanto
  };
}

return await executeCustomNode(inputs, context);
    `.trim()
  }

  /**
   * Extrai dependências de custom node
   */
  private extractDependencies(customNode: CustomNode): string[] {
    const dependencies = new Set<string>()

    // Coletar dependências de todas as skills
    customNode.skills.forEach((skillRef) => {
      // Aqui seria implementada a lógica para extrair dependências
      // das skills referenciadas
    })

    return Array.from(dependencies)
  }
}

/**
 * Instância singleton do serviço
 */
export const nodeTransformer = NodeTransformerService.getInstance()
