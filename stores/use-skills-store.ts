/**
 * STORE GLOBAL DE SKILLS E NODES
 *
 * Gerencia estado global da aplicação usando Zustand
 * Implementa persistência automática e validação de dados
 *
 * AI-Friendly Features:
 * - Interface tipada e bem documentada
 * - Métodos com responsabilidade única
 * - Estado imutável com Immer
 * - Validação automática de dados
 */

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import type { Skill, CustomNode, SkillPort } from "@/types/skill-types"

/**
 * Estado do store de skills
 */
interface SkillsState {
  // === DADOS ===
  /** Lista de skills criadas */
  skills: Skill[]
  /** Lista de nodes customizados */
  customNodes: CustomNode[]
  /** Configurações do usuário */
  userPreferences: UserPreferences

  // === SKILLS ===
  /** Adiciona nova skill */
  addSkill: (skillData: CreateSkillData) => string
  /** Atualiza skill existente */
  updateSkill: (id: string, updates: Partial<Skill>) => void
  /** Remove skill */
  removeSkill: (id: string) => void
  /** Obtém skill por ID */
  getSkill: (id: string) => Skill | undefined
  /** Lista skills por categoria */
  getSkillsByCategory: (category: string) => Skill[]
  /** Busca skills por termo */
  searchSkills: (query: string) => Skill[]

  // === CUSTOM NODES ===
  /** Adiciona custom node */
  addCustomNode: (nodeData: CreateCustomNodeData) => string
  /** Atualiza custom node */
  updateCustomNode: (id: string, updates: Partial<CustomNode>) => void
  /** Remove custom node */
  removeCustomNode: (id: string) => void
  /** Obtém custom node por ID */
  getCustomNode: (id: string) => CustomNode | undefined

  // === UTILITÁRIOS ===
  /** Limpa todos os dados */
  clearAll: () => void
  /** Exporta dados */
  exportData: () => ExportData
  /** Importa dados */
  importData: (data: ExportData) => void
  /** Valida integridade dos dados */
  validateIntegrity: () => ValidationResult
}

/**
 * Dados para criação de skill
 */
interface CreateSkillData {
  name: string
  description: string
  type: string
  author: string
  inputs: SkillPort[]
  outputs: SkillPort[]
  implementation: {
    language: string
    code: string
    dependencies?: string[]
  }
  metadata?: {
    tags?: string[]
    category?: string
    icon?: string
    color?: string
    documentation?: string
  }
}

/**
 * Dados para criação de custom node
 */
interface CreateCustomNodeData {
  name: string
  description: string
  category: string
  author: string
  skills: any[] // SkillReference[]
  connections: any[] // InternalConnection[]
  inputs: SkillPort[]
  outputs: SkillPort[]
  inputMappings?: any[]
  outputMappings?: any[]
  metadata?: {
    tags?: string[]
    isTemplate?: boolean
    isPublic?: boolean
  }
}

/**
 * Preferências do usuário
 */
interface UserPreferences {
  /** Tema preferido */
  theme: "light" | "dark" | "system"
  /** Idioma */
  language: "pt" | "en"
  /** Configurações do editor */
  editor: {
    fontSize: number
    tabSize: number
    wordWrap: boolean
    minimap: boolean
  }
  /** Configurações de notificação */
  notifications: {
    enableToasts: boolean
    enableSounds: boolean
    autoSave: boolean
  }
}

/**
 * Dados de exportação
 */
interface ExportData {
  version: string
  timestamp: string
  skills: Skill[]
  customNodes: CustomNode[]
  userPreferences: UserPreferences
}

/**
 * Resultado de validação
 */
interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    totalSkills: number
    totalCustomNodes: number
    orphanedReferences: number
  }
}

/**
 * Utilitários para geração de IDs únicos
 */
