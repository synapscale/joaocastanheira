# 🚀 Deploy na Vercel

## 📋 Pré-requisitos
- Conta na [Vercel](https://vercel.com)
- Repositório Git (GitHub, GitLab, Bitbucket)
- Backend rodando (Render, Railway, etc.)

## 🔧 Configuração Passo a Passo

### 1. **Preparar Repositório**
```bash
# Fazer push do código para seu repositório Git
git add .
git commit -m "Deploy para Vercel"
git push origin main
```

### 2. **Conectar na Vercel**
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Importe seu repositório Git
4. Configure:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. **Configurar Variáveis de Ambiente**
No dashboard da Vercel, adicione:

```env
# API Backend (substitua pela URL do seu backend)
NEXT_PUBLIC_API_URL=https://seu-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://seu-backend.onrender.com

# Ambiente
NEXT_PUBLIC_APP_ENV=production
```

### 4. **Deploy**
1. Clique em "Deploy"
2. Aguarde o build
3. Acesse a URL fornecida pela Vercel

## 🔧 Configurações Avançadas

### Custom Domain
1. Vá em "Settings" → "Domains"
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

### Environment Variables por Branch
- **Production**: `main` branch
- **Preview**: outras branches
- **Development**: local

## 🔍 Verificação

### Aplicação
```
https://seu-app.vercel.app
```

### Build Logs
- Dashboard Vercel → "Functions" → "View Logs"

## 🐛 Troubleshooting

### Build Falha
```bash
# Verificar localmente
npm run build

# Verificar dependências
npm install
```

### Runtime Error
- Verifique variáveis de ambiente
- Confirme URL do backend
- Veja logs no dashboard

### Conectividade Backend
- Teste URL do backend
- Verifique CORS no backend
- Confirme HTTPS

## 📊 Monitoramento
- **Analytics**: Vercel Analytics
- **Performance**: Web Vitals
- **Logs**: Function logs

## 🔄 Atualizações
Deploy automático a cada push:
- **main** → Production
- **outras branches** → Preview

## 🌐 URLs Finais
Após deploy bem-sucedido:
- **Frontend**: `https://seu-app.vercel.app`
- **Backend**: `https://seu-backend.onrender.com`
- **API Docs**: `https://seu-backend.onrender.com/docs`

## ⚙️ Configuração CORS
Atualize o backend com a URL do frontend:
```env
BACKEND_CORS_ORIGINS=["https://seu-app.vercel.app"]
```

