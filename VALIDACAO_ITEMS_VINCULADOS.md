# 🔒 Validação de Items Vinculados - Documentação

## O que é?

**Validação de Items Vinculados** é um mecanismo de proteção que impede a deleção de clientes que possuem pedidos ou produtos que estão em itens de pedidos.

**Exemplo prático:**
- Você tenta deletar o cliente "Leandro Tecnologia"
- Sistema verifica se este cliente tem pedidos no banco
- Se sim: **bloqueia a deleção** e retorna erro: `"Não é possível deletar um cliente que possui pedidos vinculados."`
- Se não: permite deletar normalmente ✅

---

## Por que fazer isso?

Se você deletasse um cliente/produto que tem pedidos/items vinculados, causaria:
- ❌ Integridade referencial quebrada
- ❌ Pedidos órfãos no banco de dados
- ❌ Dados inconsistentes
- ❌ Relatórios e queries quebradas

Com a validação:
- ✅ Banco sempre fica consistente
- ✅ Nenhuma orfandade de dados
- ✅ Usuário recebe feedback claro do por quê não pode deletar

---

## Como Funciona?

### 1. **Fluxo de Deleção de Cliente**

```
DELETE /api/clientes/{id}
         │
         ▼
┌──────────────────────────────┐
│ ClienteController.Deletar()  │
└──────────────────────────────┘
         │
         ├─► try {
         │     ClienteService.DeletarAsync(id)
         │   }
         │   catch (ArgumentException ex) {
         │     return BadRequest(400)
         │   }
         │
         ▼
┌──────────────────────────────┐
│ ClienteService.DeletarAsync()│
└──────────────────────────────┘
         │
         ├─► if (repository.TemPedidosVinculadosAsync(id))
         │       throw new ArgumentException("...")
         │
         ├─► else
         │       repository.RemoverAsync(id)
         │
         ▼
┌──────────────────────────────┐
│ ClienteRepository            │
│ TemPedidosVinculadosAsync()  │
└──────────────────────────────┘
         │
         ▼
   SELECT COUNT(*) FROM Pedido
   WHERE CodCliente = @id
         │
         ├─► Se COUNT > 0: retorna true (tem pedidos)
         │
         └─► Se COUNT = 0: retorna false (sem pedidos)
```

### 2. **Fluxo de Deleção de Produto**

Mesma lógica, mas verifica items em pedidos:

```csharp
if (await repository.TemItensVinculadosAsync(id))
    throw new ArgumentException("Não é possível deletar um produto que possui itens em pedidos vinculados.");
```

---

## Mudanças de Código

### 1️⃣ **ClienteRepository.cs** - Novo método

```csharp
public async Task<bool> TemPedidosVinculadosAsync(int clienteId)
{
    using var connection = _connectionFactory.CreateConnection();
    await connection.OpenAsync();

    const string sql = "SELECT COUNT(*) FROM Pedido WHERE CodCliente = @ClienteId";
    var count = await connection.ExecuteScalarAsync<int>(sql, new { ClienteId = clienteId });
    return count > 0;
}
```

**O que faz:**
- Abre conexão com banco
- Conta quantos pedidos existem pra este cliente
- Retorna `true` se tem pelo menos 1 pedido, `false` se não tem nenhum

### 2️⃣ **IClienteRepository.cs** - Contrato

```csharp
public interface IClienteRepository
{
    // ... outros métodos ...
    Task<bool> TemPedidosVinculadosAsync(int clienteId);
}
```

**Por quê:**
- Interface define o contrato
- Qualquer implementação deve ter este método
- Permite testes com mocks

### 3️⃣ **ClienteService.cs** - Validação na deleção

**Antes:**
```csharp
public async Task<bool> DeletarAsync(int id)
{
    return await _clienteRepository.RemoverAsync(id);
}
```

**Depois:**
```csharp
public async Task<bool> DeletarAsync(int id)
{
    if (await _clienteRepository.TemPedidosVinculadosAsync(id))
        throw new ArgumentException("Não é possível deletar um cliente que possui pedidos vinculados.");

    return await _clienteRepository.RemoverAsync(id);
}
```

**O que muda:**
- Antes de deletar, verifica se tem pedidos
- Se tem → lança `ArgumentException` (o serviço avisa do erro)
- Se não tem → deleta normalmente

### 4️⃣ **ClienteController.cs** - Tratamento de erro

**Antes:**
```csharp
[HttpDelete("{id}")]
public async Task<IActionResult> Deletar(int id)
{
    var deletado = await _clienteService.DeletarAsync(id);

    if (!deletado)
        return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });

    return NoContent();
}
```

**Depois:**
```csharp
[HttpDelete("{id}")]
public async Task<IActionResult> Deletar(int id)
{
    try
    {
        var deletado = await _clienteService.DeletarAsync(id);

        if (!deletado)
            return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });

        return NoContent();
    }
    catch (ArgumentException ex)
    {
        return BadRequest(new { mensagem = ex.Message });
    }
}
```

**O que muda:**
- Agora captura `ArgumentException`
- Retorna 400 Bad Request com mensagem do erro
- Frontend recebe mensagem clara: `"Não é possível deletar um cliente que possui pedidos vinculados."`

### 5️⃣ **ProdutoRepository.cs** - Mesmo padrão pro Produto

```csharp
public async Task<bool> TemItensVinculadosAsync(int produtoId)
{
    using var connection = _connectionFactory.CreateConnection();
    await connection.OpenAsync();

    const string sql = "SELECT COUNT(*) FROM ItensPedidos WHERE CodProduto = @ProdutoId";
    var count = await connection.ExecuteScalarAsync<int>(sql, new { ProdutoId = produtoId });
    return count > 0;
}
```

