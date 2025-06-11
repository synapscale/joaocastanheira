# CONTRIBUTING.md

## 🤝 Contribuindo para o SynapScale

Obrigado por seu interesse em contribuir para o SynapScale! Este guia irá ajudá-lo a começar.

## 📋 Código de Conduta

Ao participar deste projeto, você concorda em seguir nosso código de conduta. Seja respeitoso e construtivo em todas as interações.

## 🚀 Como Contribuir

### 1. **Reportar Bugs**
- Use o template de issue para bugs
- Inclua passos para reproduzir
- Adicione screenshots se aplicável
- Especifique versão e ambiente

### 2. **Sugerir Funcionalidades**
- Use o template de feature request
- Descreva o problema que resolve
- Proponha uma solução detalhada
- Considere alternativas

### 3. **Contribuir com Código**
- Fork o repositório
- Crie uma branch para sua feature
- Siga os padrões de código
- Adicione testes quando necessário
- Atualize a documentação

## 🛠️ Configuração do Ambiente

### Backend
```bash
# Clone o repositório
git clone <repository-url>
cd synapse-backend-agents-jc

# Configure o ambiente
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure as variáveis
cp .env.example .env
# Edite o .env com suas configurações

# Execute os testes
pytest
```

### Frontend
```bash
# Clone o repositório
git clone <repository-url>
cd joaocastanheira-main

# Instale dependências
npm install

# Configure as variáveis
cp .env.example .env.local
# Edite o .env.local com suas configurações

# Execute os testes
npm test
```

## 📝 Padrões de Código

### Backend (Python)
- Siga PEP 8
- Use type hints
- Docstrings para funções públicas
- Máximo 88 caracteres por linha
- Use Black para formatação

### Frontend (TypeScript)
- Use ESLint + Prettier
- Componentes em PascalCase
- Hooks com prefixo "use"
- Props tipadas com interfaces
- Máximo 100 caracteres por linha

## 🧪 Testes

### Backend
```bash
# Executar todos os testes
pytest

# Com coverage
pytest --cov=src

# Testes específicos
pytest tests/test_auth.py
```

### Frontend
```bash
# Executar todos os testes
npm test

# Com coverage
npm run test:coverage

# Testes E2E
npm run test:e2e
```

## 📚 Documentação

- Atualize README.md se necessário
- Documente APIs no Swagger
- Adicione comentários em código complexo
- Mantenha CHANGELOG.md atualizado

## 🔄 Processo de Review

1. **Crie um Pull Request**
   - Título descritivo
   - Descrição detalhada
   - Link para issues relacionadas

2. **Checklist do PR**
   - [ ] Testes passando
   - [ ] Código formatado
   - [ ] Documentação atualizada
   - [ ] Sem conflitos

3. **Review**
   - Aguarde review de um maintainer
   - Responda aos comentários
   - Faça ajustes se necessário

## 🏷️ Convenções de Commit

Use Conventional Commits:

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem mudança de funcionalidade
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

Exemplos:
```
feat(auth): adiciona autenticação JWT
fix(api): corrige validação de email
docs(readme): atualiza instruções de instalação
```

## 🎯 Prioridades

### Alta Prioridade
- Correções de segurança
- Bugs críticos
- Performance

### Média Prioridade
- Novas funcionalidades
- Melhorias de UX
- Refatorações

### Baixa Prioridade
- Documentação
- Testes adicionais
- Otimizações menores

## 📞 Suporte

- **Issues**: Para bugs e feature requests
- **Discussions**: Para perguntas gerais
- **Email**: Para questões de segurança

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

---

Obrigado por contribuir para o SynapScale! 🚀

