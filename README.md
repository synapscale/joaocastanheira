# SynapScale - Plataforma de Workflow e IA

## Sobre o Projeto

SynapScale é uma plataforma completa para criação, gerenciamento e automação de workflows com integração de IA. A plataforma oferece um canvas visual para design de fluxos de trabalho, chat interativo com IA, marketplace de templates, gerenciamento de agentes e documentação completa.

## Requisitos

- Node.js 18.0.0 ou superior
- npm 8.0.0 ou superior

## Instalação

Siga os passos abaixo para configurar o projeto em seu ambiente local:

1. Clone o repositório:
```bash
git clone https://seu-repositorio/synapscale.git
cd synapscale
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env.local` na raiz do projeto
   - Adicione as seguintes variáveis (substitua pelos valores corretos):
```
NEXT_PUBLIC_API_URL=https://api.exemplo.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Executando o Projeto

### Ambiente de Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000).

### Build de Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Para iniciar o servidor de produção após o build:

```bash
npm run start
```

## Estrutura do Projeto

```
/
├── app/                    # Rotas e páginas da aplicação (Next.js App Router)
├── components/             # Componentes reutilizáveis
│   ├── chat/               # Componentes específicos do chat
│   ├── ui/                 # Componentes de interface genéricos
│   └── ...
├── context/                # Contextos React para gerenciamento de estado
├── hooks/                  # Hooks personalizados
├── lib/                    # Utilitários e funções auxiliares
├── public/                 # Arquivos estáticos
├── styles/                 # Estilos globais e configurações de tema
└── types/                  # Definições de tipos TypeScript
```

## Principais Funcionalidades

### Canvas de Workflow
- Design visual de fluxos de trabalho
- Nós de trigger, processo e tarefas de IA
- Conexões personalizáveis entre nós

### Chat Interativo
- Conversas com modelos de IA avançados
- Seleção de ferramentas e personalidades
- Histórico de conversas e exportação

### Marketplace
- Templates prontos para uso
- Categorias e filtros de busca
- Estatísticas de uso e avaliações

### Agentes de IA
- Criação e gerenciamento de agentes personalizados
- Configuração de modelos e capacidades
- Monitoramento de desempenho

## Solução de Problemas

### Erros de Build

Se encontrar erros durante o build:

1. Verifique se todas as dependências estão instaladas:
```bash
npm install
```

2. Limpe o cache do Next.js:
```bash
npm run clean
```

3. Verifique se há erros de tipagem:
```bash
npm run type-check
```

### Problemas de Renderização

Se componentes não renderizarem corretamente:

1. Verifique se a diretiva `"use client"` está presente nos componentes que usam hooks
2. Verifique se o tema está configurado corretamente
3. Limpe o cache do navegador

## Contribuição

Para contribuir com o projeto:

1. Crie um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Envie para o branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
