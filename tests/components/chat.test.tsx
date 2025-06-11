/**
 * Testes para Componentes de Chat
 * 
 * Este arquivo contém testes unitários para os componentes principais do chat.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '@/contexts/app-context';
import ChatInterface from '@/components/chat/chat-interface';
import ChatInput from '@/components/chat/chat-input';
import ChatMessage from '@/components/chat/chat-message';
import MessagesArea from '@/components/chat/messages-area';
import ModelSelector from '@/components/chat/model-selector';
import ToolSelector from '@/components/chat/tool-selector';
import PersonalitySelector from '@/components/chat/personality-selector';

// Mock dos hooks e contextos
jest.mock('@/contexts/app-context', () => ({
  useAppContext: () => ({
    conversations: [],
    currentConversationId: 'test-conversation',
    setCurrentConversationId: jest.fn(),
    addConversation: jest.fn(),
    updateConversation: jest.fn(),
    deleteConversation: jest.fn(),
    clearConversations: jest.fn(),
    isComponentSelectorActive: false,
    setComponentSelectorActive: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  }),
  AppProvider: ({ children }) => <div data-testid="app-provider">{children}</div>,
}));

// Mock das funções de utilidade
jest.mock('@/lib/ai-utils', () => ({
  estimateTokenCount: (text) => Math.ceil(text.length / 4),
  sendChatMessage: jest.fn().mockResolvedValue({ reply: 'Resposta de teste' }),
  executeWorkflowFromChat: jest.fn(),
  getWorkflowNodeInfo: jest.fn(),
}));

describe('ChatInterface', () => {
  it('renderiza corretamente', () => {
    render(
      <AppProvider>
        <ChatInterface />
      </AppProvider>
    );
    
    expect(screen.getByTestId('app-provider')).toBeInTheDocument();
  });
});

describe('ChatInput', () => {
  it('renderiza corretamente', () => {
    const handleSendMessage = jest.fn();
    render(<ChatInput onSendMessage={handleSendMessage} />);
    
    expect(screen.getByPlaceholderText('Digite sua mensagem...')).toBeInTheDocument();
  });
  
  it('chama onSendMessage quando o botão de envio é clicado', () => {
    const handleSendMessage = jest.fn();
    render(<ChatInput onSendMessage={handleSendMessage} />);
    
    const input = screen.getByPlaceholderText('Digite sua mensagem...');
    fireEvent.change(input, { target: { value: 'Mensagem de teste' } });
    
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
    fireEvent.click(sendButton);
    
    expect(handleSendMessage).toHaveBeenCalledWith('Mensagem de teste', undefined);
  });
  
  it('desabilita o botão de envio quando a mensagem está vazia', () => {
    const handleSendMessage = jest.fn();
    render(<ChatInput onSendMessage={handleSendMessage} />);
    
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
    expect(sendButton).toBeDisabled();
  });
});

describe('ChatMessage', () => {
  const mockMessage = {
    id: 'msg_1',
    role: 'user',
    content: 'Mensagem de teste',
    timestamp: Date.now(),
    status: 'sent',
  };
  
  it('renderiza mensagem do usuário corretamente', () => {
    render(<ChatMessage message={mockMessage} />);
    
    expect(screen.getByText('Mensagem de teste')).toBeInTheDocument();
  });
});

describe('MessagesArea', () => {
  const mockMessages = [
    {
      id: 'msg_1',
      role: 'user',
      content: 'Olá',
      timestamp: Date.now(),
      status: 'sent',
    },
    {
      id: 'msg_2',
      role: 'assistant',
      content: 'Como posso ajudar?',
      timestamp: Date.now(),
      status: 'sent',
    },
  ];
  
  it('renderiza mensagens corretamente', () => {
    render(<MessagesArea messages={mockMessages} isLoading={false} />);
    
    expect(screen.getByText('Olá')).toBeInTheDocument();
    expect(screen.getByText('Como posso ajudar?')).toBeInTheDocument();
  });
  
  it('mostra indicador de carregamento quando isLoading é true', () => {
    render(<MessagesArea messages={mockMessages} isLoading={true} />);
    
    expect(screen.getByText('Processando...')).toBeInTheDocument();
  });
  
  it('mostra mensagem de boas-vindas quando não há mensagens', () => {
    render(<MessagesArea messages={[]} isLoading={false} />);
    
    expect(screen.getByText(/Nenhuma mensagem ainda/i)).toBeInTheDocument();
  });
});

describe('ModelSelector', () => {
  it('renderiza corretamente', () => {
    render(<ModelSelector />);
    
    expect(screen.getByText('GPT-4o')).toBeInTheDocument();
  });
  
  it('abre o dropdown quando clicado', () => {
    render(<ModelSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Selecione um modelo')).toBeInTheDocument();
  });
});

describe('ToolSelector', () => {
  it('renderiza corretamente', () => {
    render(<ToolSelector />);
    
    expect(screen.getByText('Nenhuma')).toBeInTheDocument();
  });
  
  it('abre o dropdown quando clicado', () => {
    render(<ToolSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Selecione uma ferramenta')).toBeInTheDocument();
  });
});

describe('PersonalitySelector', () => {
  it('renderiza corretamente', () => {
    render(<PersonalitySelector />);
    
    expect(screen.getByText('Padrão')).toBeInTheDocument();
  });
  
  it('abre o dropdown quando clicado', () => {
    render(<PersonalitySelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Selecione uma personalidade')).toBeInTheDocument();
  });
});
