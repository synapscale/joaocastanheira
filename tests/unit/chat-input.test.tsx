"use client";

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatInput } from '@/components/chat/chat-input';
import { AppProvider } from '@/context/app-context';

// Mock dos hooks e funções necessárias
jest.mock('@/hooks/use-textarea', () => ({
  useTextarea: jest.fn().mockImplementation(() => ({
    textareaRef: { current: global.document.createElement('textarea') },
    value: '',
    setValue: jest.fn(),
    handleChange: jest.fn(),
    resetTextarea: jest.fn(),
    handleInput: jest.fn(),
    handleKeyDown: jest.fn(),
  })),
}));

describe('ChatInput', () => {
  const mockSendMessage = jest.fn();
  const defaultProps = {
    onSendMessage: mockSendMessage,
    isLoading: false,
    disabled: false,
    isDragOver: false,
    onDragOver: jest.fn(),
    onDragLeave: jest.fn(),
    onDrop: jest.fn(),
    showConfig: false,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renderiza o componente de entrada de chat', () => {
    render(
      <AppProvider>
        <ChatInput
          {...defaultProps}
        />
      </AppProvider>
    );
    
    // Verifica se o textarea está presente
    const textarea = screen.getByPlaceholderText('Pergunte alguma coisa...');
    expect(textarea).toBeInTheDocument();
    
    // Verifica se o botão de enviar está presente (busca pelo role, pois não há label)
    const sendButtons = screen.getAllByRole('button');
    expect(sendButtons.length).toBeGreaterThan(0);
  });
  
  it('desabilita o botão de enviar quando está carregando', () => {
    render(
      <AppProvider>
        <ChatInput
          {...defaultProps}
          isLoading={true}
        />
      </AppProvider>
    );
    // O botão de envio é o último botão (ícone ArrowRight)
    const sendButtons = screen.getAllByRole('button');
    const sendButton = sendButtons[sendButtons.length - 1];
    expect(sendButton).toBeDisabled();
  });
});
