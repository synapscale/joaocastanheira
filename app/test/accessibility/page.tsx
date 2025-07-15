// Página de teste de acessibilidade desativada temporariamente para depuração de requests automáticos
//
// import React, { useRef, useEffect, useState } from 'react'
// import { LoginForm } from '@/components/auth/login-form'
// import { AccessibilityTestSuite } from '@/components/ui/accessibility-test-tools'
// import { ArrowLeft, TestTube2 } from 'lucide-react'
// import Link from 'next/link'
//
// export default function AccessibilityTestPage() {
//   const formRef = useRef<HTMLDivElement>(null)
//   const [formElement, setFormElement] = useState<HTMLElement | null>(null)
//
//   useEffect(() => {
//     if (formRef.current) {
//       setFormElement(formRef.current)
//     }
//   }, [])
//
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-brand/20 via-gray-50 to-brand-light/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
//       <div className="container mx-auto px-4 py-8">
//         {/* ...restante do código comentado... */}
//       </div>
//     </div>
//   )
// } 