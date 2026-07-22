namespace PcInventory.Models;

// ============================================================
// CLASSE MODELO - CLIENTE
// ============================================================
// Representa um CLIENTE cadastrado no sistema
// Geralmente é uma empresa B2B (negócio para negócio)
//
// Um cliente possui:
// - ID (identificador único)
// - CNPJ (documento da empresa)
// - Nome ou razão social
// - Email para contato
// - Data que foi cadastrado
//
// Diferença de Cliente vs User:
// - User = usuário que FAZ LOGIN (funcionário)
// - Cliente = empresa que FAZ PEDIDOS (cliente)
//
// Exemplo real:
// Cliente: "Empresa Tech LTDA" com CNPJ "12.345.678/0001-90"
// Faz pedidos de 100 monitores, 50 teclados, etc
public class Cliente
{
    // ============================================================
    // PROPRIEDADE 1: CodCliente - ID ÚNICO DO CLIENTE
    // ============================================================
    // int = número inteiro auto-incrementado
    // Chave primária (PRIMARY KEY) na tabela Clientes
    // Nunca muda durante a vida útil do cliente
    // Usado para relacionar:
    // - Pedidos (um cliente faz vários pedidos)
    // - Histórico de compras
    //
    // Exemplo:
    // Cliente ID 1 = "Empresa A"
    // Cliente ID 2 = "Empresa B"
    public int CodCliente { get; set; }

    // ============================================================
    // PROPRIEDADE 2: CNPJ - DOCUMENTO DA EMPRESA
    // ============================================================
    // string = texto do CNPJ
    // CNPJ = "Cadastro Nacional da Pessoa Jurídica"
    // Formato: "12.345.678/0001-90"
    // Documento que identifica a empresa no Brasil
    //
    // Por que é string e não int?
    // - Tem pontos, barra, hífen ("12.345.678/0001-90")
    // - Pode começar com zero
    // - CNPJ é um identificador, não um número de verdade
    //
    // Exemplo:
    // cliente.CNPJ = "12.345.678/0001-90";  // Empresa grande
    // cliente.CNPJ = "11.222.333/0001-81";  // Outra empresa
    //
    // Único no banco?
    // Sim, cada empresa tem um CNPJ único
    // Na prática, deveria ter UNIQUE constraint
    public string CNPJ { get; set; } = string.Empty;

    // ============================================================
    // PROPRIEDADE 3: Nome - RAZÃO SOCIAL DA EMPRESA
    // ============================================================
    // string = nome da empresa (razão social)
    // Exemplo: "Empresa Tech LTDA", "Comércio Virtual S.A.", etc
    //
    // Diferença:
    // - Nome = "Empresa Tech LTDA" (razão social, formal)
    // - Nome fantasia = "Tech Store" (nome popular)
    // - Neste projeto, guardamos só o nome formal
    //
    // Exemplo:
    // cliente.Nome = "Empresa Tech LTDA";
    // cliente.Nome = "Comércio de Eletrônicos EIRELI";
    public string Nome { get; set; } = string.Empty;

    // ============================================================
    // PROPRIEDADE 4: Email - CONTATO DO CLIENTE
    // ============================================================
    // string = endereço de email
    // Usado para:
    // - Enviar notificações de pedido
    // - Enviar boleto/nota fiscal
    // - Contato em caso de dúvida
    //
    // Formato: "nome@dominio.com"
    // Exemplo: "contato@empresa.com", "vendas@loja.com.br"
    //
    // Validação:
    // Deve conter @ e . para ser válido
    // Neste projeto, o frontend valida
    //
    // Exemplo:
    // cliente.Email = "contato@empresa.com";
    public string Email { get; set; } = string.Empty;

    // ============================================================
    // PROPRIEDADE 5: DataCadastro - DATA DE CRIAÇÃO
    // ============================================================
    // DateTime = data E hora
    // Registra QUANDO o cliente foi cadastrado
    // Nunca muda (é histórico)
    //
    // Formato armazenado: "2026-07-22 14:30:45.123456"
    // Armazenado em UTC (padrão internacional)
    //
    // Diferença: DateTime vs DateTime?
    // - DateTime = obrigatório (always has value)
    // - DateTime? = opcional (can be null)
    // DataCadastro é obrigatório, sempre tem valor
    //
    // Como preencher:
    // var cliente = new Cliente
    // {
    //   DataCadastro = DateTime.UtcNow  // Agora (em UTC)
    // };
    //
    // Exemplos de DateTime:
    // DateTime.UtcNow = "2026-07-22 14:30:45.123456" (agora em UTC)
    // new DateTime(2026, 7, 22) = "2026-07-22 00:00:00"
    // DateTime.Parse("2026-07-22") = "2026-07-22 00:00:00"
    //
    // Uso comum:
    // if (cliente.DataCadastro < DateTime.UtcNow.AddMonths(-1)) {
    //   // Cliente foi cadastrado há mais de 1 mês
    // }
    public DateTime DataCadastro { get; set; }
}