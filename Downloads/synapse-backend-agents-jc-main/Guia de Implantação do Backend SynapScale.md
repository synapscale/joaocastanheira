# Guia de Implantação do Backend SynapScale

Este guia apresenta o passo a passo para implantar o backend SynapScale e integrá-lo com o frontend hospedado na Vercel.

## Índice
1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Preparação do Ambiente](#preparação-do-ambiente)
3. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
4. [Implantação com Docker Compose](#implantação-com-docker-compose)
5. [Exposição dos Endpoints](#exposição-dos-endpoints)
6. [Integração com o Frontend](#integração-com-o-frontend)
7. [Validação e Testes](#validação-e-testes)
8. [Considerações para Produção](#considerações-para-produção)

## Requisitos do Sistema

- Servidor Linux (Ubuntu 20.04 LTS ou superior recomendado)
- Docker (versão 20.10 ou superior)
- Docker Compose (versão 2.0 ou superior)
- 4GB RAM mínimo (8GB recomendado)
- 20GB de espaço em disco
- Conexão de internet estável
- Chaves de API para serviços de IA (OpenAI, Anthropic, etc.)

## Preparação do Ambiente

### 1. Instalação do Docker e Docker Compose

```bash
# Atualizar pacotes do sistema
sudo apt update
sudo apt upgrade -y

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar chave GPG do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Adicionar repositório do Docker
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Atualizar lista de pacotes
sudo apt update

# Instalar Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Adicionar seu usuário ao grupo docker para evitar usar sudo
sudo usermod -aG docker $USER

# Aplicar mudanças de grupo (ou reinicie a sessão)
newgrp docker
```

### 2. Configuração de Firewall

```bash
# Instalar UFW se não estiver instalado
sudo apt install -y ufw

# Configurar regras básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH
sudo ufw allow ssh

# Permitir portas do backend
sudo ufw allow 8000/tcp  # API Gateway
sudo ufw allow 80/tcp    # HTTP (para proxy reverso)
sudo ufw allow 443/tcp   # HTTPS (para proxy reverso)

# Ativar firewall
sudo ufw enable
```

### 3. Clonar o Repositório

```bash
# Criar diretório para a aplicação
mkdir -p /opt/synapse-backend
cd /opt/synapse-backend

# Extrair o arquivo zip do backend
# Supondo que você tenha o arquivo synapse-backend-fase3.zip
unzip /caminho/para/synapse-backend-fase3.zip -d .

# Ou clonar do repositório (se disponível)
# git clone https://github.com/synapscale/backend.git .
```

### 4. Verificar Estrutura de Diretórios

Confirme se a estrutura de diretórios está correta:

```bash
ls -la
```

Você deve ver os seguintes diretórios e arquivos:
- `api-gateway/`
- `services/`
- `scripts/`
- `docker-compose.yml`
- Outros arquivos de configuração

## Configuração de Variáveis de Ambiente

### 1. Criar Arquivo .env

Crie um arquivo `.env` na raiz do projeto para armazenar todas as variáveis de ambiente necessárias:

```bash
touch .env
nano .env
```

### 2. Configurar Chaves de API e Segredos

Adicione as seguintes variáveis ao arquivo `.env`:

```
# Chaves de API para serviços de IA
OPENAI_API_KEY=sua_chave_openai_aqui
ANTHROPIC_API_KEY=sua_chave_anthropic_aqui
GEMINI_API_KEY=sua_chave_gemini_aqui
MISTRAL_API_KEY=sua_chave_mistral_aqui

# Segredos JWT
JWT_SECRET=gere_uma_chave_secreta_forte_e_unica
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Configurações de Banco de Dados
POSTGRES_USER=postgres
POSTGRES_PASSWORD=escolha_uma_senha_forte_aqui
```

Para gerar uma chave JWT segura, você pode usar:

```bash
openssl rand -hex 32
```

### 3. Configurar URLs de Serviço

Se você estiver implantando em um servidor com domínio, adicione estas variáveis:

```
# URL base para acesso externo
PUBLIC_API_URL=https://api.seudominio.com

# CORS - Origens permitidas (seu frontend na Vercel)
CORS_ORIGINS=https://ai-agents-jc.vercel.app
```

### 4. Verificar Permissões

Certifique-se de que o arquivo `.env` tenha permissões adequadas:

```bash
chmod 600 .env
```

### 5. Atualizar docker-compose.yml

Edite o arquivo `docker-compose.yml` para desbloquear os serviços comentados (Marketplace, Agents, Uploads):

```bash
nano docker-compose.yml
```

Remova os comentários das seções dos serviços que deseja ativar (para a Fase 3, descomente todos os serviços).

## Implantação com Docker Compose

### 1. Construir e Iniciar os Containers

```bash
# Construir as imagens (primeira execução)
docker-compose build

# Iniciar todos os serviços em segundo plano
docker-compose up -d
```

### 2. Verificar Status dos Containers

```bash
# Verificar se todos os containers estão rodando
docker-compose ps

# Verificar logs em tempo real
docker-compose logs -f

# Verificar logs de um serviço específico
docker-compose logs -f api-gateway
```

### 3. Inicializar Bancos de Dados (Primeira Execução)

Os bancos de dados serão criados automaticamente pelo script `init-multiple-postgres-databases.sh`, mas você pode verificar se foram criados corretamente:

```bash
# Acessar o container do PostgreSQL
docker-compose exec postgres psql -U postgres -c "\l"
```

Você deve ver os bancos de dados: `synapse_chat`, `synapse_marketplace`, `synapse_agents`, `synapse_uploads` e `synapse_users`.

### 4. Verificar Saúde dos Serviços

```bash
# Verificar a saúde do API Gateway
curl http://localhost:8000/health
```

## Exposição dos Endpoints

### 1. Configuração Básica (Desenvolvimento)

Para testes iniciais, você pode expor diretamente a porta 8000 do API Gateway:

```bash
# Verificar se a porta 8000 está acessível externamente
curl http://seu_ip_externo:8000/health
```

### 2. Configuração com Nginx (Produção)

Para ambientes de produção, recomendamos usar Nginx como proxy reverso:

```bash
# Instalar Nginx
sudo apt install -y nginx

# Configurar site
sudo nano /etc/nginx/sites-available/synapse-backend
```

Adicione a seguinte configuração:

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative o site e reinicie o Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/synapse-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Configuração HTTPS com Certbot

Para habilitar HTTPS (recomendado para produção):

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d api.seudominio.com

# Seguir as instruções na tela
```

### 4. Testar Acesso Externo

```bash
# Testar acesso via HTTP (ou HTTPS se configurado)
curl http://api.seudominio.com/health
# ou
curl https://api.seudominio.com/health
```

## Integração com o Frontend

### 1. Configurar Variáveis de Ambiente no Frontend (Vercel)

No painel da Vercel para o projeto `ai-agents-jc`:

1. Acesse **Settings** > **Environment Variables**
2. Adicione a variável:
   - Nome: `NEXT_PUBLIC_API_URL`
   - Valor: `https://api.seudominio.com` (ou seu IP/domínio)
3. Clique em **Save**
4. Faça um novo deploy do projeto para aplicar as alterações

### 2. Atualizar Configuração CORS no Backend

Certifique-se de que o domínio do frontend está na lista de origens permitidas:

```bash
# Editar .env
nano .env
```

Atualize a variável `CORS_ORIGINS`:

```
CORS_ORIGINS=https://ai-agents-jc.vercel.app
```

Reinicie o API Gateway para aplicar as alterações:

```bash
docker-compose restart api-gateway
```

### 3. Verificar Integração

Acesse o frontend na Vercel e verifique se ele consegue se comunicar com o backend:

1. Abra o console do navegador (F12)
2. Tente fazer login ou qualquer operação que acesse o backend
3. Verifique se não há erros CORS ou de conexão

## Validação e Testes

### 1. Testar Autenticação

```bash
# Obter token de acesso
curl -X POST https://api.seudominio.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=password"
```

### 2. Testar Serviços com Token

```bash
# Substituir YOUR_TOKEN pelo token obtido acima
export TOKEN="YOUR_TOKEN"

# Testar serviço LLM
curl -X GET https://api.seudominio.com/api/llm/models \
  -H "Authorization: Bearer $TOKEN"

# Testar serviço Chat
curl -X GET https://api.seudominio.com/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Monitorar Logs para Depuração

```bash
# Ver logs em tempo real
docker-compose logs -f
```

## Considerações para Produção

### 1. Backup de Dados

Configure backups regulares do PostgreSQL:

```bash
# Criar script de backup
nano /opt/synapse-backend/scripts/backup.sh
```

Adicione o seguinte conteúdo:

```bash
#!/bin/bash
BACKUP_DIR="/opt/synapse-backend/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup de cada banco de dados
for DB in synapse_chat synapse_marketplace synapse_agents synapse_uploads synapse_users; do
  docker-compose exec -T postgres pg_dump -U postgres $DB > "$BACKUP_DIR/${DB}_${TIMESTAMP}.sql"
done

# Compactar backups
tar -czf "$BACKUP_DIR/backup_${TIMESTAMP}.tar.gz" $BACKUP_DIR/*.sql
rm $BACKUP_DIR/*.sql

# Manter apenas os últimos 7 backups
ls -t $BACKUP_DIR/backup_*.tar.gz | tail -n +8 | xargs -r rm
```

Torne o script executável e configure um cron job:

```bash
chmod +x /opt/synapse-backend/scripts/backup.sh
crontab -e
```

Adicione a linha para executar o backup diariamente às 2h da manhã:

```
0 2 * * * /opt/synapse-backend/scripts/backup.sh
```

### 2. Monitoramento

Configure monitoramento básico:

```bash
# Instalar ferramentas de monitoramento
sudo apt install -y htop iotop

# Monitorar uso de recursos
htop
```

Para monitoramento mais avançado, considere usar Prometheus e Grafana.

### 3. Atualizações

Para atualizar o backend:

```bash
# Parar os serviços
docker-compose down

# Fazer backup dos dados
./scripts/backup.sh

# Atualizar o código (git pull ou nova extração do zip)
# ...

# Reconstruir e iniciar
docker-compose build
docker-compose up -d
```

### 4. Escalonamento

Para escalonar horizontalmente:

1. Configure um balanceador de carga (como HAProxy ou AWS ELB)
2. Implante o backend em múltiplos servidores
3. Configure um banco de dados PostgreSQL compartilhado
4. Use Redis para compartilhar sessões e cache

## Solução de Problemas

### Problema: Containers não iniciam

```bash
# Verificar logs detalhados
docker-compose logs

# Verificar se as portas não estão em uso
sudo netstat -tulpn | grep 8000
```

### Problema: Erros CORS

1. Verifique se o domínio do frontend está na lista `CORS_ORIGINS`
2. Certifique-se de que o protocolo (http/https) está correto
3. Reinicie o API Gateway após alterações

### Problema: Falha na Autenticação

1. Verifique se o `JWT_SECRET` está configurado corretamente
2. Teste a autenticação diretamente via curl
3. Verifique os logs do serviço de usuários

## Conclusão

Parabéns! Você agora tem o backend SynapScale implantado e integrado com seu frontend na Vercel. Para suporte adicional ou dúvidas, consulte a documentação ou entre em contato com a equipe de desenvolvimento.
