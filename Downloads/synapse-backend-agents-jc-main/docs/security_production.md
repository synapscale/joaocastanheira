# Recomendações de Segurança para Produção

Este documento contém recomendações de segurança e boas práticas para a implantação do backend SynapScale em ambiente de produção.

## Configurações de Segurança

### Variáveis de Ambiente

Em produção, todas as configurações sensíveis devem ser definidas através de variáveis de ambiente:

```bash
# Configurações básicas
ENVIRONMENT=production
DEBUG=false

# Segurança
SECRET_KEY=<chave-secreta-forte-gerada-aleatoriamente>
ACCESS_TOKEN_EXPIRE_MINUTES=15  # Reduzido para maior segurança

# Banco de dados
DATABASE_URL=<url-do-banco-de-dados-de-producao>

# CORS
BACKEND_CORS_ORIGINS=https://app.synapscale.com,https://admin.synapscale.com

# Rate limiting
RATE_LIMIT_PER_MINUTE=60
UPLOAD_RATE_LIMIT_PER_MINUTE=5

# Redis (recomendado para rate limiting em produção)
REDIS_URL=<url-do-redis>

# Logging
LOG_LEVEL=WARNING
```

### Restrições de CORS

Em produção, as origens CORS devem ser explicitamente listadas, evitando o uso de wildcard (`*`):

```python
cors_origins = ["https://app.synapscale.com", "https://admin.synapscale.com"]
```

### Segurança de Tokens JWT

- Reduzir o tempo de expiração dos tokens de acesso para 15-30 minutos
- Implementar rotação de tokens usando refresh tokens
- Armazenar tokens invalidados em uma lista negra (usando Redis)

### Proteção contra Ataques

- Implementar proteção contra CSRF para endpoints sensíveis
- Configurar cabeçalhos de segurança HTTP:
  - Content-Security-Policy
  - X-Content-Type-Options
  - X-Frame-Options
  - Strict-Transport-Security

## Configurações de Logging

### Estrutura de Logs

Implementar logging estruturado em JSON para facilitar a análise:

```python
import json
import logging
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        if hasattr(record, "request_id"):
            log_record["request_id"] = record.request_id
            
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_record)
```

### Middleware de Logging

Implementar um middleware para registrar informações de requisições:

```python
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    
    # Adicionar request_id ao contexto de logging
    logger = logging.getLogger("synapse")
    logger = logging.LoggerAdapter(logger, {"request_id": request_id})
    
    # Registrar início da requisição
    logger.info(f"Request started: {request.method} {request.url.path}")
    
    # Processar requisição
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Registrar fim da requisição
    logger.info(
        f"Request completed: {request.method} {request.url.path} "
        f"status={response.status_code} duration={process_time:.3f}s"
    )
    
    # Adicionar request_id ao cabeçalho de resposta
    response.headers["X-Request-ID"] = request_id
    
    return response
```

## Monitoramento

### Métricas de Aplicação

Implementar endpoints de métricas para monitoramento:

```python
@app.get("/metrics")
async def metrics():
    return {
        "requests_total": counter_requests.get_count(),
        "requests_by_endpoint": counter_by_endpoint.get_counts(),
        "request_latency": latency_histogram.get_metrics(),
        "error_count": error_counter.get_count(),
    }
```

### Integração com Serviços de Monitoramento

- Configurar integração com serviços como Prometheus, Grafana, ou New Relic
- Implementar alertas para condições críticas (alta taxa de erros, latência elevada)

## Armazenamento de Arquivos

### Recomendações para Produção

- Migrar do armazenamento local para um serviço de armazenamento em nuvem (S3, GCS, Azure Blob)
- Implementar políticas de retenção e backup
- Configurar CDN para arquivos públicos

## Escalabilidade

### Configurações para Alta Disponibilidade

- Utilizar múltiplas instâncias atrás de um balanceador de carga
- Implementar health checks para verificação de integridade
- Configurar auto-scaling baseado em métricas de uso

## Segurança de Dados

### Proteção de Dados Sensíveis

- Implementar criptografia em trânsito (HTTPS) e em repouso
- Aplicar mascaramento de dados sensíveis nos logs
- Implementar políticas de acesso baseadas em princípio de menor privilégio

## Checklist de Implantação

- [ ] Todas as variáveis de ambiente sensíveis configuradas
- [ ] CORS restrito a origens específicas
- [ ] HTTPS configurado e forçado
- [ ] Cabeçalhos de segurança HTTP implementados
- [ ] Logging estruturado configurado
- [ ] Monitoramento e alertas implementados
- [ ] Backups configurados e testados
- [ ] Plano de recuperação de desastres documentado
- [ ] Testes de carga realizados
- [ ] Documentação de operações atualizada
