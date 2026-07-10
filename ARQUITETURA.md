# Arquitetura do PC Inventory

## 📋 Visão Geral

**PC Inventory** é uma aplicação de gestão de inventário dividida em duas camadas:

- **Backend:** ASP.NET Core (.NET 10) - API REST em C#
- **Frontend:** Next.js 14 - Interface em React + TypeScript + Tailwind CSS

**Propósito:** Sistema completo para gerenciar clientes, produtos, pedidos e itens de pedidos.

---

## 📁 Estrutura do Projeto

### Backend (`/backend`)

```
Controllers/        → Endpoints HTTP (entrada de requisições)
├── ClienteController.cs
├── ProdutoController.cs
├── PedidosController.cs
└── ItensPedidoController.cs

Services/           → Lógica de negócio (validações, regras)
├── ClienteService.cs
├── ProdutoService.cs
├── PedidoService.cs
└── ItensPedidoService.cs

Repositories/       → Acesso a dados (SQL Server via Dapper)
├── ClienteRepository.cs
├── ProdutoRepository.cs
├── PedidoRepository.cs
└── ItensPedidoRepository.cs

Models/             → Entidades de domínio
├── Cliente.cs
├── Produto.cs
├── Pedido.cs
└── ItensPedidos.cs

Interfaces/         → Contratos (abstração)
├── IClienteService.cs
├── IClienteRepository.cs
├── ... (outros)

Database/
└── ConnectionFactory.cs → Factory para SQL Server

Middlewares/
└── ExceptionMiddleware.cs → Tratamento global de erros

Program.cs          → Configuração DI, CORS, Swagger
```

### Frontend (`/frontend`)

```
src/
├── app/                         → Next.js App Router (páginas)
│   ├── page.tsx                 → Página inicial (pedidos)
│   ├── layout.tsx               → Layout raiz
│   ├── Clientes/page.tsx        → Gestão de clientes
│   ├── Produtos/page.tsx        → Gestão de produtos
│   └── Pedidos/
│       ├── [id]/page.tsx        → Detalhes do pedido
│       └── novo/page.tsx        → Criar novo pedido
│
├── components/                  → Componentes reutilizáveis
│   ├── Navbar.tsx
│   ├── Modal.tsx
│   ├── Input.tsx
│   └── PedidoCard.tsx
│
└── lib/
    ├── api.ts                   → Cliente HTTP (apiFetch)
    └── types.ts                 → Tipos TypeScript
```

---

## 🎯 Responsabilidade de Cada Camada

| Camada | Responsabilidade | Exemplo |
|--------|------------------|---------|
| **Controller** | Receber HTTP, validar input, chamar service | `ClienteController.Adicionar()` |
| **Service** | Regras de negócio, validações | `ClienteService.ValidarCliente()` |
| **Repository** | Acesso ao BD (SQL, Dapper) | `ClienteRepository.ObterTodosAsync()` |
| **Model** | Entidade de domínio | `class Cliente { int CodCliente; }` |
| **Frontend Page** | Gerenciar UI, estado, requisições HTTP | `Clientes/page.tsx` |
| **Frontend Component** | UI reutilizável | `Modal.tsx`, `Input.tsx` |

---

## 🔗 Fluxo de Dados: Criar um Cliente

```
1. Usuario clica em "Salvar Cliente"
   ↓
2. Frontend valida dados (nome, CNPJ, email)
   ↓
3. apiFetch() envia POST para https://localhost:5001/api/clientes
   ↓
4. CORS Middleware valida origem (localhost:3000)
   ↓
5. ClienteController.Adicionar() desserializa JSON
   ↓
6. ClienteService.AdicionarAsync() valida regras de negócio
   ↓
7. ClienteRepository.AdicionarAsync() executa SQL INSERT
   ↓
8. SQL Server persiste e retorna ID gerado
   ↓
9. Resposta volta pela cadeia (Repository → Service → Controller)
   ↓
10. HTTP 201 Created com JSON do cliente
    ↓
11. Frontend atualiza estado (limpa form, recarrega lista)
    ↓
12. React renderiza tabela com novo cliente
```

---

## 💬 Comunicação entre Componentes

### Frontend (React)
- **Props** → Passam dados de parent para child
- **Callbacks** → Child comunica com parent via event handlers
- **useState/useContext** → Gerenciamento de estado local

**Exemplo:** `ClientsPage` → `Modal` → `Input`
- Page gerencia estado global
- Passa state e callbacks como props
- Input dispara onChange que sobe até Page
- Page valida e atualiza estado