const generateId = (prefix: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix}_${timestamp}_${random}`
}

/**
 * Validador de dados
 */
const validateSkillData = (data: CreateSkillData): string[] => {
  const errors: string[] = []

  if (!data.name?.trim()) errors.push("Nome é obrigatório")
  if (!data.description?.trim()) errors.push("Descrição é obrigatória")
  if (!data.type?.trim()) errors.push("Tipo é obrigatório")
  if (!data.author?.trim()) errors.push("Autor é obrigatório")
  if (!data.implementation?.code?.trim()) errors.push("Código é obrigatório")

  if (data.name && data.name.length < 3) {
    errors.push("Nome deve ter pelo menos 3 caracteres")
  }

  if (data.description && data.description.length < 10) {
    errors.push("Descrição deve ter pelo menos 10 caracteres")
  }

  return errors
}

/**
 * STORE PRINCIPAL DE SKILLS
 *
 * Implementa padrão de store com Zustand + Immer + Persist
 */
export const useSkillsStore = create<SkillsState>()(
  persist(
    immer((set, get) => ({
      // === ESTADO INICIAL ===
      skills: [],
      customNodes: [],
      userPreferences: {
        theme: "system",
        language: "pt",
        editor: {
          fontSize: 14,
          tabSize: 2,
          wordWrap: true,
          minimap: false,
        },
        notifications: {
          enableToasts: true,
          enableSounds: false,
          autoSave: true,
        },
      },

      // === SKILLS ===
      addSkill: (skillData) => {
        // Validar dados
        const errors = validateSkillData(skillData)
        if (errors.length > 0) {
          throw new Error(`Dados inválidos: ${errors.join(", ")}`)
        }

        const id = generateId("skill")
        const now = new Date().toISOString()

        const skill: Skill = {
          ...skillData,
          id,
          version: "1.0.0",
          createdAt: now,
          updatedAt: now,
        }

        set((state) => {
          state.skills.push(skill)
        })

        return id
      },

      updateSkill: (id, updates) => {
        set((state) => {
          const skillIndex = state.skills.findIndex((s) => s.id === id)
          if (skillIndex !== -1) {
            state.skills[skillIndex] = {
              ...state.skills[skillIndex],
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          }
        })
      },

      removeSkill: (id) => {
        set((state) => {
          state.skills = state.skills.filter((s) => s.id !== id)
        })
      },

      getSkill: (id) => {
        return get().skills.find((s) => s.id === id)
      },

      getSkillsByCategory: (category) => {
        return get().skills.filter((s) => s.type === category)
      },

      searchSkills: (query) => {
        const lowerQuery = query.toLowerCase()
        return get().skills.filter(
          (skill) =>
            skill.name.toLowerCase().includes(lowerQuery) ||
            skill.description.toLowerCase().includes(lowerQuery) ||
            skill.metadata?.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
        )
      },

      // === CUSTOM NODES ===
      addCustomNode: (nodeData) => {
        const id = generateId("node")
        const now = new Date().toISOString()

        const customNode: CustomNode = {
          ...nodeData,
          id,
          version: "1.0.0",
          createdAt: now,
          updatedAt: now,
        }

        set((state) => {
          state.customNodes.push(customNode)
        })

        return id
      },

      updateCustomNode: (id, updates) => {
        set((state) => {
          const nodeIndex = state.customNodes.findIndex((n) => n.id === id)
          if (nodeIndex !== -1) {
            state.customNodes[nodeIndex] = {
              ...state.customNodes[nodeIndex],
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          }
        })
      },

      removeCustomNode: (id) => {
        set((state) => {
          state.customNodes = state.customNodes.filter((n) => n.id !== id)
        })
      },

      getCustomNode: (id) => {
        return get().customNodes.find((n) => n.id === id)
      },

      // === UTILITÁRIOS ===
      clearAll: () => {
        set((state) => {
          state.skills = []
          state.customNodes = []
        })
      },

      exportData: () => {
        const state = get()
        return {
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          skills: state.skills,
          customNodes: state.customNodes,
          userPreferences: state.userPreferences,
        }
      },

      importData: (data) => {
        // Validar versão de compatibilidade
        if (data.version !== "1.0.0") {
          throw new Error("Versão de dados incompatível")
        }

        set((state) => {
          state.skills = data.skills || []
          state.customNodes = data.customNodes || []
          if (data.userPreferences) {
            state.userPreferences = { ...state.userPreferences, ...data.userPreferences }
          }
        })
      },

      validateIntegrity: () => {
        const state = get()
        const errors: string[] = []
        const warnings: string[] = []

        // Validar skills
        state.skills.forEach((skill, index) => {
          if (!skill.id) errors.push(`Skill ${index} sem ID`)
          if (!skill.name) errors.push(`Skill ${skill.id || index} sem nome`)
          if (!skill.implementation?.code) {
            errors.push(`Skill ${skill.name || skill.id || index} sem código`)
          }
        })

        // Validar custom nodes
        state.customNodes.forEach((node, index) => {
          if (!node.id) errors.push(`Custom node ${index} sem ID`)
          if (!node.name) errors.push(`Custom node ${node.id || index} sem nome`)
          if (node.skills.length === 0) {
            warnings.push(`Custom node ${node.name || node.id || index} sem skills`)
          }
        })

        // Verificar referências órfãs
        let orphanedReferences = 0
        state.customNodes.forEach((node) => {
          node.skills.forEach((skillRef) => {
            const skillExists = state.skills.some((s) => s.id === skillRef.skillId)
            if (!skillExists) {
              orphanedReferences++
              warnings.push(`Referência órfã: skill ${skillRef.skillId} não encontrada`)
            }
          })
        })

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
          stats: {
            totalSkills: state.skills.length,
            totalCustomNodes: state.customNodes.length,
            orphanedReferences,
          },
        }
      },
    })),
    {
      name: "skills-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        skills: state.skills,
        customNodes: state.customNodes,
        userPreferences: state.userPreferences,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Migração de versões futuras seria implementada aqui
        return persistedState
      },
    },
  ),
)

/**
 * Hook para estatísticas do store
 */
export const useSkillsStats = () => {
  const skills = useSkillsStore((state) => state.skills)
  const customNodes = useSkillsStore((state) => state.customNodes)

  return {
    totalSkills: skills.length,
    totalCustomNodes: customNodes.length,
    skillsByCategory: skills.reduce(
      (acc, skill) => {
        acc[skill.type] = (acc[skill.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
    recentlyUpdated: skills.filter((skill) => {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000
      return new Date(skill.updatedAt).getTime() > dayAgo
    }).length,
  }
}
