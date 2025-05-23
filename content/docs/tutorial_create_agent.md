# Guia de Uso e Reutilização do Template de Agente Vertical Avançado

Este guia detalha o processo para utilizar e reutilizar o template de agente vertical avançado, permitindo que você crie novos agentes principais e subagentes de forma eficiente e consistente.

## Visão Geral da Arquitetura

Antes de começar, familiarize-se com a arquitetura geral do template consultando o arquivo `docs/architecture.md`. Ele explica como os componentes (agente principal, subagentes, LLMs, memória, knowledge base, tools, etc.) estão organizados e interagem.

## Pré-requisitos

1.  **Ambiente Configurado:** Certifique-se de que seu ambiente Python está configurado com todas as dependências listadas em `requirements.txt`.
2.  **Serviços Externos:**
    *   **Redis:** Uma instância do Redis deve estar acessível para a memória de chat.
    *   **Supabase:** Um projeto Supabase deve estar configurado com a extensão `pgvector` habilitada e as funções SQL necessárias para busca vetorial (ex: `match_documents`) criadas na sua base de dados. Consulte a documentação do Supabase para RAG.
    *   **OpenAI API Key:** Você precisará de uma chave de API da OpenAI para usar os modelos de LLM e embeddings.
3.  **Arquivo `.env`:** Copie o arquivo `config/.env.example` para `config/.env` e preencha todas as variáveis de ambiente com suas credenciais e configurações específicas (OpenAI API Key, URLs e chaves do Supabase, detalhes do Redis, etc.).

    ```bash
    cp config/.env.example config/.env
    # Edite o arquivo config/.env com seus valores
    ```

## Parte 1: Criando um Novo Agente Principal (se necessário)

Normalmente, você terá um agente principal e vários subagentes. Se precisar de um *novo e completamente separado* agente principal, você pode duplicar toda a estrutura `src/agents/main_agent/` para `src/agents/novo_main_agent/` e ajustar as configurações e o `entrypoint.py` para chamá-lo.

No entanto, o foco deste guia é mais na criação e customização de subagentes e na adaptação do agente principal existente.

## Parte 2: Criando e Configurando Novos Subagentes

O template já vem com uma estrutura para 5 subagentes (`sub_agent_1` a `sub_agent_5`). Veja como customizá-los ou adicionar mais:

### 1. Copiando a Estrutura de um Subagente Existente

Para criar um novo subagente (ex: `sub_agent_6`):

1.  Copie a pasta de um subagente existente, por exemplo, `src/agents/sub_agents/sub_agent_1/` para `src/agents/sub_agents/sub_agent_6/`.

    ```bash
    cp -r src/agents/sub_agents/sub_agent_1/ src/agents/sub_agents/sub_agent_6/
    ```

2.  **Renomeie e ajuste os arquivos internos** se necessário (ex: `sub_agent_1` para `sub_agent_6` nos nomes de classes, comentários, etc., dentro dos arquivos do novo subagente).

### 2. Configurando o Novo Subagente (`sub_agent_6`)

Dentro da pasta `src/agents/sub_agents/sub_agent_6/`:

*   **`config.yaml`:**
    *   Atualize `agent_name` (ex: `SubAgent6_DataAnalyzer`).
    *   Atualize `agent_id` para `sub_agent_6`.
    *   Defina `agent_description` para descrever a função específica deste subagente.
    *   Ajuste outras configurações conforme necessário.

*   **`model/config.yaml` (se o subagente usar um LLM diretamente e tiver sua própria configuração de modelo):**
    *   Configure o provedor, nome do modelo, chave de API (pode usar as globais do `.env` ou especificar overrides), temperatura, max_tokens, etc. Geralmente, subagentes podem herdar a configuração do LLM do agente principal ou ter modelos mais simples/especializados.

*   **`memory/config.yaml` (se o subagente tiver sua própria memória de chat separada):**
    *   Configure os detalhes da memória. A maioria dos subagentes pode não precisar de memória de chat independente se forem chamados atomicamente pelo agente principal.

*   **`inputs/prompt_template.j2`:**
    *   Este é o coração do seu subagente. Crie um prompt detalhado e específico para a tarefa que este subagente realizará.
    *   Utilize as melhores práticas de engenharia de prompt (role definition, task, instructions, context, output format).
    *   Defina placeholders (ex: `{{ specific_input_for_sub_agent_6 }}`) que serão preenchidos pelo agente principal ou pela lógica do subagente.

