/**
 * Utilitários para manipulação segura de JSON
 */

/**
 * Faz parse seguro de JSON, retornando um valor padrão em caso de erro
 */
export function safeJsonParse<T = any>(
  jsonString: string | null | undefined,
  defaultValue: T = null as T
): T {
  if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') {
    return defaultValue
  }

  try {
    const parsed = JSON.parse(jsonString)
    return parsed !== undefined ? parsed : defaultValue
  } catch (error) {
    console.warn('JSON Parse Error:', error, 'Input:', jsonString)
    return defaultValue
  }
}

/**
 * Faz parse seguro de JSON com validação de tipo
 */
export function safeJsonParseWithValidation<T>(
  jsonString: string | null | undefined,
  validator: (data: any) => data is T,
  defaultValue: T
): T {
  const parsed = safeJsonParse(jsonString, defaultValue)
  
  if (validator(parsed)) {
    return parsed
  }
  
  console.warn('JSON Parse Validation Failed:', parsed)
  return defaultValue
}

/**
 * Faz parse seguro de resposta de API
 */
export async function safeParseApiResponse<T = any>(
  response: Response,
  defaultValue: T = null as T
): Promise<T> {
  try {
    const contentType = response.headers.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Response is not JSON:', contentType)
      return defaultValue
    }

    const text = await response.text()
    return safeJsonParse(text, defaultValue)
  } catch (error) {
    console.error('Error parsing API response:', error)
    return defaultValue
  }
}

/**
 * Stringify seguro que não falha
 */
export function safeJsonStringify(
  data: any,
  defaultValue: string = '{}',
  space?: number
): string {
  try {
    return JSON.stringify(data, null, space)
  } catch (error) {
    console.warn('JSON Stringify Error:', error, 'Data:', data)
    return defaultValue
  }
}

/**
 * Verifica se uma string é um JSON válido
 */
export function isValidJson(jsonString: string): boolean {
  if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') {
    return false
  }

  try {
    JSON.parse(jsonString)
    return true
  } catch {
    return false
  }
}

/**
 * Parse seguro para localStorage
 */
export function safeLocalStorageParse<T = any>(
  key: string,
  defaultValue: T = null as T
): T {
  if (typeof window === 'undefined') {
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    return safeJsonParse(item, defaultValue)
  } catch (error) {
    console.warn('LocalStorage Parse Error:', error, 'Key:', key)
    return defaultValue
  }
}

/**
 * Set seguro para localStorage
 */
export function safeLocalStorageSet(key: string, value: any): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const jsonString = safeJsonStringify(value)
    localStorage.setItem(key, jsonString)
    return true
  } catch (error) {
    console.warn('LocalStorage Set Error:', error, 'Key:', key, 'Value:', value)
    return false
  }
} 