// Função de mascaramento do app/user-variables/page.tsx
const maskApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return '••••••••••••••••'
  }
  
  if (apiKey.length <= 8) {
    return apiKey // Se for muito curto, mostra tudo
  }
  
  const first4 = apiKey.slice(0, 4)
  const last4 = apiKey.slice(-4)
  const maskedLength = Math.max(4, apiKey.length - 8)
  const masked = '*'.repeat(maskedLength)
  return first4 + masked + last4
}

// Função de mascaramento do components/variables/variable-value-display.tsx
const maskSecretValue = (value) => {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return '••••••••••••••••'
  }
  
  if (value.length <= 8) {
    return value // Se for muito curto, mostra tudo
  }
  
  const first4 = value.slice(0, 4)
  const last4 = value.slice(-4)
  const maskedLength = Math.max(4, value.length - 8)
  const masked = '*'.repeat(maskedLength)
  return first4 + masked + last4
}

// Função de mascaramento do src/app/user-variables/page.tsx
const maskVariableValue = (value) => {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return '••••••••••••••••'
  }
  
  if (value.length <= 8) {
    return value // Se for muito curto, mostra tudo
  }
  
  const first4 = value.slice(0, 4)
  const last4 = value.slice(-4)
  const maskedLength = Math.max(4, value.length - 8)
  const masked = '*'.repeat(maskedLength)
  return first4 + masked + last4
}

// Casos de teste
const testCases = [
  'sk-proj-abcdefghijklmnopqrstuvwxyz1234567890',
  'sk-ant-1234567890abcdefghijklmnopqrstuvwxyz',
  'gsk_abcdefghijklmnopqrstuvwxyz1234567890',
  'pplx-1234567890abcdefghijklmnopqrstuvwxyz',
  'short',
  '',
  null,
  undefined
]

console.log('=== VALIDAÇÃO DAS FUNÇÕES DE MASCARAMENTO ===\n')

testCases.forEach((testCase, index) => {
  console.log(`Teste ${index + 1}: ${testCase || 'null/undefined'}`)
  
  const result1 = maskApiKey(testCase)
  const result2 = maskSecretValue(testCase) 
  const result3 = maskVariableValue(testCase)
  
  console.log(`  maskApiKey:        ${result1}`)
  console.log(`  maskSecretValue:   ${result2}`)
  console.log(`  maskVariableValue: ${result3}`)
  
  // Verificar se todas as funções retornam o mesmo resultado
  if (result1 === result2 && result2 === result3) {
    console.log('  ✅ CONSISTENTE')
  } else {
    console.log('  ❌ INCONSISTENTE')
  }
  console.log('')
})

console.log('=== VALIDAÇÃO ESPECÍFICA DOS PRIMEIROS/ÚLTIMOS 4 ===')
const longKey = 'sk-proj-abcdefghijklmnopqrstuvwxyz1234567890'
const masked = maskApiKey(longKey)
console.log(`Original: ${longKey}`)
console.log(`Mascarado: ${masked}`)
console.log(`Primeiros 4: ${longKey.slice(0, 4)} (${masked.slice(0, 4)})`)
console.log(`Últimos 4: ${longKey.slice(-4)} (${masked.slice(-4)})`)

if (masked.slice(0, 4) === longKey.slice(0, 4) && masked.slice(-4) === longKey.slice(-4)) {
  console.log('✅ Primeiros e últimos 4 caracteres corretos')
} else {
  console.log('❌ Primeiros e últimos 4 caracteres incorretos')
}
