import { INTEGRATION_CONFIG, type DataType } from "@/config/node-system-config"
import type { Skill, SkillPort } from "@/types/skill-types"

/**
 * SERVIÇO DE VALIDAÇÃO DE SKILLS
 *
 * Valida skills baseado na configuração centralizada
 * Executa testes automatizados e verifica compatibilidade
 */
export class SkillValidationService {
  private static instance: SkillValidationService

  static getInstance(): SkillValidationService {
    if (!SkillValidationService.instance) {
      SkillValidationService.instance = new SkillValidationService()
    }
    return SkillValidationService.instance
  }

  /**
   * Valida uma skill completamente
   */
  async validateSkill(skill: Skill): Promise<ValidationResult> {
    const results: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      performance: null,
      compatibility: null,
    }

    // Validações básicas
    this.validateBasicStructure(skill, results)
    this.validatePorts(skill.inputs, "input", results)
    this.validatePorts(skill.outputs, "output", results)
    this.validateCode(skill.implementation.code, results)

    // Validações avançadas
    await this.validateExecution(skill, results)
    this.validatePerformance(skill, results)
    this.validateCompatibility(skill, results)

    results.isValid = results.errors.length === 0

    return results
  }

  /**
   * Valida estrutura básica da skill
   */
  private validateBasicStructure(skill: Skill, results: ValidationResult) {
    const config = INTEGRATION_CONFIG.VALIDATION

    if (config.REQUIRE_DESCRIPTIONS && !skill.description) {
      results.errors.push("Descrição é obrigatória")
    }

    if (skill.name.length < config.MIN_NAME_LENGTH) {
      results.errors.push(`Nome deve ter pelo menos ${config.MIN_NAME_LENGTH} caracteres`)
    }

    if (!skill.inputs.length && !skill.outputs.length) {
      results.warnings.push("Skill não possui inputs nem outputs")
    }

    if (!skill.metadata?.tags?.length) {
      results.suggestions.push("Adicione tags para facilitar a descoberta")
    }
  }

  /**
   * Valida portas de entrada e saída
   */
  private validatePorts(ports: SkillPort[], type: "input" | "output", results: ValidationResult) {
    const portIds = new Set<string>()

    ports.forEach((port, index) => {
      // IDs únicos
      if (portIds.has(port.id)) {
        results.errors.push(`${type} duplicado: ${port.id}`)
      }
      portIds.add(port.id)

      // Validação de tipos
      if (INTEGRATION_CONFIG.VALIDATION.STRICT_TYPES) {
        if (!this.isValidDataType(port.dataType)) {
          results.errors.push(`Tipo inválido para ${type} ${port.id}: ${port.dataType}`)
        }
      }

      // Convenções de nomenclatura
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(port.id)) {
        results.warnings.push(`${type} ${port.id} não segue convenção de nomenclatura`)
      }

      // Descrições
      if (!port.description) {
        results.suggestions.push(`Adicione descrição para ${type} ${port.id}`)
      }
    })
  }

  /**
   * Valida código da skill
   */
  private validateCode(code: string, results: ValidationResult) {
    try {
      // Teste de sintaxe
      new Function("inputs", "properties", "context", code)

      // Verificações de segurança
      const dangerousPatterns = [
        /eval\s*\(/,
        /Function\s*\(/,
        /require\s*\(/,
        /import\s*\(/,
        /process\./,
        /global\./,
        /window\./,
      ]

      dangerousPatterns.forEach((pattern) => {
        if (pattern.test(code)) {
          results.warnings.push(`Padrão potencialmente perigoso encontrado: ${pattern.source}`)
        }
      })

      // Verificações de boas práticas
      if (!code.includes("return")) {
        results.errors.push("Código deve conter declaração 'return'")
      }

      if (!code.includes("inputs")) {
        results.warnings.push("Código não utiliza parâmetro 'inputs'")
      }

      if (code.includes("console.log")) {
        results.suggestions.push("Remova console.log antes da produção")
      }
    } catch (error) {
      results.errors.push(`Erro de sintaxe: ${error.message}`)
    }
  }

  /**
   * Valida execução com dados de teste
   */
  private async validateExecution(skill: Skill, results: ValidationResult) {
    try {
      const testCases = this.generateTestCases(skill)

      for (const testCase of testCases) {
        const startTime = performance.now()

        try {
          const result = await this.executeSkillCode(skill.implementation.code, testCase.inputs)
          const executionTime = performance.now() - startTime

          // Verificar se retornou outputs esperados
          skill.outputs.forEach((output) => {
            if (!(output.id in result)) {
              results.warnings.push(`Output '${output.id}' não foi retornado no teste`)
            }
          })

          // Verificar performance
          if (executionTime > INTEGRATION_CONFIG.EXECUTION.DEFAULT_TIMEOUT) {
            results.warnings.push(`Execução lenta detectada: ${executionTime.toFixed(2)}ms`)
          }
        } catch (error) {
          results.errors.push(`Erro na execução: ${error.message}`)
        }
      }
    } catch (error) {
      results.errors.push(`Erro ao gerar casos de teste: ${error.message}`)
    }
  }

  /**
   * Gera casos de teste automaticamente
   */
  private generateTestCases(skill: Skill): TestCase[] {
    const testCases: TestCase[] = []

    // Caso básico - valores padrão
    const basicInputs: Record<string, any> = {}
    skill.inputs.forEach((input) => {
      basicInputs[input.id] = this.getDefaultValueForType(input.dataType)
    })
    testCases.push({ name: "Valores padrão", inputs: basicInputs })

    // Caso com valores nulos (para inputs opcionais)
    const nullInputs: Record<string, any> = {}
    skill.inputs.forEach((input) => {
      nullInputs[input.id] = input.required ? this.getDefaultValueForType(input.dataType) : null
    })
    testCases.push({ name: "Valores nulos", inputs: nullInputs })

    // Casos extremos
    const extremeInputs: Record<string, any> = {}
    skill.inputs.forEach((input) => {
      extremeInputs[input.id] = this.getExtremeValueForType(input.dataType)
    })
    testCases.push({ name: "Valores extremos", inputs: extremeInputs })

    return testCases
  }

  /**
   * Executa código da skill em sandbox
   */
  private async executeSkillCode(code: string, inputs: Record<string, any>): Promise<any> {
    const context = {
      console: {
        log: (...args: any[]) => {}, // Silenciar logs em testes
      },
    }

    const func = new Function("inputs", "properties", "context", code)
    return await func(inputs, {}, context)
  }

  /**
   * Valida performance da skill
   */
  private validatePerformance(skill: Skill, results: ValidationResult) {
    const codeLength = skill.implementation.code.length

    if (codeLength > 10000) {
      results.warnings.push("Código muito longo, considere dividir em funções menores")
    }

    // Verificar complexidade ciclomática básica
    const complexityIndicators = [/if\s*\(/g, /for\s*\(/g, /while\s*\(/g, /switch\s*\(/g, /catch\s*\(/g]

    let complexity = 1
    complexityIndicators.forEach((pattern) => {
      const matches = skill.implementation.code.match(pattern)
      if (matches) complexity += matches.length
    })

    if (complexity > 10) {
      results.warnings.push(`Alta complexidade detectada (${complexity}), considere refatorar`)
    }

    results.performance = {
      codeLength,
      estimatedComplexity: complexity,
    }
  }

  /**
   * Valida compatibilidade com canvas principal
   */
  private validateCompatibility(skill: Skill, results: ValidationResult) {
    const compatibility = {
      canvasVersion: "1.0.0",
      supportedFeatures: [] as string[],
      limitations: [] as string[],
    }

    // Verificar recursos utilizados
    if (skill.implementation.code.includes("fetch")) {
      compatibility.supportedFeatures.push("HTTP Requests")
    }

    if (skill.implementation.code.includes("await")) {
      compatibility.supportedFeatures.push("Async Operations")
    }

    // Verificar limitações
    if (skill.implementation.dependencies?.length) {
      compatibility.limitations.push("Requer dependências externas")
    }

    results.compatibility = compatibility
  }

  /**
   * Verifica se é um tipo de dados válido
   */
  private isValidDataType(dataType: string): boolean {
    const validTypes: DataType[] = [
      "string",
      "number",
      "boolean",
      "array",
      "object",
      "date",
      "buffer",
      "any",
      "json",
      "xml",
      "csv",
      "html",
      "binary",
    ]
    return validTypes.includes(dataType as DataType)
  }

  /**
   * Obtém valor padrão para tipo
   */
  private getDefaultValueForType(dataType: DataType): any {
    const defaults: Record<DataType, any> = {
      string: "test",
      number: 42,
      boolean: true,
      array: [1, 2, 3],
      object: { key: "value" },
      date: new Date().toISOString(),
      buffer: Buffer.from("test"),
      any: "test",
      json: { test: true },
      xml: "<root><test>value</test></root>",
      csv: "header1,header2\nvalue1,value2",
      html: "<div>test</div>",
      binary: new Uint8Array([1, 2, 3]),
    }
    return defaults[dataType]
  }

  /**
   * Obtém valor extremo para tipo
   */
  private getExtremeValueForType(dataType: DataType): any {
    const extremes: Record<DataType, any> = {
      string: "a".repeat(1000),
      number: Number.MAX_SAFE_INTEGER,
      boolean: false,
      array: new Array(1000).fill(0),
      object: {},
      date: new Date("1970-01-01").toISOString(),
      buffer: Buffer.alloc(1000),
      any: null,
      json: {},
      xml: "<root></root>",
      csv: "",
      html: "",
      binary: new Uint8Array(1000),
    }
    return extremes[dataType]
  }
}

// Tipos para validação
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  performance: {
    codeLength: number
    estimatedComplexity: number
  } | null
  compatibility: {
    canvasVersion: string
    supportedFeatures: string[]
    limitations: string[]
  } | null
}

interface TestCase {
  name: string
  inputs: Record<string, any>
}

// Instância singleton
export const skillValidator = SkillValidationService.getInstance()
