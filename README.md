# PC Inventory 🖥️

Sistema de gestão de pedidos, produtos e clientes para gerenciamento de inventário de computadores.

## 🚀 Tecnologias

### Backend
- **ASP.NET Core 10** com C#
- **SQL Server** para banco de dados
- **Autenticação JWT** para segurança
- **Dapper** para queries otimizadas
- **Swagger** para documentação da API

### Frontend
- **Next.js 14** com React e TypeScript
- **Tailwind CSS** para estilização
- **Session Storage** para armazenamento de tokens
- **Responsive Design** com suporte mobile

## 📋 Funcionalidades

✅ **Autenticação JWT** - Login seguro com tokens de acesso e refresh
✅ **Gestão de Clientes** - CRUD completo com validação de CNPJ
✅ **Gestão de Produtos** - Controle de estoque e preços
✅ **Gestão de Pedidos** - Criar, visualizar e deletar pedidos
✅ **Itens de Pedidos** - Adicionar múltiplos produtos por pedido
✅ **Filtros Avançados** - Filtrar pedidos por cliente e data
✅ **UI Responsiva** - Funciona perfeitamente em desktop e mobile
✅ **Tratamento de Erros** - Mensagens claras ao usuário
✅ **Retry Automático** - API com retry em caso de falha

## 🛠️ Instalação

### Pré-requisitos
- **.NET 10 SDK** - [Download](https://dotnet.microsoft.com/download)
- **Node.js 18+** - [Download](https://nodejs.org)
- **SQL Server Express** - [Download](https://www.microsoft.com/en-us/sql-server/sql-server-express)

### Backend

```bash
cd backend

# Instalar pacotes NuGet
dotnet restore

# Configurar banco de dados (appsettings.json)
# Altere a ConnectionString se necessário

# Executar aplicação
dotnet run
```

O backend rodará em `https://localhost:5001`

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

O frontend rodará em `http://localhost:3000`

## 👤 Credenciais de Teste

```
Email: admin@pcinventory.com
Senha: admin123

Email: user@pcinventory.com
Senha: user123
```

## 📁 Estrutura do Projeto

```
PcInventory/
├── backend/
│   ├── Controllers/          # Endpoints da API
│   ├── Services/            # Lógica de negócio
│   ├── Repositories/        # Acesso a dados
│   ├── Models/              # Entidades
│   ├── DTOs/                # Data Transfer Objects
│   ├── Middlewares/         # Middlewares customizados
│   ├── Database/            # Conexão com banco
│   └── Program.cs           # Configuração principal
│
└── frontend/
    ├── src/
    │   ├── app/             # Páginas (Next.js App Router)
    │   ├── components/      # Componentes React
    │   ├── lib/             # Utilitários e helpers
    │   │   ├── api.ts       # Camada de requisições HTTP
    │   │   ├── auth.ts      # Autenticação e tokens
    │   │   ├── masks.ts     # Formatação de inputs
    │   │   └── types.ts     # Tipos TypeScript
    │   └── middleware.ts    # Next.js middleware
    └── public/              # Arquivos estáticos
```

## 🔐 Autenticação

### Fluxo de Login

1. Usuário acessa `/login`
2. Digita email e senha
3. Backend valida credenciais e retorna:
   - `accessToken` (15 minutos de duração)
   - `refreshToken` (7 dias de duração)
4. Frontend armazena tokens em `sessionStorage`
5. Todas requisições incluem: `Authorization: Bearer <token>`
6. Se token expira, frontend tenta renovar automaticamente

### Proteção de Rotas

Rotas protegidas verificam autenticação no cliente e redirecionam para `/login` se necessário.

## 📊 Banco de Dados

### Tabelas

**CLIENTE**
- `codCliente` (PK)
- `nome`
- `cnpj` (único)
- `email`

**PRODUTOS**
- `codProduto` (PK)
- `nome`
- `preco`
- `estoque`

**PEDIDO**
- `codPedido` (PK)
- `codCliente` (FK)
- `dataPedido`
- `valorTotal`

**ITENSPEDIDOS**
- `codItensPedido` (PK)
- `codPedido` (FK)
- `codProduto` (FK)
- `quantidade`
- `precoUnitario`

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/refresh` - Renovar token

### Clientes (requer autenticação)
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `DELETE /api/clientes/{id}` - Deletar cliente

### Produtos (requer autenticação)
- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto
- `DELETE /api/produtos/{id}` - Deletar produto

### Pedidos (requer autenticação)
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Criar pedido
- `GET /api/pedidos/{id}` - Detalhes do pedido
- `DELETE /api/pedidos/{id}` - Deletar pedido

### Itens de Pedidos (requer autenticação)
- `GET /api/pedidos/{pedidoId}/itens` - Listar itens
- `POST /api/pedidos/{pedidoId}/itens` - Adicionar item

## 📝 Documentação Adicional

- [ARQUITETURA.md](./ARQUITETURA.md) - Arquitetura completa do projeto
- [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md) - Documentação do banco de dados

## 🐛 Troubleshooting

### "Connection refused" ao conectar com backend
- Verifique se backend está rodando em `https://localhost:5001`
- Verifique firewall
- Reinicie a aplicação

### CNPJ/Email inválido
- CNPJ deve ter 14 dígitos
- Email deve ser válido
- Verifique se não há duplicatas no banco

### Token expirado
- O frontend tenta renovar automaticamente
- Se ainda falhar, faça login novamente

## 📦 Deploy

### Backend (Azure/AWS)
1. Publique com `dotnet publish -c Release`
2. Configure variáveis de ambiente
3. Deploy o diretório publicado

### Frontend (Vercel/Netlify)
1. Conecte o repositório GitHub
2. Configure variáveis de ambiente
3. Deploy automático em push para `main`

**Desenvolvido por Mateus! ultilizando ASP.NET Core + Next.js**