### Frontend ↔ Backend
- **fetch API** com `apiFetch()` wrapper
- **JSON** como formato de dados
- **REST endpoints** (GET, POST, PUT, DELETE)
- **CORS** configurado para localhost:3000

### Backend (Injeção de Dependência)
```csharp
// Program.cs registra dependências
builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<IClienteService, ClienteService>();

// Constructor injection
public ClienteController(IClienteService service) {
    _clienteService = service;  // ← Injeção automática
}
```

---

## 🔐 Autenticação

⚠️ **IMPORTANTE:** Atualmente NÃO existe autenticação implementada.

- ✅ CORS liberado apenas para localhost:3000
- ❌ Sem JWT tokens
- ❌ Sem login
- ❌ Sem autorização por roles

**Para implementar:**
1. Adicionar endpoint de login que retorna JWT
2. Frontend inclui token em `Authorization: Bearer <token>`
3. Backend valida token com middleware
4. Proteger endpoints com `[Authorize]`

---

## 🌐 Endpoints da API

| Método | Endpoint | Descrição | Retorno |
|--------|----------|-----------|---------|
| GET | /api/clientes | Listar clientes | 200 + Array |
| POST | /api/clientes | Criar cliente | 201 + Cliente |
| DELETE | /api/clientes/{id} | Deletar cliente | 204 |
| GET | /api/produtos | Listar produtos | 200 + Array |
| POST | /api/pedidos | Criar pedido | 201 + Pedido |
| GET | /api/pedidos/{id} | Detalhes do pedido | 200 + Pedido |
| DELETE | /api/pedidos/{id} | Deletar pedido | 204 |
| POST | /api/pedidos/{id}/itens | Adicionar item | 201 + Item |

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend | ASP.NET Core, C#, Dapper | .NET 10 |
| Frontend | Next.js, React, TypeScript, Tailwind | 14.x / 18.x |
| Banco | SQL Server | 2019+ |
| Comunicação | REST API, HTTP, JSON | - |

---

## ⚙️ Configuração

### Backend (Program.cs)
- Porta HTTP: 5000
- Porta HTTPS: 5001
- Swagger em: https://localhost:5001/swagger
- CORS liberado para: http://localhost:3000

### Frontend
- Porta: 3000
- API Base: https://localhost:5001/api
- Client-side rendering (Next.js App Router)

### Banco de Dados
- Connection String: `appsettings.json`
- ORM: Dapper (SQL puro)
- Factory: `ConnectionFactory.cs`

---

## 📊 Fluxo Completo: Do Click ao Banco

```
🖱️ Usuário clica em botão
  ↓
⚛️ React dispara handleSubmit()
  ↓
✅ Frontend valida dados (CNPJ, email, etc)
  ↓
🌐 apiFetch POST https://localhost:5001/api/clientes
  ↓
🛡️ CORS Middleware valida origem
  ↓
🎯 ClienteController.Adicionar() recebe request
  ↓
📋 ClienteService.AdicionarAsync() valida negócio
  ↓
💾 ClienteRepository.AdicionarAsync() executa SQL
  ↓
🗄️ SQL Server INSERT e retorna ID
  ↓
⬅️ Resposta 201 Created com JSON
  ↓
♻️ Frontend: reloadClients() busca lista atualizada
  ↓
🎨 React renderiza tabela com novo cliente
```

---

## ✅ Padrões de Design Utilizados

1. **Repository Pattern** - Abstrai acesso a dados
2. **Service Layer** - Encapsula lógica de negócio
3. **Dependency Injection** - Loose coupling
4. **REST API** - Padrão HTTP
5. **Clean Architecture** - Camadas bem definidas
6. **React Hooks** - useState, useEffect
7. **TypeScript** - Tipagem estática

---

## 🚀 Melhorias Futuras

- [ ] Implementar autenticação JWT
- [ ] Adicionar testes unitários e integração
- [ ] Sistema de logs estruturado (Serilog)
- [ ] Cache com Redis
- [ ] Paginação nos endpoints
- [ ] FluentValidation para validações robustas
- [ ] Entity Framework ao invés de Dapper puro
- [ ] CI/CD pipeline (GitHub Actions)

---

## 📚 Leitura Recomendada

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)
- [REST API Best Practices](https://restfulapi.net/)
- [Next.js Documentation](https://nextjs.org/docs)
- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
