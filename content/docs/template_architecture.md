# Arquitetura do Template de Agente Vertical Avançado

Este documento descreve a arquitetura do template de agente vertical, detalhando seus principais componentes e como eles interagem.

## 1. Visão Geral

O template é projetado para ser modular e escalável, permitindo a criação de agentes de IA complexos que podem lidar com uma variedade de tarefas através da orquestração de subagentes especializados e da utilização de bases de conhecimento (RAG) e ferramentas externas.

**Principais Componentes:**

*   **Entrypoint (`src/entrypoint.py`):** Ponto de entrada da aplicação (ex: API HTTP, CLI) que recebe as solicitações do usuário e as encaminha para o Agente Principal.
*   **Agente Principal (`src/agents/main_agent/`):** O cérebro da operação. Responsável por:
    *   Interpretar a solicitação do usuário.
    *   Gerenciar o histórico da conversa (usando Redis Chat Memory).
    *   Planejar a execução da tarefa, decidindo se deve responder diretamente, consultar a knowledge base (RAG via Supabase), ou delegar para um ou mais subagentes.
    *   Orquestrar chamadas para subagentes e ferramentas.
    *   Sintetizar as informações e gerar a resposta final para o usuário.
*   **Subagentes (`src/agents/sub_agents/`):** Agentes especializados focados em domínios ou tarefas específicas. Cada subagente opera de forma semi-autônoma, recebendo uma tarefa do agente principal e retornando um resultado.
    *   Ex: `sub_agent_1` para análise de dados, `sub_agent_2` para busca de informações específicas, etc.
*   **Configuração (`config/` e arquivos `.yaml` específicos dos agentes):**
    *   `.env`: Armazena credenciais e configurações globais (API keys, URLs de banco de dados, etc.).
    *   `logging.yaml`: Configuração do sistema de logging.
    *   Cada agente/subagente possui seus próprios arquivos de configuração para LLM, memória (se aplicável), prompts, tools, etc., permitindo customização granular.
*   **Modelos de LLM (`src/agents/**/model/`):** Lógica para carregar e interagir com os modelos de linguagem (ex: OpenAI GPT-4).
*   **Memória de Chat (`src/agents/main_agent/memory/redis_memory.py`):** Implementação da memória de conversação usando Redis para persistência e contexto.
*   **Inputs e Prompts (`src/agents/**/inputs/`):**
    *   `prompt_template.j2`: Templates Jinja2 para construção dinâmica de prompts robustos.
    *   `schema.yaml`: Definição do esquema de input esperado pelo agente (validação).
*   **Ferramentas (`src/agents/**/tools/`):**
    *   `tools.yaml`: Declaração das ferramentas disponíveis para o agente (incluindo roteadores para subagentes).
    *   `wrappers.py`: Funções Python que encapsulam a lógica de chamada das ferramentas ou subagentes.
*   **Conectores de Dados (RAG) (`src/agents/main_agent/data_connectors/`):**
    *   `embeddings_openai.py`: Geração de embeddings usando OpenAI.
    *   `supabase_vector.py`: Interação com o Supabase (pgvector) para busca em base de conhecimento vetorial.
*   **Callbacks, Parsers, Evaluators, Outputs (`src/agents/**/{callbacks,parsers,evaluators,outputs}/`):** Módulos para estender a funcionalidade do agente com lógica de pré/pós-processamento, parsing de respostas do LLM, avaliação de performance e formatação/envio de saídas.
*   **Schemas (`src/agents/**/schemas/`):** Validação final dos inputs e outputs dos agentes.
*   **Knowledge Base (`knowledge_base/`):** Local para armazenar arquivos brutos (PDFs, CSVs, etc.) que podem ser processados e carregados no Supabase.
*   **Testes (`tests/`):** Testes unitários e de integração.
*   **Documentação (`docs/`):** Documentação do projeto, incluindo este arquivo, tutoriais e FAQs.
*   **Infraestrutura e CI/CD (`.github/workflows/`, `Dockerfile`, `Makefile`, `scripts/`):** Suporte para automação, containerização e deploy.

## 2. Fluxo de uma Requisição (Simplificado)

1.  O **Usuário** envia uma solicitação através do **Entrypoint**.
2.  O **Entrypoint** valida o input e o encaminha para o **Agente Principal**.
3.  O **Agente Principal**:
    a.  Carrega o histórico da conversa da **Memória Redis**.
    b.  Constrói um prompt inicial usando seu `prompt_template.j2`, incorporando o input do usuário, histórico, e contexto disponível.
    c.  Chama o **Modelo LLM**.
    d.  O LLM pode:
        i.  Gerar uma resposta direta.
        ii. Indicar a necessidade de usar uma ferramenta (ex: `search_knowledge_base`).
        iii.Indicar a necessidade de delegar para um **Subagente** (ex: `sub_agent_1_router`).
    e.  Se uma ferramenta for indicada:
        i.  O Agente Principal executa a ferramenta (ex: chama `SupabaseVectorStore` para RAG).
        ii. Os resultados da ferramenta são usados para construir um novo prompt para o LLM, que então gera a resposta.
    f.  Se um subagente for indicado:
        i.  O Agente Principal formata o input para o **Subagente** e o chama.
        ii. O Subagente executa sua lógica interna (que pode incluir seu próprio LLM, tools, etc.) e retorna um resultado.
        iii.O resultado do Subagente é usado pelo Agente Principal para construir um novo prompt para seu LLM, que então gera a resposta final.
    g.  A interação (input do usuário e resposta final do agente) é salva na **Memória Redis**.
    h.  A resposta final é retornada ao **Entrypoint**, que a envia de volta ao **Usuário**.

## 3. Modularidade e Extensibilidade

*   **Subagentes Independentes:** Cada subagente é um módulo autocontido com suas próprias configurações, prompts e lógica, facilitando o desenvolvimento e a manutenção.
*   **Configuração Flexível:** O uso de arquivos `.yaml` e `.env` permite fácil ajuste do comportamento dos agentes sem modificar o código.
*   **Templates de Prompt:** Jinja2 permite a criação de prompts dinâmicos e complexos.
*   **Estrutura Clara:** A organização dos diretórios visa separar claramente as responsabilidades, tornando mais fácil encontrar e modificar componentes específicos.

## 4. Tecnologias Chave

*   **Python:** Linguagem principal de desenvolvimento.
*   **OpenAI API:** Para acesso a modelos de LLM e embeddings.
*   **Redis:** Para memória de chat.
*   **Supabase (com pgvector):** Para a knowledge base vetorial (RAG).
*   **Jinja2:** Para templating de prompts.
*   **PyYAML:** Para carregar configurações YAML.
*   **python-dotenv:** Para gerenciar variáveis de ambiente.
*   **Docker (opcional):** Para containerização.

Este diagrama de arquitetura fornece uma base para entender como o template é estruturado e como você pode estendê-lo para construir seu agente vertical especializado.