*   **`inputs/schema.yaml`:**
    *   Defina o esquema JSON para os inputs que este subagente espera receber. Isso garante validação e clareza.
    *   Exemplo:
        ```yaml
        $schema: "http://json-schema.org/draft-07/schema#"
        title: "SubAgent6Input"
        description: "Input para o SubAgente6 que analisa dados financeiros."
        type: "object"
        properties:
          raw_data_json:
            type: "string"
            description: "String JSON contendo os dados brutos para análise."
          analysis_type:
            type: "string"
            enum: ["tendencia_central", "dispersao", "correlacao"]
        required:
          - raw_data_json
          - analysis_type
        ```

*   **`tools/tools.yaml` (se o subagente usar suas próprias ferramentas):**
    *   Defina quaisquer ferramentas específicas que este subagente possa precisar (ex: uma calculadora, um conector para uma API específica).

*   **`data_connectors/` (se o subagente acessar uma KB específica):**
    *   Configure conexões com bases de conhecimento (ex: um Supabase Vector Store diferente do principal).

*   **`agent.py`:**
    *   Implemente a lógica principal do subagente. Isso incluirá:
        *   Carregar suas configurações.
        *   Renderizar seu prompt com os inputs recebidos.
        *   Chamar o LLM (se aplicável).
        *   Processar a resposta do LLM.
        *   Chamar ferramentas (se aplicável).
        *   Formatar e retornar a resposta final para o agente principal.

### 3. Registrando o Novo Subagente no Agente Principal

1.  **`src/agents/main_agent/config.yaml`:**
    *   Adicione o `agent_id` do novo subagente (ex: `sub_agent_6`) à lista `sub_agent_ids`.

2.  **`src/agents/main_agent/tools/tools.yaml`:**
    *   Adicione uma nova entrada para rotear tarefas para o `sub_agent_6`:
        ```yaml
        - name: "sub_agent_6_router"
          description: "[Descrição da função do Sub-agente 6, ex: Delega tarefas de análise de dados financeiros para o Sub-agente 6.]"
          sub_agent_id: "sub_agent_6"
        ```

3.  **`src/agents/main_agent/agent.py`:**
    *   A lógica em `_load_sub_agent` e `_decide_and_execute_tool_or_sub_agent` deve ser capaz de lidar dinamicamente com o novo subagente com base nas configurações. Se você estiver usando importações estáticas, precisará adicionar a importação para a classe do novo subagente.

### 4. Adicionando Testes (Recomendado)

Crie um novo diretório em `tests/sub_agents/sub_agent_6/` e adicione testes unitários e de integração para o seu novo subagente.

## Parte 3: Configurando a Knowledge Base (RAG com Supabase)

1.  **Preparar Dados:**
    *   Seus documentos (PDFs, TXTs, Markdown, etc.) devem ser processados (chunking, limpeza) e armazenados no Supabase.
    *   Use um script (ex: um em `scripts/prepare_data.sh` ou um notebook Python) para:
        *   Ler os documentos.
        *   Dividi-los em chunks apropriados.
        *   Gerar embeddings para cada chunk usando `src/agents/main_agent/data_connectors/embeddings_openai.py`.
        *   Inserir os chunks, seus embeddings e metadados na tabela do Supabase configurada em `.env` (`SUPABASE_KB_TABLE_NAME`).
            *   **Importante:** Para inserir dados, você precisará usar a `SUPABASE_SERVICE_KEY`.

2.  **Função de Busca Vetorial no Supabase:**
    *   Certifique-se de que você criou a função SQL no Supabase para realizar a busca por similaridade (ex: `match_documents`). Um exemplo de tal função está comentado no final de `src/agents/main_agent/data_connectors/supabase_vector.py`.
    *   A função deve aceitar `query_embedding`, `match_threshold`, e `match_count` e retornar os campos relevantes (conteúdo, metadados, similaridade).

3.  **Utilização no Agente:**
    *   O `MainAgent` (em `src/agents/main_agent/agent.py`) usa `SupabaseVectorStore` para realizar buscas.
    *   O prompt (`prompt_template.j2`) do `MainAgent` é instruído a usar a ferramenta `search_knowledge_base` quando apropriado.
    *   A lógica em `_decide_and_execute_tool_or_sub_agent` (ou uma implementação mais robusta de tool use) chamará o `SupabaseVectorStore.similarity_search()`.
    *   Os resultados da busca são então injetados de volta no prompt do LLM como contexto para gerar a resposta final.

