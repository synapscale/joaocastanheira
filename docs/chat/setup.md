# Configuração e Setup - Sistema de Chat

## Pré-requisitos

### Dependências do Sistema
- **Node.js** 18+ 
- **npm** ou **yarn**
- **Next.js** 15.3.2+
- **React** 18+
- **TypeScript** 5+

### Dependências do Projeto
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "next": "^15.3.2",
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.400.0",
    "react-markdown": "^9.0.0",
    "react-hook-form": "^7.45.0",
    "@radix-ui/react-toast": "^1.1.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-button": "^1.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.3.2",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

## Instalação

### 1. Clone e Instalação
```bash
# Clone do repositório
git clone <repository-url>
cd joaocastanheira

# Instalação de dependências
npm install
# ou
yarn install
```

### 2. Configuração de Ambiente

#### Arquivo `.env.local`
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# LLM Provider API Keys (opcional - podem ser configuradas por usuário)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Chat Configuration
NEXT_PUBLIC_CHAT_DEFAULT_MODEL=gpt-4o
NEXT_PUBLIC_CHAT_DEFAULT_PROVIDER=openai
NEXT_PUBLIC_CHAT_MAX_TOKENS=4000
NEXT_PUBLIC_CHAT_TEMPERATURE=0.7

# Feature Flags
NEXT_PUBLIC_OFFLINE_MODE=true
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_ANALYTICS_ENABLED=false

# Limits
NEXT_PUBLIC_MAX_MESSAGE_LENGTH=4000
NEXT_PUBLIC_MAX_CONVERSATIONS=100
NEXT_PUBLIC_MAX_MESSAGES_PER_CONVERSATION=1000

# Security
NEXT_PUBLIC_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

#### Arquivo `.env.example`
```env
# Copie este arquivo para .env.local e configure as variáveis

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# LLM Provider API Keys
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_API_KEY=your_google_key_here

# Chat Configuration
NEXT_PUBLIC_CHAT_DEFAULT_MODEL=gpt-4o
NEXT_PUBLIC_CHAT_DEFAULT_PROVIDER=openai
NEXT_PUBLIC_CHAT_MAX_TOKENS=4000
NEXT_PUBLIC_CHAT_TEMPERATURE=0.7

# Feature Flags
NEXT_PUBLIC_OFFLINE_MODE=true
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

### 3. Configuração do Backend

O sistema de chat requer um backend com os seguintes endpoints:

#### Endpoints Obrigatórios
```
GET    /api/v1/conversations/
POST   /api/v1/conversations/
GET    /api/v1/conversations/{id}/messages/
POST   /api/v1/conversations/{id}/messages/
PUT    /api/v1/conversations/{id}/title
DELETE /api/v1/conversations/{id}
POST   /api/v1/llm/chat
```

#### Endpoints de Fallback
```
POST   /api/chat  (fallback simples)
```

## Configuração de Desenvolvimento

### 1. Scripts de Desenvolvimento
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test"
  }
}
```

### 2. Configuração do TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"],
      "@/context/*": ["./context/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Configuração do Tailwind CSS
```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### 4. Configuração de CSS Global
```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Chat specific styles */
.chat-interface {
  @apply flex flex-col h-full;
}

.chat-messages {
  @apply flex-1 overflow-y-auto;
}

.chat-message {
  @apply mb-4;
}

.chat-message-user {
  @apply ml-auto flex-row-reverse;
}

.chat-message-assistant {
  @apply mr-auto;
}

.typing-indicator {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.typing-dot {
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}
```

## Configuração de Produção

### 1. Variáveis de Ambiente de Produção
```env
# Production .env
NODE_ENV=production

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1

# Feature Flags
NEXT_PUBLIC_OFFLINE_MODE=true
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_ANALYTICS_ENABLED=true

# Security
NEXT_PUBLIC_ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Configuração do Next.js
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['api.yourdomain.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
```

### 3. Build e Deploy
```bash
# Build para produção
npm run build

# Verificar build
npm run start

# Deploy (exemplo com Vercel)
npm install -g vercel
vercel --prod
```

## Configuração de API Keys

### 1. Configuração por Usuário
O sistema permite que usuários configurem suas próprias chaves de API:

```typescript
// Exemplo de configuração via interface
const userApiKeys = {
  openai: 'sk-user-key...',
  anthropic: 'sk-ant-user-key...',
  google: 'user-google-key...'
}

// Salvar no localStorage ou banco de dados
localStorage.setItem('user-api-keys', JSON.stringify(userApiKeys))
```

### 2. Configuração do Sistema
Chaves de API do sistema como fallback:

```env
# Sistema de fallback para chaves de API
OPENAI_API_KEY=sk-system-key...
ANTHROPIC_API_KEY=sk-ant-system-key...
GOOGLE_API_KEY=system-google-key...
```

### 3. Validação de Chaves
```typescript
// lib/utils/api-key-validator.ts
export function validateApiKey(provider: string, apiKey: string): boolean {
  const patterns = {
    openai: /^sk-[a-zA-Z0-9]{48}$/,
    anthropic: /^sk-ant-[a-zA-Z0-9-]{95}$/,
    google: /^[a-zA-Z0-9-_]{39}$/
  }
  
  return patterns[provider]?.test(apiKey) || false
}
```

## Configuração de Desenvolvimento Local

### 1. Setup Rápido
```bash
# Script de setup automático
./setup-dev.sh
```

```bash
#!/bin/bash
# setup-dev.sh

echo "🚀 Configurando ambiente de desenvolvimento..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Copiar arquivo de ambiente
echo "⚙️ Configurando variáveis de ambiente..."
cp .env.example .env.local

# Verificar configuração
echo "🔍 Verificando configuração..."
npm run type-check

# Iniciar desenvolvimento
echo "🎉 Iniciando servidor de desenvolvimento..."
npm run dev
```

### 2. Docker (Opcional)
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:8000/api/v1
    depends_on:
      - backend
  
  backend:
    image: your-backend-image
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/chatdb
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=chatdb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Troubleshooting de Setup

### Problemas Comuns

#### 1. Erro de Conexão com API
```
Error: fetch failed - TypeError: fetch failed
```

**Solução:**
- Verificar se `NEXT_PUBLIC_API_BASE_URL` está correto
- Confirmar se backend está rodando
- Verificar CORS no backend

#### 2. Modelos não Funcionam
```
Error: Model 'chatgpt-4o' not found
```

**Solução:**
- Verificar mapeamento em `lib/utils/model-mapper.ts`
- Confirmar chaves de API configuradas
- Usar modelo correto: `gpt-4o` em vez de `chatgpt-4o`

#### 3. Mensagens não Salvam
```
Error: 404 - /api/v1/conversations/123/messages/
```

**Solução:**
- Verificar se endpoints estão implementados no backend
- Confirmar autenticação/autorização
- Verificar logs do backend

#### 4. Problemas de TypeScript
```
Error: Cannot find module '@/components/...'
```

**Solução:**
- Verificar `tsconfig.json` paths
- Confirmar estrutura de pastas
- Reinstalar dependências

### Scripts de Diagnóstico

```bash
# Verificar configuração
npm run config-check

# Testar conexão com API
npm run api-test

# Verificar tipos
npm run type-check

# Limpar cache
npm run clean
```

```json
// package.json - scripts adicionais
{
  "scripts": {
    "config-check": "node scripts/check-config.js",
    "api-test": "node scripts/test-api.js",
    "clean": "rm -rf .next node_modules package-lock.json && npm install"
  }
}
``` 