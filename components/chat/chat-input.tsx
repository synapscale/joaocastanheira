"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useTextarea } from "@/hooks/use-textarea"
import { Paperclip, ArrowRight } from "lucide-react"
import { useApp } from "@/context/app-context"
import ModelSelector from "@/components/chat/model-selector"
import ToolSelector, { DEFAULT_TOOLS } from "@/components/chat/tool-selector"
import PersonalitySelector, { DEFAULT_PERSONALITIES } from "@/components/chat/personality-selector"
import PresetSelector from "@/components/chat/preset-selector"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  disabled: boolean
  isDragOver: boolean
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  showConfig: boolean
  onToggleConfig?: () => void
}

export function ChatInput({
  onSendMessage,
  isLoading,
  disabled,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  showConfig,
  onToggleConfig,
}: ChatInputProps) {
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const appContext = useApp()

  const handleSubmit = () => {
    if (textarea.value.trim() && !isLoading && !disabled) {
      onSendMessage(textarea.value)
      textarea.resetTextarea()
    }
  }

  const textarea = useTextarea({
    onSubmit: handleSubmit,
  })

  return (
    <div
      className="chat-input-container bg-white dark:bg-gray-900 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      ref={chatAreaRef}
      style={{boxShadow: "0 2px 10px rgba(0,0,0,0.08)"}}
    >
      <div className="relative">
        <textarea
          ref={textarea.textareaRef}
          value={textarea.value}
          onChange={textarea.handleInput}
          onKeyDown={textarea.handleKeyDown}
          placeholder={
            isDragOver ? "Solte o componente aqui..." : "Pergunte alguma coisa..."
          }
          className="chat-input-textarea w-full resize-none border-0 bg-transparent p-3 outline-none focus:ring-0 dark:text-gray-100"
          style={{ height: "auto", minHeight: "52px" }}
          disabled={disabled}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />
      </div>

      {/* Linha com dropdowns (condicionais) e botões de ação (sempre visíveis) */}
      <div className="flex items-center justify-between px-2 py-1 bg-white dark:bg-gray-900">
        {/* Dropdowns à esquerda - Só mostra se showConfig for true */}
        {showConfig && (
          <div className="flex items-center space-x-1 text-[7px] max-w-[50%]">
            {/* Model Selector com menu interativo */}
            <div className="relative inline-block">
              {appContext?.selectedModel && (
                <ModelSelector
                  models={[
                    { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", description: "Modelo mais recente e avançado da OpenAI", capabilities: { text: true, vision: true, files: true, fast: true }, contextLength: 128000 },
                    { id: "gpt-4", name: "GPT-4", provider: "OpenAI", description: "Modelo avançado com raciocínio sofisticado", capabilities: { text: true, vision: false, files: true, fast: false }, contextLength: 8192 },
                    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI", description: "Modelo rápido e eficiente", capabilities: { text: true, vision: false, files: false, fast: true }, contextLength: 4096 }
                  ]}
                  selectedModel={appContext.selectedModel}
                  onModelSelect={(model) => {
                    if (appContext?.setSelectedModel) {
                      appContext.setSelectedModel(model);
                    }
                  }}
                  size="xs"
                />
              )}
            </div>

            {/* Tool Selector com menu interativo */}
            <div className="relative inline-block">
              <ToolSelector
                tools={DEFAULT_TOOLS}
                onToolSelect={(tool) => {
                  if (appContext?.setToolsEnabled) {
                    appContext.setToolsEnabled(tool.id === "enabled");
                  }
                }}
                size="xs"
                buttonIcon={<span className="text-yellow-500 dark:text-yellow-400 text-[8px]">✦</span>}
                buttonLabel={appContext?.toolsEnabled ? "enabled" : "disabled"}
              />
            </div>

            {/* Personality Selector com menu interativo */}
            <div className="relative inline-block">
              <PersonalitySelector
                personalities={DEFAULT_PERSONALITIES}
                onPersonalitySelect={(personality) => {
                  if (appContext?.setPersonality) {
                    appContext.setPersonality(personality.id);
                  }
                }}
                size="xs"
                buttonIcon={<span className="text-blue-500 dark:text-gray-400 text-[8px]">❄</span>}
                buttonLabel={appContext?.personality || "natural"}
              />
            </div>

            {/* Preset Selector com menu interativo */}
            <div className="relative inline-block">
              <PresetSelector />
            </div>
          </div>
        )}
        
        {/* Botões de ação sempre visíveis à direita */}
        <div className="flex items-center space-x-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="chat-button h-5 w-5 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-[0.8rem] w-[0.8rem]" />
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const newFiles = Array.from(e.target.files);
                  setUploadedFiles(prev => [...prev, ...newFiles]);
                }
              }}
              multiple
            />
          </Button>
          <Button
            size="icon"
            className="h-5 w-5 rounded-full text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #f35500, #ff7e00)' }}
            onClick={handleSubmit}
            disabled={!textarea.value.trim() || isLoading || disabled}
          >
            <ArrowRight className="h-[0.8rem] w-[0.8rem]" />
          </Button>
        </div>
      </div>
    </div>
  )
}
