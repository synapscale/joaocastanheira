# 🚀 GUIA DEFINITIVO - Banco de Dados PostgreSQL para SynapScale (46 Tabelas)

Este guia fornece instruções completas para configurar e usar o banco de dados PostgreSQL com o script SQL definitivo (`synapscale_database_DEFINITIVO_46_TABELAS.sql`), que contém **TODAS as 46 tabelas** identificadas no projeto SynapScale Backend.

## 📋 Pré-requisitos

- PostgreSQL instalado e rodando (versão 12 ou superior recomendada).
- Acesso ao terminal com o cliente `psql`.
- O arquivo `synapscale_database_DEFINITIVO_46_TABELAS.sql` baixado.

## 🔧 Passo 1: Criação do Banco de Dados e Usuário

1.  **Conecte-se ao PostgreSQL** como superusuário (geralmente `postgres`):
    ```bash
    sudo -u postgres psql
    ```

2.  **Crie um novo banco de dados** dedicado para o SynapScale:
    ```sql
    CREATE DATABASE synapscale_db OWNER postgres ENCODING 'UTF8' LC_COLLATE='en_US.utf8' LC_CTYPE='en_US.utf8' TEMPLATE template0;
    ```
    *   **Nota:** Ajuste `LC_COLLATE` e `LC_CTYPE` conforme a configuração do seu sistema, se necessário. `en_US.utf8` é um padrão comum.

3.  **Crie um usuário dedicado** para a aplicação SynapScale com uma senha segura:
    ```sql
    CREATE USER synapscale_user WITH PASSWORD 'coloque_uma_senha_forte_aqui';
    ```
    *   **⚠️ IMPORTANTE:** Substitua `'coloque_uma_senha_forte_aqui'` por uma senha realmente segura.

4.  **Conceda todos os privilégios** ao novo usuário no banco de dados criado:
    ```sql
    GRANT ALL PRIVILEGES ON DATABASE synapscale_db TO synapscale_user;
    ```

5.  **(Opcional, mas recomendado) Conecte-se ao novo banco** para garantir que as próximas operações ocorram nele:
    ```sql
    \c synapscale_db
    ```

6.  **Conceda permissões adicionais** ao usuário dentro do banco (necessário para criar tabelas, etc.):
    ```sql
    GRANT ALL ON SCHEMA public TO synapscale_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO synapscale_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO synapscale_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO synapscale_user;
    ```

7.  **Saia do `psql`**:
    ```sql
    \q
    ```

## ⚙️ Passo 2: Execução do Script SQL Definitivo

1.  **Navegue até o diretório** onde você salvou o arquivo `synapscale_database_DEFINITIVO_46_TABELAS.sql`.

2.  **Execute o script SQL** usando o cliente `psql`, conectando-se como o usuário `synapscale_user` ao banco `synapscale_db`:
    ```bash
    psql -U synapscale_user -d synapscale_db -h localhost -f synapscale_database_DEFINITIVO_46_TABELAS.sql
    ```
    *   Você será solicitado a digitar a senha do `synapscale_user` que você definiu no Passo 1.
    *   Se o PostgreSQL estiver rodando em uma máquina ou porta diferente, ajuste `-h localhost` e adicione `-p <porta>` conforme necessário.

3.  **Verifique a saída:** O script deve executar sem erros e exibir a mensagem final:
    ```
    NOTICE:  ✅ BANCO SYNAPSCALE CRIADO COM SUCESSO!
    NOTICE:  📊 Total de tabelas: 46
    NOTICE:  🔗 Total de relacionamentos: 50+
    NOTICE:  📈 Total de índices: 60+
    NOTICE:  ⚡ Total de triggers: 20+
    NOTICE:  📋 Total de views: 4
    NOTICE:  🎯 Sistema 100% pronto para uso!
    ```

## 🔗 Passo 3: Configuração do Backend SynapScale (.env)

1.  **Navegue até o diretório raiz** do projeto SynapScale Backend.
2.  **Copie o arquivo de exemplo `.env.example`** para `.env` (se ainda não o fez):
    ```bash
    cp .env.example .env
    ```
3.  **Edite o arquivo `.env`** e configure a variável `DATABASE_URL` com os dados do banco que você criou:
    ```env
    # ---------------------------------------------------------------------------
    # DATABASE CONFIGURATION
    # ---------------------------------------------------------------------------
    # Use o formato: postgresql://<user>:<password>@<host>:<port>/<database>
    DATABASE_URL="postgresql://synapscale_user:coloque_sua_senha_forte_aqui@localhost:5432/synapscale_db"
    ```
    *   **⚠️ IMPORTANTE:** Substitua `coloque_sua_senha_forte_aqui` pela senha que você definiu para `synapscale_user`.
    *   Ajuste `localhost` e `5432` se o seu servidor PostgreSQL estiver em um host ou porta diferente.

4.  **Configure as outras variáveis** no arquivo `.env` conforme necessário (SECRET_KEY, chaves de API LLM, etc.). Consulte o arquivo `GUIA_CONFIGURACAO_ENV.md` para mais detalhes sobre as outras variáveis.

## ✅ Passo 4: Verificação e Inicialização

1.  **Certifique-se de que o cliente Prisma está gerado:**
    ```bash
    # No diretório raiz do projeto, com o ambiente virtual ativado
    python3 -m prisma generate
    ```
2.  **Inicie o servidor SynapScale Backend:**
    ```bash
    # No diretório raiz do projeto, com o ambiente virtual ativado
    python3 -m uvicorn src.synapse.main:app --host 0.0.0.0 --port 8000 --reload
    ```
3.  **Acesse a documentação da API** (geralmente `http://localhost:8000/docs`) e verifique se todos os endpoints estão carregando corretamente.
4.  **Teste algumas funcionalidades** que interagem com o banco de dados (ex: registro de usuário, criação de workflow) para confirmar a conexão.

## 🔐 Usuário Administrador Padrão

O script SQL inclui um usuário administrador padrão para facilitar o início:

-   **Email:** `admin@synapscale.com`
-   **Username:** `admin`
-   **Senha:** `admin123`

**Recomendação:** Altere a senha do administrador imediatamente após o primeiro login por questões de segurança.

## 🔄 Solução de Problemas Comuns

-   **Erro de Autenticação:** Verifique se a senha no `DATABASE_URL` está correta e se o usuário `synapscale_user` tem permissões adequadas (Passo 1).
-   **Erro de Conexão:** Confirme se o host e a porta do PostgreSQL no `DATABASE_URL` estão corretos e se o servidor PostgreSQL está rodando e acessível.
-   **Erro `relation "xxx" does not exist`:** Certifique-se de que o script SQL foi executado completamente e sem erros no banco de dados correto (`synapscale_db`). Verifique se você está conectado ao banco correto ao executar o backend.
-   **Erro de Codificação (Encoding):** Se encontrar problemas com caracteres especiais, verifique se o banco foi criado com `ENCODING 'UTF8'` (Passo 1).

---

🎉 **Parabéns!** Seu banco de dados PostgreSQL está agora 100% configurado com todas as 46 tabelas e pronto para ser usado com o SynapScale Backend.

