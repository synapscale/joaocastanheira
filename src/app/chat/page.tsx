'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { config, getApiUrl } from '@/lib/config';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userInput]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl(config.endpoints.chat.http), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userInput.text,
          history: messages.map((m) => ({ role: m.sender, content: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao obter resposta do agente');
      }

      const data = await response.json();
      const replyText =
        (typeof data === 'string' && data) ||
        data.reply ||
        data.message?.content ||
        data.message ||
        data.content ||
        '';

      const agentResponse: Message = {
        id: Date.now().toString() + '_agent',
        text: replyText,
        sender: 'agent'
      };

      setMessages((prevMessages) => [...prevMessages, agentResponse]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorResponse: Message = {
        id: Date.now().toString() + '_error',
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        sender: 'agent',
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-3xl mx-auto bg-white shadow-xl rounded-lg">
      <header className="bg-slate-700 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-semibold">Chat com Agente Vertical</h1>
      </header>

      <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${ 
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-slate-100 rounded-b-lg">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}