### 6️⃣ **ProdutoService.cs** - Validação na deleção

```csharp
public async Task<bool> RemoverAsync(int id)
{
    if (id <= 0)
        throw new ArgumentException("O ID do produto é inválido.");

    if (await _produtoRepository.TemItensVinculadosAsync(id))
        throw new ArgumentException("Não é possível deletar um produto que possui itens em pedidos vinculados.");

    return await _produtoRepository.RemoverAsync(id);
}
```

**Nota:** ProdutoController já tinha o try-catch, então não precisou mudar.

---

## Sequência de Chamadas

```
Usuario clica "Deletar Cliente"
         │
         ▼
HTTP DELETE /api/clientes/1
         │
         ▼
ClienteController.Deletar(1) [try-catch]
         │
         ▼
ClienteService.DeletarAsync(1)
         │
         ├─► TemPedidosVinculadosAsync(1)
         │    ├─► SELECT COUNT(*) FROM Pedido WHERE CodCliente = 1
         │    ├─► Resultado: 2 (tem 2 pedidos)
         │    └─► retorna true
         │
         ├─► throw ArgumentException("Não é possível...")
         │
         ▼
ClienteController catch (ArgumentException)
         │
         ▼
return BadRequest(400) { mensagem: "Não é possível..." }
         │
         ▼
Frontend mostra erro: "Não é possível deletar um cliente que possui pedidos vinculados."
```

---

## Como Testar

### 1. Deletar Cliente SEM pedidos ✅

**Antes:**
- Cliente "João Silva" não tem nenhum pedido

**Fazer:**
```bash
DELETE /api/clientes/5
Authorization: Bearer <JWT>
```

**Resultado:**
- ✅ 204 No Content (sucesso)
- Cliente deletado

### 2. Deletar Cliente COM pedidos ❌

**Antes:**
- Cliente "Leandro Tecnologia" tem 2 pedidos

**Fazer:**
```bash
DELETE /api/clientes/1
Authorization: Bearer <JWT>
```

**Resultado:**
- ❌ 400 Bad Request
```json
{
  "mensagem": "Não é possível deletar um cliente que possui pedidos vinculados."
}
```
- Cliente **NÃO** é deletado

### 3. Deletar Produto EM itens ❌

**Antes:**
- Produto "Monitor Acer" tem 3 items em pedidos

**Fazer:**
```bash
DELETE /api/produtos/1
Authorization: Bearer <JWT>
```

**Resultado:**
- ❌ 400 Bad Request
```json
{
  "mensagem": "Não é possível deletar um produto que possui itens em pedidos vinculados."
}
```
- Produto **NÃO** é deletado

---

## Arquitetura

### Camadas

```
┌─────────────────────┐
│   Controller        │ ← Trata HTTP, captura exceções
│  ClienteController  │
├─────────────────────┤
│   Service           │ ← Regras de negócio, validações
│  ClienteService     │
├─────────────────────┤
│   Repository        │ ← Acesso ao banco
│ ClienteRepository   │
├─────────────────────┤
│   Database          │
│  SQL Server         │
└─────────────────────┘
```

**Fluxo de responsabilidades:**
1. **Controller** → Trata HTTP, captura erros de negócio
2. **Service** → Valida regras de negócio (tem pedidos? pode deletar?)
3. **Repository** → Executa SQL puro (SELECT COUNT, DELETE)

---

## Por que Dessa Forma?

### ✅ Separação de Responsabilidades
- Repository: SQL puro
- Service: Lógica de negócio
- Controller: HTTP e tratamento de erro

### ✅ Testável
```csharp
// Mock do repository pra testar service
var mockRepo = new Mock<IClienteRepository>();
mockRepo.Setup(r => r.TemPedidosVinculadosAsync(1))
        .ReturnsAsync(true); // cliente tem pedidos

var service = new ClienteService(mockRepo.Object);
var ex = Assert.ThrowsAsync<ArgumentException>(
    () => service.DeletarAsync(1)
);
Assert.That(ex.Message, Contains.Substring("pedidos vinculados"));
```

### ✅ Mensagens Claras
- Usuário sabe exatamente por quê não pode deletar
- Frontend mostra erro específico, não genérico

### ✅ Consistência de Dados
- Banco sempre fica com integridade referencial
- Nenhuma orfandade de dados

---

## Melhorias Futuras

1. **Soft Delete** - Marcar como deletado ao invés de apagar
   ```csharp
   UPDATE Cliente SET Ativo = 0 WHERE CodCliente = @id
   ```

2. **Cascata Configurável** - Opção de deletar tudo junto
   ```csharp
   DELETE FROM ItensPedidos WHERE CodPedido IN (...)
   DELETE FROM Pedido WHERE CodCliente = @id
   DELETE FROM Cliente WHERE CodCliente = @id
   ```

3. **Auditoria** - Log de quem tentou deletar e por quê foi bloqueado
   ```csharp
   INSERT INTO AuditoriaDelete (Usuario, Tabela, Id, Motivo, Data)
   VALUES (@usuario, 'Cliente', @id, 'Tem pedidos', GETDATE())
   ```

---

## Resumo

| Aspecto | Implementação |
|---------|---------------|
| **Validação Cliente** | `TemPedidosVinculadosAsync()` |
| **Validação Produto** | `TemItensVinculadosAsync()` |
| **Erro de Negócio** | `ArgumentException` |
| **HTTP Status** | 400 Bad Request |
| **Mensagem** | Específica e clara |
| **Banco de Dados** | Sempre consistente |
| **Testabilidade** | 100% testável |

✅ **Feature pronta para uso!**
