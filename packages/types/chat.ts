export interface ChatPreset {
  id: string;
  name: string;
  description?: string;
  isFavorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
  model?: string;
  isError?: boolean;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  metadata?: Record<string, any>;
}
