# Template de Agente Vertical Avançado

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Este repositório contém um template avançado e robusto para a criação de agentes verticais de IA. Ele é projetado para ser modular, escalável, fácil de reutilizar e altamente configurável, incorporando melhores práticas de engenharia de software, engenharia de prompt, RAG (Retrieval Augmented Generation) e suporte a múltiplos Provedores de Modelos de Linguagem (LLMs).

## Visão Geral

O template segue uma estrutura complexa que separa as preocupações em diferentes módulos, permitindo o desenvolvimento independente e a manutenção facilitada de cada componente do agente. Ele inclui:

*   **Agente Principal (Main Agent):** Orquestra a lógica geral, interage com o usuário, gerencia a memória de chat e delega tarefas para subagentes especializados.
*   **Subagentes (Sub-agents):** Módulos especializados que lidam com tarefas específicas.
*   **Suporte Multi-LLM:** Flexibilidade para escolher e alternar entre diversos provedores de LLM (OpenAI, Google Gemini, Anthropic Claude, Groq, Hugging Face Hub) para cada agente ou subagente.
*   **Configuração Centralizada e por Agente:** Variáveis de ambiente (`config/.env`) para credenciais globais e arquivos de configuração YAML (`config.yaml` em cada agente) para fácil customização de LLMs, prompts, ferramentas, etc.
*   **Integração com Redis:** Para memória de chat persistente e eficiente.
*   **Integração com Supabase (pgvector):** Para knowledge base vetorial e RAG.
*   **Modelos de Prompt Avançados:** Templates Jinja2 para engenharia de prompt flexível.
*   **Schemas de Input/Output:** Validação de dados para garantir a integridade das interações.
*   **Estrutura para Testes, CI/CD, Logging e Deploy.**

## Estrutura do Projeto

Consulte `docs/architecture.md` para uma descrição detalhada da arquitetura do projeto, incluindo o sistema Multi-LLM.

## Primeiros Passos

### Pré-requisitos

*   Python 3.9+
*   Docker (opcional, para containerização e execução de serviços como Redis)
*   Acesso a uma instância do Redis
*   Uma conta Supabase com um projeto configurado (e a extensão `pgvector` habilitada)
*   Chaves de API para os provedores de LLM que você pretende usar (ex: OpenAI, Google, Anthropic, Groq, Hugging Face Hub).

### Configuração

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO_AQUI]
    cd my_vertical_agent
    ```

2.  **Crie e ative um ambiente virtual (recomendado):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # No Linux/macOS
    # venv\Scripts\activate    # No Windows
    ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    # Você pode precisar instalar SDKs específicos de LLMs se não estiverem no requirements.txt principal
    # Ex: pip install openai google-generativeai anthropic groq huggingface_hub
    ```

4.  **Configure as Variáveis de Ambiente:**
    *   Copie o arquivo de exemplo `config/.env.example` para `config/.env`:
        ```bash
        cp config/.env.example config/.env
        ```
    *   Edite `config/.env` e preencha **TODAS** as variáveis com suas credenciais e configurações (API Keys dos LLMs, Supabase URL/Keys, Redis host/port, etc.).
        **NUNCA FAÇA COMMIT DO SEU ARQUIVO `.env` COM CREDENCIAIS REAIS!** Ele já está no `.gitignore`.

### Selecionando e Configurando o LLM para um Agente

Cada agente (principal ou subagente) pode ser configurado para usar um provedor de LLM e modelo específico através de seu arquivo `config.yaml` (ex: `src/agents/main_agent/config.yaml`).

Exemplo de seção `llm_config` em `src/agents/main_agent/config.yaml`:

```yaml
llm_config:
  provider: "openai"  # Provedores suportados: "openai", "google_gemini", "anthropic_claude", "groq", "huggingface"
  model_name: "gpt-4-turbo" # Nome/ID específico do modelo para o provedor selecionado
  # api_key: "sk-xxxxxxxx" # Opcional: pode ser definido aqui ou via variável de ambiente (recomendado)
  temperature: 0.7
  max_tokens: 2048
  # Outras configurações específicas do cliente LLM podem ser adicionadas aqui
  # client_specific_configs:
  #   timeout: 60
```

O sistema carregará a API Key correspondente do arquivo `config/.env` (ex: `OPENAI_API_KEY` para o provedor `openai`).

### Executando o Agente (Exemplo)

O `src/entrypoint.py` fornece um CLI básico para interagir com o agente principal:

```bash
python src/entrypoint.py --query "Qual a sua primeira instrução?"
```

## Como Usar e Reutilizar o Template

Consulte o guia detalhado em `docs/tutorials/how_to_create_new_agent.md` para aprender como:

*   Criar e configurar novos subagentes.
*   Customizar prompts, schemas e LLMs para cada agente.
*   Configurar e popular sua knowledge base no Supabase.
*   Adicionar suporte a novos provedores de LLM.
*   Aplicar técnicas avançadas de engenharia de prompt e RAG.

## Contribuindo

[Detalhes sobre como contribuir para o projeto, se aplicável.]

## Licença

Este projeto é licenciado sob a Licença MIT - veja o arquivo `LICENSE` para detalhes (não criado neste template, mas recomendado adicionar).

