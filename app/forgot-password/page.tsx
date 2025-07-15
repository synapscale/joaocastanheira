"use client"

import Link from 'next/link'
import BrandLogo from '../../components/ui/brand-logo'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Simulação de envio (substitua pela integração real)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section with animated gradient */}
      <motion.section 
        className="h-[40vh] min-h-[280px] bg-gradient-to-r from-brand/80 via-brand to-brand-light relative overflow-hidden"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        aria-hidden="true"
      >
        <motion.div 
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHJlY3QgaWQ9InBhdHRlcm4tYmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InRyYW5zcGFyZW50Ij48L3JlY3Q+PGNpcmNsZSBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBjeD0iMjAiIGN5PSIyMCIgcj0iMSI+PC9jaXJjbGU+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIj48L3JlY3Q+PC9zdmc+')]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
        />
      </motion.section>

      {/* Card container */}
      <main className="flex-1 flex items-start justify-center -mt-20 px-4 pb-20">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="backdrop-blur-lg border border-border/40 shadow-xl overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center mb-6 flex flex-col items-center">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <BrandLogo variant="icon" size={48} className="mb-4" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Esqueci minha senha
                  </h2>
                  <p className="text-muted-foreground">
                    Informe seu e-mail para receber instruções de recuperação.
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div 
                      className="text-center space-y-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 20,
                          delay: 0.1 
                        }}
                        className="flex justify-center"
                      >
                        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                      </motion.div>
                      
                      <p className="text-foreground">
                        Se o e-mail informado existir, você receberá as instruções em instantes.
                      </p>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button asChild variant="outline" className="mt-4 w-full gap-2">
                          <Link href="/login">
                            <ArrowLeft className="h-4 w-4" />
                            Voltar para o login
                          </Link>
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.form 
                      onSubmit={handleSubmit} 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="Digite seu email"
                          disabled={loading}
                          autoComplete="email"
                          required
                          className={cn(
                            "transition-all duration-200",
                            error && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <AnimatePresence>
                          {error && (
                            <motion.p 
                              className="text-destructive text-sm px-1"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              {error}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <motion.div
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                      >
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            'Enviar instruções'
                          )}
                        </Button>
                      </motion.div>

                      <div className="mt-4 text-center">
                        <motion.div
                          whileHover={{ x: -3 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Link 
                            href="/login" 
                            className="text-sm text-primary inline-flex items-center gap-1 hover:underline"
                          >
                            <ArrowLeft className="h-3 w-3" />
                            Voltar para o login
                          </Link>
                        </motion.div>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <p className="text-xs text-muted-foreground">
              © 2025 SynapScale. Todos os direitos reservados.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
} 