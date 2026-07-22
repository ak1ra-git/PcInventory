// ============================================================
// CLASSE MODELO - USER (USUÁRIO)
// ============================================================
// Representa um USUÁRIO DO SISTEMA (funcionário/interno)
// Não confundir com Cliente (que é a empresa)
//
// Diferença importante:
// - User = Pessoa que FAZ LOGIN no sistema (vendedor, gerente, admin)
// - Cliente = Empresa que FAZ PEDIDOS (comprador)
//
// Exemplo:
// User (interno): "Mateus" que trabalha na empresa, faz login com mateus/senha123
// Cliente (externo): "Empresa Tech LTDA" que faz pedidos para a empresa
//
// Um User pode gerenciar vários Clientes
// Um Cliente faz pedidos para múltiplos Users (atendimento)
public class User
{
    // ============================================================
    // PROPRIEDADE 1: Id - ID ÚNICO DO USUÁRIO
    // ============================================================
    // int = número inteiro auto-incrementado
    // Chave primária (PRIMARY KEY) na tabela Users
    // Cada usuário tem um ID único e imutável
    //
    // Exemplo:
    // User ID 1 = Mateus
    // User ID 2 = Akira
    // User ID 3 = Carlos
    public int Id { get; set; }

    // ============================================================
    // PROPRIEDADE 2: Usuario - LOGIN/USERNAME
    // ============================================================
    // string = nome de usuário para fazer login
    // Exemplo: "MateusNascimento", "AkiraOliveira"
    //
    // required = OBRIGATÓRIO (não pode ser null ou vazio)
    // Se tentar criar User sem Usuario, dá erro na compilação
    //
    // Seu equivalente em C# antigo seria:
    // public string Usuario { get; set; } // Com null-check manual em todo lugar
    //
    // Com required:
    // var user = new User(); // ERRO! Usuario é required
    // var user = new User { Usuario = "mateus", ... }; // OK
    //
    // Características:
    // - Deveria ser ÚNICO no banco (cada login só uma pessoa)
    // - Case-sensitive? Neste projeto é (mateus ≠ MATEUS)
    // - Pode ter números e underscores
    //
    // Exemplo:
    // usuario = "MateusNascimento" → login = MateusNascimento
    // usuario = "akira.oliveira" → login = akira.oliveira
    public required string Usuario { get; set; }

    // ============================================================
    // PROPRIEDADE 3: PasswordHash - SENHA CRIPTOGRAFADA
    // ============================================================
    // string = hash da senha (NUNCA a senha em texto plano!)
    //
    // IMPORTANTE: NUNCA ARMAZENE SENHA EM TEXTO PLANO!
    // ❌ ERRADO: PasswordHash = "mateus123"
    // ✅ CORRETO: PasswordHash = "L3K7Q...pM2K7..." (PBKDF2-SHA256)
    //
    // Processo:
    // 1. Usuário digita: "mateus123"
    // 2. Sistema criptografa com PBKDF2-SHA256 + salt aleatório
    // 3. Armazena: "L3K7Q...pM2K7..."
    // 4. Nunca armazena a senha original
    //
    // Por quê?
    // - Se banco vazar, não expõe as senhas
    // - Hash é irreversível (não consegue voltar para "mateus123")
    // - Cada usuário tem um salt diferente
    //
    // required = obrigatório (todo usuário precisa ter senha)
    //
    // Exemplo:
    // passwordHash = "L3K7Q9wkpZ1hR4mVx8nY9bCdEfGhIjKl..." (PBKDF2 com salt)
    public required string PasswordHash { get; set; }

    // ============================================================
    // PROPRIEDADE 4: Name - NOME COMPLETO DO USUÁRIO
    // ============================================================
    // string = nome completo da pessoa
    // Diferente de Usuario (login)
    //
    // Exemplo:
    // Usuario = "MateusNascimento"
    // Name = "Mateus Oliveira Nascimento"
    //
    // Usado para:
    // - Exibir no dashboard: "Bem-vindo, Mateus!"
    // - Relatórios (quem fez a venda)
    // - Assinatura (emails, documentos)
    //
    // required = obrigatório
    //
    // Exemplo:
    // name = "Mateus Oliveira Nascimento"
    // name = "Akira Oliveira da Silva"
    public required string Name { get; set; }

    // ============================================================
    // PROPRIEDADE 5: CreatedAt - DATA DE CRIAÇÃO
    // ============================================================
    // DateTime = data E hora do cadastro
    // Registra QUANDO o usuário foi criado
    // Nunca muda (é histórico)
    //
    // Preenchido automaticamente:
    // var user = new User
    // {
    //   CreatedAt = DateTime.UtcNow  // Agora em UTC
    // };
    //
    // Formato armazenado: "2026-07-22 14:30:45.123456"
    //
    // Uso comum:
    // - Auditoria (quando o usuário foi criado)
    // - Verificar se é usuário novo (< 7 dias)
    // - Relatório de crescimento de usuários
    //
    // Exemplo:
    // if (user.CreatedAt > DateTime.UtcNow.AddDays(-30)) {
    //   // Usuário foi criado nos últimos 30 dias (novo)
    // }
    public DateTime CreatedAt { get; set; }
}