# 📊 Analytics Endpoints - Documentação Técnica Completa

## 🎯 Visão Geral

O módulo de Analytics fornece uma API robusta para coleta, análise e visualização de dados comportamentais e de performance do sistema SynapScale. Com 28 endpoints especializados, oferece desde tracking básico até análises estatísticas avançadas.

---

## 📋 Índice de Endpoints

### 🟢 **Eventos e Tracking**
- [`POST /events`](#post-events) - Registrar evento
- [`POST /events/batch`](#post-eventsbatch) - Eventos em lote
- [`GET /events`](#get-events) - Listar eventos

### 📈 **Métricas do Sistema**
- [`GET /metrics/user-behavior`](#get-metricsuser-behavior) - Comportamento do usuário
- [`GET /metrics/system-performance`](#get-metricssystem-performance) - Performance do sistema
- [`GET /metrics/business`](#get-metricsbusiness) - Métricas de negócio
- [`GET /metrics/real-time`](#get-metricsreal-time) - Métricas em tempo real

### 🔍 **Consultas Personalizadas**
- [`POST /queries`](#post-queries) - Executar consulta
- [`POST /queries/validate`](#post-queriesvalidate) - Validar consulta
- [`GET /queries/saved`](#get-queriessaved) - Consultas salvas
- [`POST /queries/save`](#post-queriessave) - Salvar consulta

### 📊 **Dashboards**
- [`POST /dashboards`](#post-dashboards) - Criar dashboard
- [`GET /dashboards`](#get-dashboards) - Listar dashboards
- [`GET /dashboards/{id}`](#get-dashboardsid) - Obter dashboard
- [`PUT /dashboards/{id}`](#put-dashboardsid) - Atualizar dashboard
- [`DELETE /dashboards/{id}`](#delete-dashboardsid) - Deletar dashboard
- [`GET /dashboards/{id}/data`](#get-dashboardsiddata) - Dados do dashboard

### 📑 **Relatórios**
- [`POST /reports`](#post-reports) - Criar relatório
- [`GET /reports`](#get-reports) - Listar relatórios
- [`POST /reports/{id}/execute`](#post-reportsidexecute) - Executar relatório

### 🧠 **Insights e IA**
- [`POST /insights`](#post-insights) - Gerar insights
- [`GET /insights/system`](#get-insightssystem) - Insights do sistema
- [`GET /insights/user`](#get-insightsuser) - Insights do usuário

### 📊 **Análises Avançadas**
- [`POST /analysis/funnel`](#post-analysisfunnel) - Análise de funil
- [`POST /analysis/cohort`](#post-analysiscohort) - Análise de coorte
- [`POST /analysis/ab-test`](#post-analysisab-test) - Teste A/B

### 📤 **Exportação**
- [`POST /export`](#post-export) - Exportar dados
- [`GET /exports`](#get-exports) - Listar exportações

### 🚨 **Alertas**
- [`POST /alerts`](#post-alerts) - Criar alerta
- [`GET /alerts`](#get-alerts) - Listar alertas

---

## 🟢 Eventos e Tracking

### `POST /events`

Registra um evento individual no sistema de analytics.

#### **Request**
```http
POST /api/v1/analytics/events
Content-Type: application/json
Authorization: Bearer {token}

{
  "event_type": "page_view",
  "category": "navigation",
  "properties": {
    "page": "/dashboard",
    "source": "direct",
    "duration": 45.2
  },
  "metadata": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.100"
  }
}
```

#### **Response**
```json
{
  "id": "evt_123456789",
  "event_type": "page_view",
  "category": "navigation",
  "user_id": 123,
  "properties": {
    "page": "/dashboard",
    "source": "direct",
    "duration": 45.2
  },
  "metadata": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.100"
  },
  "created_at": "2024-12-09T10:30:00Z"
}
```

#### **Códigos de Status**
- `201` - Evento criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `500` - Erro interno

---

### `POST /events/batch`

Registra múltiplos eventos em uma única requisição para otimização de performance.

#### **Request**
```http
POST /api/v1/analytics/events/batch
Content-Type: application/json
Authorization: Bearer {token}

{
  "events": [
    {
      "event_type": "click",
      "category": "interaction",
      "properties": {"button": "save"}
    },
    {
      "event_type": "form_submit", 
      "category": "conversion",
      "properties": {"form_id": "contact"}
    }
  ]
}
```

#### **Response**
```json
{
  "processed": 2,
  "failed": 0,
  "details": {
    "success_ids": ["evt_123", "evt_124"],
    "failed_events": []
  }
}
```

---

## 📈 Métricas do Sistema

### `GET /metrics/user-behavior`

Obtém métricas detalhadas de comportamento do usuário.

#### **Request**
```http
GET /api/v1/analytics/metrics/user-behavior?start_date=2024-12-01&end_date=2024-12-09&granularity=day
Authorization: Bearer {token}
```

#### **Parameters**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `start_date` | `datetime` | ✅ | Data de início |
| `end_date` | `datetime` | ✅ | Data de fim |
| `granularity` | `string` | ❌ | `hour`, `day`, `week`, `month` |

#### **Response**
```json
{
  "period": {
    "start": "2024-12-01T00:00:00Z",
    "end": "2024-12-09T23:59:59Z",
    "granularity": "day"
  },
  "metrics": {
    "page_views": {
      "total": 1250,
      "daily_breakdown": [
        {"date": "2024-12-01", "value": 142},
        {"date": "2024-12-02", "value": 156}
      ]
    },
    "unique_visitors": {
      "total": 89,
      "daily_breakdown": [...]
    },
    "session_duration": {
      "average": 245.7,
      "median": 180.0,
      "daily_breakdown": [...]
    },
    "bounce_rate": {
      "percentage": 24.5,
      "daily_breakdown": [...]
    }
  },
  "trends": {
    "page_views": "+12.5%",
    "unique_visitors": "+8.3%",
    "session_duration": "-2.1%"
  }
}
```

---

### `GET /metrics/real-time`

Fornece métricas em tempo real do sistema.

#### **Response**
```json
{
  "timestamp": "2024-12-09T10:30:00Z",
  "active_users": 23,
  "active_sessions": 18,
  "events_per_minute": 142,
  "top_pages": [
    {"path": "/dashboard", "views": 8},
    {"path": "/workflows", "views": 5}
  ],
  "system_health": {
    "api_response_time": 85.2,
    "error_rate": 0.12,
    "uptime": 99.98
  }
}
```

---

## 🔍 Consultas Personalizadas

### `POST /queries`

Executa uma consulta personalizada nos dados de analytics.

#### **Request**
```http
POST /api/v1/analytics/queries
Content-Type: application/json
Authorization: Bearer {token}

{
  "query": {
    "select": ["event_type", "COUNT(*)"],
    "from": "events",
    "where": {
      "created_at": {
        "gte": "2024-12-01",
        "lt": "2024-12-09"
      },
      "user_id": 123
    },
    "group_by": ["event_type"],
    "order_by": [{"column": "COUNT(*)", "direction": "desc"}],
    "limit": 10
  },
  "format": "json"
}
```

#### **Response**
```json
{
  "query_id": "qry_abc123",
  "execution_time": 0.245,
  "total_rows": 5,
  "results": [
    {"event_type": "page_view", "count": 45},
    {"event_type": "click", "count": 23},
    {"event_type": "form_submit", "count": 8}
  ],
  "metadata": {
    "cached": false,
    "query_cost": 0.02
  }
}
```

---

## 📊 Dashboards

### `POST /dashboards`

Cria um novo dashboard personalizado.

#### **Request**
```http
POST /api/v1/analytics/dashboards
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Dashboard de Vendas",
  "description": "Métricas de performance de vendas",
  "layout": "grid",
  "widgets": [
    {
      "type": "metric",
      "title": "Conversões Hoje",
      "query": {
        "metric": "conversions",
        "period": "today"
      },
      "position": {"x": 0, "y": 0, "w": 2, "h": 1}
    },
    {
      "type": "chart",
      "title": "Funil de Conversão",
      "chart_type": "funnel",
      "query": {
        "events": ["page_view", "signup", "purchase"],
        "period": "last_30_days"
      },
      "position": {"x": 2, "y": 0, "w": 4, "h": 3}
    }
  ],
  "refresh_interval": 300,
  "is_public": false
}
```

#### **Response**
```json
{
  "id": 456,
  "name": "Dashboard de Vendas",
  "description": "Métricas de performance de vendas",
  "owner_id": 123,
  "layout": "grid",
  "widgets": [...],
  "refresh_interval": 300,
  "is_public": false,
  "created_at": "2024-12-09T10:30:00Z",
  "updated_at": "2024-12-09T10:30:00Z",
  "share_url": null
}
```

---

## 🧠 Insights e IA

### `POST /insights`

Gera insights personalizados usando IA.

#### **Request**
```http
POST /api/v1/analytics/insights
Content-Type: application/json
Authorization: Bearer {token}

{
  "data_sources": ["events", "user_sessions"],
  "time_period": {
    "start": "2024-11-01",
    "end": "2024-12-01"
  },
  "focus_areas": ["user_behavior", "conversion_funnel"],
  "insight_types": ["trends", "anomalies", "recommendations"],
  "ai_model": "gpt-4",
  "context": "E-commerce website analysis"
}
```

#### **Response**
```json
{
  "insight_id": "ins_xyz789",
  "generated_at": "2024-12-09T10:30:00Z",
  "insights": [
    {
      "type": "trend",
      "category": "user_behavior",
      "title": "Aumento no Engajamento Mobile",
      "description": "Usuários mobile demonstram 23% mais engajamento nas últimas 2 semanas",
      "confidence": 0.87,
      "impact": "medium",
      "recommendations": [
        "Otimizar experiência mobile",
        "Investir em features mobile-first"
      ]
    },
    {
      "type": "anomaly",
      "category": "conversion_funnel",
      "title": "Drop na Página de Checkout",
      "description": "Taxa de abandono no checkout aumentou 15% na última semana",
      "confidence": 0.92,
      "impact": "high",
      "recommendations": [
        "Simplificar processo de pagamento",
        "Adicionar mais opções de pagamento"
      ]
    }
  ],
  "data_quality": {
    "completeness": 0.94,
    "accuracy": 0.91,
    "sample_size": 12450
  }
}
```

---

## 📊 Análises Avançadas

### `POST /analysis/funnel`

Executa análise de funil de conversão.

#### **Request**
```http
POST /api/v1/analytics/analysis/funnel
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Funil de Conversão E-commerce",
  "steps": [
    {
      "name": "Visitante",
      "event_type": "page_view",
      "filters": {"page": "/"}
    },
    {
      "name": "Produto Visualizado",
      "event_type": "page_view", 
      "filters": {"page": "/product/*"}
    },
    {
      "name": "Adicionado ao Carrinho",
      "event_type": "add_to_cart"
    },
    {
      "name": "Checkout Iniciado",
      "event_type": "checkout_start"
    },
    {
      "name": "Compra Finalizada",
      "event_type": "purchase"
    }
  ],
  "time_period": {
    "start": "2024-11-01",
    "end": "2024-12-01"
  },
  "conversion_window": "7_days"
}
```

#### **Response**
```json
{
  "funnel_id": "fnl_abc123",
  "name": "Funil de Conversão E-commerce",
  "analysis_date": "2024-12-09T10:30:00Z",
  "total_users": 5420,
  "steps": [
    {
      "step": 1,
      "name": "Visitante",
      "users": 5420,
      "conversion_rate": 100.0,
      "drop_off": 0
    },
    {
      "step": 2,
      "name": "Produto Visualizado",
      "users": 3240,
      "conversion_rate": 59.8,
      "drop_off": 2180
    },
    {
      "step": 3,
      "name": "Adicionado ao Carrinho",
      "users": 890,
      "conversion_rate": 27.5,
      "drop_off": 2350
    },
    {
      "step": 4,
      "name": "Checkout Iniciado",
      "users": 456,
      "conversion_rate": 51.2,
      "drop_off": 434
    },
    {
      "step": 5,
      "name": "Compra Finalizada",
      "users": 234,
      "conversion_rate": 51.3,
      "drop_off": 222
    }
  ],
  "overall_conversion_rate": 4.32,
  "insights": [
    "Maior drop-off entre visualização e carrinho (72.5%)",
    "Taxa de conversão checkout-compra está boa (51.3%)"
  ]
}
```

---

## 🚨 Sistema de Alertas

### `POST /alerts`

Cria um alerta automático baseado em métricas.

#### **Request**
```http
POST /api/v1/analytics/alerts
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Alto Erro Rate API",
  "description": "Alerta quando erro rate da API excede 5%",
  "metric": "api_error_rate",
  "condition": {
    "operator": "greater_than",
    "threshold": 5.0,
    "period": "5_minutes"
  },
  "channels": [
    {
      "type": "email",
      "destination": "admin@empresa.com"
    },
    {
      "type": "webhook",
      "destination": "https://hooks.slack.com/..."
    }
  ],
  "frequency": "immediate",
  "is_active": true
}
```

#### **Response**
```json
{
  "id": 789,
  "name": "Alto Erro Rate API",
  "description": "Alerta quando erro rate da API excede 5%",
  "owner_id": 123,
  "metric": "api_error_rate",
  "condition": {
    "operator": "greater_than",
    "threshold": 5.0,
    "period": "5_minutes"
  },
  "channels": [...],
  "frequency": "immediate",
  "is_active": true,
  "last_triggered": null,
  "trigger_count": 0,
  "created_at": "2024-12-09T10:30:00Z"
}
```

---

## 📊 Exemplos de Uso Avançado

### **Análise de Jornada do Usuário**

```python
# 1. Rastrear eventos da jornada
events_to_track = [
    {"event_type": "landing_page", "properties": {"source": "google"}},
    {"event_type": "signup_form_view", "properties": {"form_id": "main"}},
    {"event_type": "signup_complete", "properties": {"method": "email"}},
    {"event_type": "first_workflow_create", "properties": {"template": "basic"}}
]

# 2. Criar funil de análise
funnel_config = {
    "steps": [
        {"name": "Landing", "event_type": "landing_page"},
        {"name": "Form View", "event_type": "signup_form_view"},
        {"name": "Signup", "event_type": "signup_complete"},
        {"name": "First Workflow", "event_type": "first_workflow_create"}
    ]
}

# 3. Configurar dashboard
dashboard_config = {
    "widgets": [
        {"type": "funnel", "config": funnel_config},
        {"type": "metric", "metric": "conversion_rate"},
        {"type": "chart", "metric": "daily_signups"}
    ]
}
```

### **Monitoramento de Performance**

```python
# Métricas em tempo real
real_time_metrics = [
    "active_users",
    "api_response_time", 
    "error_rate",
    "throughput"
]

# Alertas automáticos
performance_alerts = [
    {
        "metric": "api_response_time",
        "threshold": 2000,  # 2 segundos
        "action": "scale_up"
    },
    {
        "metric": "error_rate", 
        "threshold": 1.0,   # 1%
        "action": "notify_team"
    }
]
```

---

## 📈 Métricas de Performance

### **Benchmarks de Resposta**
- **Eventos simples**: < 50ms
- **Consultas analytics**: < 500ms
- **Relatórios complexos**: < 2s
- **Dashboards**: < 1s

### **Limites de Rate**
- **Eventos**: 1000/min por usuário
- **Consultas**: 100/min por usuário
- **Dashboards**: 50/min por usuário

### **Retenção de Dados**
- **Eventos raw**: 13 meses
- **Métricas agregadas**: 36 meses
- **Logs de sistema**: 90 dias

---

## 🔒 Segurança e Compliance

### **Autenticação**
- JWT Bearer tokens obrigatórios
- Refresh token para sessões longas
- Rate limiting por endpoint

### **Autorização**
- Usuários só acessam próprios dados
- Admins têm acesso a métricas globais
- Workspaces isolados

### **Privacidade**
- Dados sensíveis automaticamente mascarados
- Opção de anonimização de usuários
- Compliance com LGPD/GDPR

---

**Última atualização**: Dezembro 2024  
**Versão da API**: v1  
**Status**: Estável 