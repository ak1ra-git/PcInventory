# 🗄️ Documentação do Banco de Dados - PC Inventory

## 📋 Sumário
1. [Visão Geral](#visão-geral)
2. [Diagrama ER](#diagrama-er)
3. [Tabelas](#tabelas)
4. [Relacionamentos](#relacionamentos)
5. [Scripts SQL](#scripts-sql)
6. [Integridade Referencial](#integridade-referencial)

---

## Visão Geral

**Banco de Dados:** SQL Server  
**Tipo:** Relacional (OLTP)  
**Propósito:** Gestão de inventário de computadores  
**Tabelas:** 4 principais + junction table  

**Características:**
- Chaves primárias (PK) em IDENTITY (auto-increment)
- Chaves estrangeiras (FK) para integridade referencial
- Transações ACID para operações críticas
- Sem criptografia (implementar em produção)

---

## Diagrama ER

```
┌─────────────────┐
│    CLIENTE      │
├─────────────────┤
│ PK: CodCliente  │ ◄─────────┐
│ • CNPJ          │           │
│ • Nome          │           │ FK
│ • Email         │           │
│ • DataCadastro  │           │
└─────────────────┘           │
                              │
                     ┌────────────────┐
                     │    PEDIDO      │
                     ├────────────────┤
                     │ PK: CodPedido  │ ◄───────────┐
                     │ • CodCliente FK│             │
                     │ • DataPedido   │             │ FK
                     │ • ValorTotal   │             │
                     └────────────────┘             │
                              ▲                     │
                              │ FK (composite)      │
                              │                     │
                     ┌────────────────────┐         │
                     │  ITENSPEDIDOS      │         │
                     ├────────────────────┤         │
                     │ PK: CodPedido + CodProduto  │
                     │ • Quantidade       │         │
                     │ • PrecoUnitario    │         │
                     │ • NomeProduto (derived)     │
                     └────────────────────┘         │
                              ▲                     │
                              │ FK                  │
                              │                     │
                     ┌─────────────────┐            │
                     │    PRODUTOS     │            │
                     ├─────────────────┤            │
                     │ PK: CodProduto  │ ◄──────────┘
                     │ • Nome          │
                     │ • Preco         │
                     │ • Estoque       │
                     └─────────────────┘
```

---

## Tabelas

### 1. **CLIENTE**

Armazena informações dos clientes (empresas).

| Campo | Tipo | PK/FK | NULL | Descrição |
|-------|------|-------|------|-----------|
| **CodCliente** | INT | PK | ❌ | Identificador único do cliente (IDENTITY) |
| **CNPJ** | VARCHAR(14) | ❌ | ❌ | CNPJ do cliente (sem formatação, 14 dígitos) |
| **Nome** | VARCHAR(MAX) | ❌ | ❌ | Razão social ou nome da empresa |
| **Email** | VARCHAR(MAX) | ❌ | ❌ | Email de contato |
| **DataCadastro** | DATETIME | ❌ | ❌ | Data/hora de criação do registro |

**Restrições:**
- CNPJ deve ser único (não pode haver duplicatas)
- Todos os campos são obrigatórios

**Finalidade:**
Registrar empresas que compram produtos no sistema. Cada cliente pode ter múltiplos pedidos.

**Exemplo:**
```sql
INSERT INTO Cliente (CNPJ, Nome, Email, DataCadastro)
VALUES ('12345678901234', 'Empresa XYZ LTDA', 'contato@xyz.com', GETDATE())
-- CodCliente = 1 (auto-gerado)
```

---

### 2. **PRODUTOS**

Armazena o catálogo de produtos disponíveis.

| Campo | Tipo | PK/FK | NULL | Descrição |
|-------|------|-------|------|-----------|
| **CodProduto** | INT | PK | ❌ | Identificador único do produto (IDENTITY) |
| **Nome** | VARCHAR(MAX) | ❌ | ❌ | Nome do produto (ex: "Monitor 24 polegadas") |
| **Preco** | DECIMAL(10,2) | ❌ | ❌ | Preço unitário em BRL |
| **Estoque** | INT | ❌ | ❌ | Quantidade disponível em estoque |

**Restrições:**
- Preço deve ser positivo (>= 0)
- Estoque pode ser 0 (produto esgotado)

**Finalidade:**
Catálogo de produtos que podem ser vendidos. O estoque é decrementado quando um item é adicionado a um pedido.

**Exemplo:**
```sql
INSERT INTO Produtos (Nome, Preco, Estoque)
VALUES ('Monitor Dell 24"', 1200.00, 15)
-- CodProduto = 1 (auto-gerado)
```

---

### 3. **PEDIDO**

Agrupa itens comprados por um cliente em uma transação.

| Campo | Tipo | PK/FK | NULL | Descrição |
|-------|------|-------|------|-----------|
| **CodPedido** | INT | PK | ❌ | Identificador único do pedido (IDENTITY) |
| **CodCliente** | INT | FK | ❌ | Referência para o cliente que fez o pedido |
| **DataPedido** | DATETIME | ❌ | ❌ | Data/hora de criação do pedido |
| **ValorTotal** | DECIMAL(10,2) | ❌ | ❌ | Soma de (Quantidade × PrecoUnitario) de todos os itens |

**Restrições:**
- CodCliente deve existir na tabela CLIENTE (FK)
- ValorTotal é calculado automaticamente pela soma dos itens
- Não pode haver pedidos sem cliente

**Relacionamentos:**
- `CodCliente` → CLIENTE.CodCliente (1:N)
  - Um cliente pode ter vários pedidos
  - Um pedido pertence a um cliente

**Finalidade:**
Registra cada compra (pedido) feita por um cliente. Serve como cabeçalho para os itens do pedido.

**Exemplo:**
```sql
INSERT INTO Pedido (CodCliente, DataPedido, ValorTotal)
VALUES (1, GETDATE(), 0.00)
-- CodPedido = 100 (auto-gerado)
-- ValorTotal começa em 0 e será atualizado ao adicionar itens
```

---

### 4. **ITENSPEDIDOS**

Junction table que relaciona PEDIDO com PRODUTOS (relacionamento N:N).

| Campo | Tipo | PK/FK | NULL | Descrição |
|-------|------|-------|------|-----------|
| **CodPedido** | INT | PK+FK | ❌ | Referência para o pedido (parte 1 da chave primária composta) |
| **CodProduto** | INT | PK+FK | ❌ | Referência para o produto (parte 2 da chave primária composta) |
| **Quantidade** | INT | ❌ | ❌ | Quantidade comprada desse produto |
| **PrecoUnitario** | DECIMAL(10,2) | ❌ | ❌ | Preço unitário do produto NO MOMENTO DA COMPRA |
| **NomeProduto** | VARCHAR(MAX) | ❌ | ✅ | Nome do produto (apenas para leitura, vem do JOIN) |

**Restrições:**
- CodPedido deve existir em PEDIDO
- CodProduto deve existir em PRODUTOS
- Quantidade deve ser > 0
- PrecoUnitario deve ser > 0
- Não pode haver duplicata de (CodPedido, CodProduto)

**Chave Primária Composta:**
```
PRIMARY KEY (CodPedido, CodProduto)
```
Isso significa que um mesmo produto não pode aparecer 2 vezes no mesmo pedido.

**Relacionamentos:**
- `CodPedido` → PEDIDO.CodPedido (N:1)
- `CodProduto` → PRODUTOS.CodProduto (N:1)

**Por que PrecoUnitario?**
- Armazena o preço que estava vigente NO MOMENTO da compra
- Se o preço do produto mudasse depois, o pedido anterior mantém seu preço original
- Garante histórico correto dos pedidos

**Finalidade:**
Detalhar cada item (linha) de um pedido. Um pedido pode ter múltiplos itens.

**Exemplo:**
```sql
-- Pedido 100 tem 2 itens
INSERT INTO ItensPedidos (CodPedido, CodProduto, Quantidade, PrecoUnitario)
VALUES (100, 1, 2, 1200.00)  -- 2x Monitor = R$ 2.400,00

INSERT INTO ItensPedidos (CodPedido, CodProduto, Quantidade, PrecoUnitario)
VALUES (100, 2, 5, 450.00)   -- 5x Teclado = R$ 2.250,00

-- ValorTotal do Pedido = 2.400 + 2.250 = 4.650,00
```

---

## Relacionamentos

### CLIENTE → PEDIDO (1:N)
```
Um cliente pode ter vários pedidos
Vários pedidos pertencem a um cliente

CLIENTE (CodCliente) ──1───→ ───N─→ PEDIDO (CodPedido)
                        └─ CodCliente (FK)
```

**Operações:**
```sql
-- Todos os pedidos de um cliente
SELECT * FROM Pedido WHERE CodCliente = 1

-- Cliente e seus pedidos
SELECT c.Nome, p.CodPedido, p.ValorTotal
FROM Cliente c
JOIN Pedido p ON c.CodCliente = p.CodCliente
WHERE c.CodCliente = 1
```

---

### PEDIDO ↔ PRODUTOS (N:N via ITENSPEDIDOS)
```
Um pedido pode ter vários produtos
Um produto pode estar em vários pedidos

PEDIDO ──N─→ ITENSPEDIDOS ←─N─→ PRODUTOS
       ↓          ↓           ↓        ↓
   CodPedido   FK+PK        FK+PK   CodProduto
```

**Operações:**
```sql
-- Todos os itens de um pedido
SELECT ip.CodProduto, pr.Nome, ip.Quantidade, ip.PrecoUnitario,
       (ip.Quantidade * ip.PrecoUnitario) AS Total
FROM ItensPedidos ip
JOIN Produtos pr ON ip.CodProduto = pr.CodProduto
WHERE ip.CodPedido = 100

-- Todos os pedidos que contêm um produto
SELECT DISTINCT p.CodPedido, c.Nome
FROM Pedido p
JOIN ItensPedidos ip ON p.CodPedido = ip.CodPedido
JOIN Cliente c ON p.CodCliente = c.CodCliente
WHERE ip.CodProduto = 1
```

---

### PRODUTOS (Estoque em cascata)
```
Quando um item é adicionado a um pedido:
1. Insere linha em ITENSPEDIDOS
2. Decrementa estoque em PRODUTOS
3. Recalcula ValorTotal em PEDIDO

Tudo em uma TRANSAÇÃO (tudo ou nada)
```

**Exemplo de operação atômica:**
```sql
BEGIN TRANSACTION

-- 1. Adiciona item ao pedido
INSERT INTO ItensPedidos (CodPedido, CodProduto, Quantidade, PrecoUnitario)
VALUES (100, 1, 2, 1200.00)

-- 2. Decrementa estoque
UPDATE Produtos
SET Estoque = Estoque - 2
WHERE CodProduto = 1

-- 3. Recalcula total
UPDATE Pedido
SET ValorTotal = (
    SELECT SUM(Quantidade * PrecoUnitario)
    FROM ItensPedidos
    WHERE CodPedido = 100
)

-- Se algum falhar, ROLLBACK de tudo
COMMIT
```

---

## Scripts SQL

### Criar Tabelas

```sql
-- Tabela de Clientes
CREATE TABLE Cliente (
    CodCliente INT PRIMARY KEY IDENTITY(1,1),
    CNPJ VARCHAR(14) NOT NULL UNIQUE,
    Nome VARCHAR(MAX) NOT NULL,
    Email VARCHAR(MAX) NOT NULL,
    DataCadastro DATETIME NOT NULL
)

-- Tabela de Produtos
CREATE TABLE Produtos (
    CodProduto INT PRIMARY KEY IDENTITY(1,1),
    Nome VARCHAR(MAX) NOT NULL,
    Preco DECIMAL(10,2) NOT NULL,
    Estoque INT NOT NULL DEFAULT 0
)

-- Tabela de Pedidos
CREATE TABLE Pedido (
    CodPedido INT PRIMARY KEY IDENTITY(1,1),
    CodCliente INT NOT NULL,
    DataPedido DATETIME NOT NULL,
    ValorTotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (CodCliente) REFERENCES Cliente(CodCliente)
)

-- Tabela de Itens de Pedidos
CREATE TABLE ItensPedidos (
    CodPedido INT NOT NULL,
    CodProduto INT NOT NULL,
    Quantidade INT NOT NULL,
    PrecoUnitario DECIMAL(10,2) NOT NULL,
    NomeProduto VARCHAR(MAX) NULL,
    PRIMARY KEY (CodPedido, CodProduto),
    FOREIGN KEY (CodPedido) REFERENCES Pedido(CodPedido),
    FOREIGN KEY (CodProduto) REFERENCES Produtos(CodProduto)
)
```

### Criar Índices

```sql
-- Para melhorar buscas por cliente
CREATE INDEX IX_Pedido_CodCliente ON Pedido(CodCliente)

-- Para melhorar buscas por produto
CREATE INDEX IX_ItensPedidos_CodProduto ON ItensPedidos(CodProduto)

-- Para melhorar buscas por data
CREATE INDEX IX_Pedido_DataPedido ON Pedido(DataPedido)
```

### Popular com Dados de Teste

```sql
-- Inserir clientes
INSERT INTO Cliente (CNPJ, Nome, Email, DataCadastro) VALUES
('12345678901234', 'Empresa A LTDA', 'contato@a.com', GETDATE()),
('98765432101234', 'Empresa B LTDA', 'contato@b.com', GETDATE()),
('55555555555555', 'Empresa C LTDA', 'contato@c.com', GETDATE())

-- Inserir produtos
INSERT INTO Produtos (Nome, Preco, Estoque) VALUES
('Monitor Dell 24"', 1200.00, 10),
('Teclado Mecânico', 450.00, 25),
('Mouse Gamer', 150.00, 30),
('Headset Wireless', 350.00, 15)

-- Inserir pedido
INSERT INTO Pedido (CodCliente, DataPedido, ValorTotal) VALUES
(1, GETDATE(), 0.00)

-- Inserir itens do pedido
INSERT INTO ItensPedidos (CodPedido, CodProduto, Quantidade, PrecoUnitario) VALUES
(1, 1, 2, 1200.00),
(1, 2, 1, 450.00)
```

---

## Integridade Referencial

### Restrições de Chave Estrangeira

**PEDIDO.CodCliente → CLIENTE.CodCliente**
- Um pedido SEMPRE deve referenciar um cliente existente
- Não pode deletar um cliente que tem pedidos
- Garantia: `FOREIGN KEY (CodCliente) REFERENCES Cliente(CodCliente)`

**ITENSPEDIDOS.CodPedido → PEDIDO.CodPedido**
- Um item SEMPRE deve referenciar um pedido existente
- Não pode ter item órfão

**ITENSPEDIDOS.CodProduto → PRODUTOS.CodProduto**
- Um item SEMPRE deve referenciar um produto existente
- Produto não pode ser deletado se tem itens em pedidos

### Ações de Deleção

Atualmente configurado como: **RESTRICT** (padrão do SQL Server)

```
Tentativa de deletar Cliente com pedidos → ERRO ❌
Tentativa de deletar Produto em uso → ERRO ❌
```

**Para permitir deletar em cascata:**
```sql
ALTER TABLE Pedido
DROP CONSTRAINT FK_Pedido_Cliente

ALTER TABLE Pedido
ADD CONSTRAINT FK_Pedido_Cliente 
FOREIGN KEY (CodCliente) REFERENCES Cliente(CodCliente)
ON DELETE CASCADE  -- Deleta pedidos quando cliente é deletado
ON UPDATE CASCADE
```

---

## Exemplos de Consultas Úteis

### 1. Pedido Completo com Detalhes
```sql
SELECT 
    p.CodPedido,
    c.Nome AS NomeCliente,
    c.CNPJ,
    p.DataPedido,
    ip.CodProduto,
    pr.Nome AS NomeProduto,
    ip.Quantidade,
    ip.PrecoUnitario,
    (ip.Quantidade * ip.PrecoUnitario) AS Subtotal,
    p.ValorTotal
FROM Pedido p
JOIN Cliente c ON p.CodCliente = c.CodCliente
JOIN ItensPedidos ip ON p.CodPedido = ip.CodPedido
JOIN Produtos pr ON ip.CodProduto = pr.CodProduto
WHERE p.CodPedido = 100
ORDER BY ip.CodProduto
```

### 2. Histórico de Vendas por Cliente
```sql
SELECT 
    c.Nome,
    COUNT(p.CodPedido) AS TotalPedidos,
    SUM(p.ValorTotal) AS ValorTotal,
    AVG(p.ValorTotal) AS MediaValor
FROM Cliente c
LEFT JOIN Pedido p ON c.CodCliente = p.CodCliente
GROUP BY c.CodCliente, c.Nome
ORDER BY SUM(p.ValorTotal) DESC
```

### 3. Produtos Mais Vendidos
```sql
SELECT 
    pr.CodProduto,
    pr.Nome,
    SUM(ip.Quantidade) AS TotalVendido,
    SUM(ip.Quantidade * ip.PrecoUnitario) AS FaturamentoTotal,
    pr.Estoque AS EstoqueAtual
FROM ItensPedidos ip
JOIN Produtos pr ON ip.CodProduto = pr.CodProduto
GROUP BY pr.CodProduto, pr.Nome, pr.Estoque
ORDER BY SUM(ip.Quantidade) DESC
```

### 4. Estoque Baixo
```sql
SELECT 
    CodProduto,
    Nome,
    Estoque,
    Preco,
    (Estoque * Preco) AS ValorEmEstoque
FROM Produtos
WHERE Estoque < 5  -- Produtos com menos de 5 unidades
ORDER BY Estoque ASC
```

### 5. Pedidos Recentes
```sql
SELECT TOP 10
    p.CodPedido,
    c.Nome,
    p.DataPedido,
    p.ValorTotal,
    COUNT(ip.CodProduto) AS TotalItens
FROM Pedido p
JOIN Cliente c ON p.CodCliente = c.CodCliente
LEFT JOIN ItensPedidos ip ON p.CodPedido = ip.CodPedido
GROUP BY p.CodPedido, c.Nome, p.DataPedido, p.ValorTotal
ORDER BY p.DataPedido DESC
```

---

## Performance e Otimização

### Índices Recomendados
```sql
-- Já devem ser criados na inicialização
CREATE INDEX IX_Pedido_CodCliente ON Pedido(CodCliente)
CREATE INDEX IX_ItensPedidos_CodProduto ON ItensPedidos(CodProduto)
CREATE INDEX IX_Pedido_DataPedido ON Pedido(DataPedido)
```

### Considerações
- **CNPJ:** Deve ser UNIQUE para evitar duplicatas
- **Estoque:** Deve ser atualizado em TRANSAÇÃO junto com ItensPedidos
- **ValorTotal:** Calculado automaticamente, não armazenar manualmente
- **PrecoUnitario em ItensPedidos:** Crítico para manter histórico correto

---

## Extensões Futuras

### Sugestões para Melhorias
1. **Tabela de Usuários/Vendedores** - Rastrear quem criou cada pedido
2. **Status de Pedido** - (Pendente, Processando, Enviado, Entregue, Cancelado)
3. **Auditoria** - Registrar mudanças com quem e quando
4. **Devolução** - Tabela para pedidos devolvidos/cancelados
5. **Pagamento** - Rastrear status e método de pagamento
6. **Faturamento** - Gerar NF-e automaticamente
7. **Cupom de Desconto** - Aplicar desconto a pedidos

---

## Diagrama de Fluxo de Dados

```
┌─ Usuário cria novo pedido ─────────┐
│                                    │
│  1. Seleciona Cliente ──→ CLIENTE  │
│                                    │
│  2. Seleciona Produtos ──→ PRODUTOS│
│                                    │
│  3. Insere quantidades             │
│                                    │
│  4. Confirma pedido                │
│       ↓                            │
│  CREATE Pedido ──→ PEDIDO          │
│       ↓                            │
│  FOR EACH item:                    │
│       ├─ INSERT ItensPedidos       │
│       ├─ UPDATE Produtos (estoque) │
│       └─ UPDATE Pedido (total)     │
│                                    │
│  TRANSAÇÃO COMPLETA (tudo ou nada) │
└────────────────────────────────────┘
```

---

**Última atualização:** 2025-07-10  
**Versão:** 1.0