## Parte 4: Engenharia de Prompt Avançada e Melhores Práticas

*   **Modularidade do Prompt:**
    *   Use templates Jinja2 (`.j2`) como fornecido. Isso permite a injeção dinâmica de contexto, histórico, inputs, e instruções.
    *   Divida o prompt em seções lógicas (Role, Task, Instructions, History, Input, Output Format) para clareza e manutenibilidade.

*   **Clareza e Especificidade:**
    *   Seja o mais claro e específico possível nas instruções para o LLM.
    *   Defina explicitamente o papel do agente, suas capacidades e limitações.

*   **Técnicas de RAG:**
    *   Instrua o LLM a priorizar informações da base de conhecimento recuperada.
    *   Peça para citar fontes, se aplicável.
    *   Experimente com o número de chunks recuperados (`match_count`) e o limiar de similaridade (`similarity_threshold`) para otimizar a relevância vs. ruído.

*   **Tool Use / Function Calling:**
    *   Descreva claramente cada ferramenta/subagente disponível para o LLM no prompt do agente principal (ou através de uma seção de "ferramentas disponíveis" no prompt).
    *   Instrua o LLM sobre como e quando usar cada ferramenta, e qual o formato de input esperado pela ferramenta/subagente.
    *   A lógica em `agent.py` precisa parsear a intenção do LLM de usar uma ferramenta e executar a chamada correspondente.

*   **Contexto e Histórico de Chat:**
    *   A integração com Redis (`RedisChatMemory`) fornece o histórico. Certifique-se de que o prompt inclua este histórico de forma útil (ex: últimas N mensagens).

*   **Iteração e Teste:**
    *   A engenharia de prompt é um processo iterativo. Teste seus prompts extensivamente com diferentes inputs e cenários.
    *   Use a pasta `evaluators/` para implementar métricas de avaliação da qualidade das respostas do agente.

*   **AI Friendly Language:**
    *   Use linguagem que o LLM entenda bem. Evite ambiguidades.
    *   Use exemplos (few-shot prompting) dentro do prompt se a tarefa for complexa ou para guiar o formato de saída.

## Parte 5: Executando o Agente

1.  **Entrypoint:** O arquivo `src/entrypoint.py` serve como ponto de entrada para o agente. Ele pode ser um servidor HTTP (FastAPI, Flask), uma interface de linha de comando (CLI), ou um consumidor de mensagens.
    *   O `entrypoint.py` de exemplo (a ser criado) carregaria as configurações, instanciaria o `MainAgent`, receberia o input do usuário (ex: de uma requisição HTTP), validaria o input contra `src/agents/main_agent/schemas/input.json` (ou o `inputs/schema.yaml`), e chamaria o método `main_agent.run(validated_input_data)`.

2.  **Exemplo de Chamada (Conceitual):**
    ```python
    # Em seu entrypoint.py ou um script de teste
    from src.agents.main_agent.agent import MainAgent
    # Carregar .env se não carregado globalmente
    # from dotenv import load_dotenv
    # load_dotenv("config/.env")

    main_agent_instance = MainAgent()

    user_query = {
        "user_input": "Preciso de um resumo das últimas notícias sobre IA e também uma análise de sentimento sobre o artigo X.",
        "session_id": "session12345",
        "user_profile": {"name": "Usuário Exemplo"}
    }

    response = main_agent_instance.run(user_query)
    print(response)
    ```

## Parte 6: Manutenção e Boas Práticas Adicionais

*   **Controle de Versão:** Use Git para todo o projeto.
*   **Testes:** Escreva testes unitários e de integração para todos os componentes críticos.
*   **Logging:** Configure e utilize o `config/logging.yaml` para ter logs estruturados e úteis. O `outputs/logger.py` em cada agente pode ser usado para logs específicos da execução do agente.
*   **CI/CD:** Utilize o workflow em `.github/workflows/ci.yml` para automatizar linting, testes e, opcionalmente, builds e deploys.
*   **Documentação:** Mantenha `docs/architecture.md`, `docs/faq.md` e os `README.md` de cada agente atualizados.
*   **Segurança:** Gerencie chaves de API e outras credenciais de forma segura usando variáveis de ambiente e o arquivo `.env` (que não deve ser commitado).

Seguindo este guia, você estará bem equipado para criar, customizar e manter agentes verticais avançados e robustos usando este template.

