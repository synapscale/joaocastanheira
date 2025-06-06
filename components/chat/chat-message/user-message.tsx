import { Avatar } from "@/components/ui/avatar"
import type { ReactNode } from "react"
import { Message } from "@/types/chat"

interface UserMessageProps {
  message: Message
  showSender?: boolean
  isLastMessage?: boolean
}

export function UserMessage({ message, showSender = true, isLastMessage = false }: UserMessageProps) {
  return (
    <div
      className="flex justify-end my-4 group"
      data-component="ChatMessage"
      data-component-path="@/components/chat/chat-message"
    >
      <div className="max-w-3xl bg-primary/10 dark:bg-primary/20 rounded-2xl p-4 text-gray-800 dark:text-gray-200 shadow-sm border border-primary/5 dark:border-primary/10 transition-all duration-200">
        {message.content}
      </div>
      <Avatar className="h-8 w-8 ml-3 bg-teal-600 text-white shadow-sm">
        <span>J</span>
      </Avatar>
    </div>
  )
}

// Adicionar export default para compatibilidade com importações existentes
export default UserMessage
