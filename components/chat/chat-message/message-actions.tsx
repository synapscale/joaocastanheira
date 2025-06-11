"use client"

import type React from "react"
import { Message } from "@/types/chat"
import { Copy, ThumbsUp, ThumbsDown, MoreVertical, Repeat, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface MessageActionsProps {
  message: Message
}

export function MessageActions({ message }: MessageActionsProps) {
  // Implementação simplificada para compatibilidade
  const [copied, setCopied] = React.useState(false)
  const [liked, setLiked] = React.useState<boolean | null>(null)

  const copyToClipboard = () => {
    if (typeof message.content === 'string') {
      navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const regenerateResponse = () => {
    // Implementação simplificada
    console.log('Regenerar resposta')
  }

  return (
    <div className="flex items-center justify-end space-x-1 mt-1">
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? "Copiado!" : "Copiar"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-full transition-colors duration-150 ${
                  liked === true
                    ? "text-green-500 bg-green-50 dark:bg-green-900/30"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setLiked(true)}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Curtir</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-full transition-colors duration-150 ${
                  liked === false
                    ? "text-red-500 bg-red-50 dark:bg-red-900/30"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setLiked(false)}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Não curtir</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                onClick={regenerateResponse}
              >
                <Repeat className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Regenerar resposta</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
            >
              <MoreVertical className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
          >
            <DropdownMenuItem
              onClick={copyToClipboard}
              className="text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700"
            >
              <Copy className="h-3.5 w-3.5 mr-2" /> Copiar texto
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={regenerateResponse}
              className="text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700"
            >
              <Repeat className="h-3.5 w-3.5 mr-2" /> Regenerar resposta
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20">
              <X className="h-3.5 w-3.5 mr-2" /> Descartar resposta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Adicione o ícone X que está faltando
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

// Adicionar export default para compatibilidade com importações existentes
export default MessageActions
