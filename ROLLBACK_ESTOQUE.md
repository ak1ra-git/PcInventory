# 📦 Rollback de Estoque - Documentação

## O que é?

**Rollback de Estoque** é o processo de devolver os produtos de um pedido ao estoque quando aquele pedido é cancelado.

**Exemplo prático:**
- Cliente faz pedido de 5 unidades do Produto A
- Estoque diminui: 10 → 5
- Cliente cancela o pedido
- Estoque volta: 5 → 10 ✅

---

## Como Funciona?

### 1. **Estrutura do Banco de Dados**

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│     Pedido      │         │  ItensPedidos    │         │   Produtos   │
├─────────────────┤         ├──────────────────┤         ├──────────────┤
│ CodPedido (PK)  │◄────┤   │ CodPedido (FK)   │    ┌─►│CodProduto(PK)│
│ CodCliente (FK) │     │   │ CodProduto (FK)  │────┤   │ Estoque      │
│ DataPedido      │     │   │ Quantidade       │    │   │ Preço        │
│ ValorTotal      │     │   │ PrecoUnitario    │    │   └──────────────┘
│ Status ← NOVO   │     │   └──────────────────┘    │
└─────────────────┘     └────────────────────────────┘
         │ Status = 'Ativo' ou 'Cancelado'
         └─ Adicionado neste trabalho
```

### 2. **Fluxo de Cancelamento**

```
POST /api/pedidos/{id}/cancelar
         │
         ▼
┌──────────────────────────────────┐
│ CancelarPedidoAsync()            │
│ (PedidoService.cs:62)            │
└──────────────────────────────────┘
         │
         ├─► 1. Inicia Transação SQL
         │
         ├─► 2. UPDATE Pedido
         │       SET Status = 'Cancelado'
         │       WHERE CodPedido = @id
         │
         ├─► 3. UPDATE Produtos
         │       SET Estoque = Estoque + Quantidade
         │       (para cada item do pedido)
         │
         └─► 4. Commit Transação
                 (se tudo ok) ou Rollback (se erro)
```

---

## Mudanças Feitas

### 1️⃣ **Banco de Dados**

```sql
ALTER TABLE Pedido ADD Status NVARCHAR(20) DEFAULT 'Ativo';
```

- Adicionou coluna `Status` na tabela Pedido
- Valores: `'Ativo'` (padrão) ou `'Cancelado'`

### 2️⃣ **Backend - PedidoService.cs**

```csharp
public async Task<bool> CancelarPedidoAsync(int codPedido)
{
    // 1. Marca pedido como Cancelado
    UPDATE Pedido SET Status = 'Cancelado' WHERE CodPedido = @id
    
    // 2. Devolve estoque dos produtos
    UPDATE Produtos 
    SET Estoque = Estoque + (quantidades do pedido)
    WHERE CodProduto IN (produtos do pedido)
}
```

**Pontos importantes:**
- ✅ Usa **Transação SQL** (tudo ou nada)
- ✅ **ISNULL** para evitar valores nulos
- ✅ **Logging** de sucesso e erro
- ✅ Injeção de dependência (ConnectionFactory, ILogger)

### 3️⃣ **Interface - IPedidoService.cs**

```csharp
Task<bool> CancelarPedidoAsync(int codPedido);
```

- Contrato do método que implementa o cancelamento

### 4️⃣ **Endpoint - PedidosController.cs**

```csharp
[HttpPost("{id}/cancelar")]
public async Task<ActionResult> Cancelar(int id)
{
    var cancelado = await _pedidoService.CancelarPedidoAsync(id);
    // Retorna 200 OK com mensagem de sucesso
}
```

---

## Como Usar?

### 📡 **Fazer Requisição**

```bash
POST https://localhost:5001/api/pedidos/1/cancelar
Authorization: Bearer <JWT_TOKEN>
```

### ✅ **Resposta de Sucesso (200)**

```json
{
  "mensagem": "Pedido 1 cancelado com sucesso. Estoque restaurado."
}
```

### ❌ **Resposta de Erro (400)**

```json
{
  "mensagem": "Erro ao cancelar pedido: ..."
}
```

### ❓ **Pedido Não Encontrado (404)**

```json
{
  "mensagem": "Pedido com ID 999 não encontrado."
}
```

---

## Exemplo Prático

### **Antes do Cancelamento**

```
Pedido 1:
├── Produto A: 5 unidades (Estoque: 10 → 5)
└── Produto B: 3 unidades (Estoque: 20 → 17)

Banco:
- Pedido 1: Status = 'Ativo'
- Produtos.Estoque = {A: 5, B: 17}
```

### **Após Cancelamento**

```bash
POST /api/pedidos/1/cancelar
```

```
Pedido 1:
├── Status alterado para 'Cancelado'
├── Produto A: estoque volta +5 (5 → 10)
└── Produto B: estoque volta +3 (17 → 20)

Banco:
- Pedido 1: Status = 'Cancelado'
- Produtos.Estoque = {A: 10, B: 20}
```

---

## Por Que Usar Transação?

Se o banco cair **no meio** do cancelamento:

❌ **Sem Transação:**
- Pedido marcado como cancelado ✅
- Estoque NÃO foi restaurado ❌
- **Inconsistência de dados!**

✅ **Com Transação:**
- Se tudo OK → **Commit** (ambos salvam)
- Se erro → **Rollback** (ambos descartam)
- Banco sempre fica **consistente**

---

## Segurança

- ✅ Endpoint protegido com `[Authorize]`
- ✅ Só usuários autenticados podem cancelar
- ✅ Logging de todas as operações
- ✅ Tratamento de erros robusto

---

## Próximos Passos

1. ✅ Testar cancelamento
2. ⏳ Implementar validações (ex: não cancelar 2x)
3. ⏳ Adicionar histórico de cancelamentos
4. ⏳ Enviar notificação ao cliente

