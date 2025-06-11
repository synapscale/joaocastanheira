"use client"

/**
 * @module ExecutionControls
 * @description Componente para controlar a execução do fluxo de trabalho.
 * Permite iniciar, pausar e parar a execução do fluxo.
 */
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, CircleStopIcon as Stop } from "lucide-react"

/**
 * Interface para as propriedades do componente ExecutionControls.
 * @property onStart - Função a ser chamada quando a execução é iniciada.
 * @property onPause - Função a ser chamada quando a execução é pausada.
 * @property onStop - Função a ser chamada quando a execução é interrompida.
 */
interface ExecutionControlsProps {
  onStart: () => void
  onPause: () => void
  onStop: () => void
}

/**
 * Componente ExecutionControls.
 * Renderiza os botões de controle de execução do fluxo de trabalho.
 */
export function ExecutionControls({ onStart, onPause, onStop }: ExecutionControlsProps) {
  const [isRunning, setIsRunning] = useState(false)

  /**
   * Inicia a execução do fluxo de trabalho.
   */
  const handleStart = useCallback(() => {
    setIsRunning(true)
    onStart()
  }, [onStart])

  /**
   * Pausa a execução do fluxo de trabalho.
   */
  const handlePause = useCallback(() => {
    setIsRunning(false)
    onPause()
  }, [onPause])

  /**
   * Interrompe a execução do fluxo de trabalho.
   */
  const handleStop = useCallback(() => {
    setIsRunning(false)
    onStop()
  }, [onStop])

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        disabled={isRunning}
        onClick={handleStart}
        aria-label="Iniciar execução"
        data-testid="start-execution-button"
      >
        <Play className="h-4 w-4 mr-2" />
        Start
      </Button>
      <Button
        variant="outline"
        disabled={!isRunning}
        onClick={handlePause}
        aria-label="Pausar execução"
        data-testid="pause-execution-button"
      >
        <Pause className="h-4 w-4 mr-2" />
        Pause
      </Button>
      <Button
        variant="outline"
        onClick={handleStop}
        aria-label="Interromper execução"
        data-testid="stop-execution-button"
      >
        <Stop className="h-4 w-4 mr-2" />
        Stop
      </Button>
    </div>
  )
}
