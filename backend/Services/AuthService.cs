// ============================================================
// SERVIÇO DE AUTENTICAÇÃO - LOGIN COM JWT
// ============================================================
// Este arquivo gerencia TODO O PROCESSO DE LOGIN
// Desde verificar usuário/senha até criar tokens de segurança

using System.IdentityModel.Tokens.Jwt; // Trabalhar com JWT
using System.Security.Claims; // Informações sobre o usuário (claims)
using System.Security.Cryptography; // Criptografia de senhas
using System.Text; // Trabalhar com textos UTF-8
using Microsoft.IdentityModel.Tokens; // Validação de tokens
using PcInventory.DTOs; // AuthResponse, LoginRequest
using PcInventory.Models; // User model
using PcInventory.Repositories; // Acesso ao banco de dados

namespace PcInventory.Services;

/// <summary>
/// SERVIÇO DE AUTENTICAÇÃO
/// Responsável por:
/// - Fazer login (verificar usuário/senha)
/// - Gerar tokens JWT
/// - Validar tokens
/// - Criptografar e verificar senhas
/// </summary>
public class AuthService
{
    // ============================================================
    // CAMPOS PRIVADOS - Configurações de segurança
    // ============================================================

    // Chave secreta para assinar o token (tipo uma "assinatura")
    // Se alguém souber essa chave, consegue falsificar tokens!
    private readonly string _jwtSecretKey;

    // Quem emitiu o token (exemplo: "PcInventory")
    private readonly string _jwtIssuer;

    // Para quem é o token (exemplo: "PcInventoryClient")
    private readonly string _jwtAudience;

    // Repositório para buscar usuários no banco de dados
    private readonly UserRepository _userRepository;

    // Token expira em 15 minutos (segurança: não deixa token ativo forever)
    private const int AccessTokenExpirationMinutes = 15;

    // Refresh token expira em 7 dias (deixa renovar o access token)
    private const int RefreshTokenExpirationDays = 7;

    // ============================================================
    // CONSTRUTOR - Inicializa o serviço
    // ============================================================
    // IConfiguration = objeto que lê do appsettings.json
    // UserRepository = objeto para buscar usuários no banco
    public AuthService(IConfiguration configuration, UserRepository userRepository)
    {
        // Pega a chave secreta do appsettings.json
        // ?? "valor padrão" = se for nulo, usa valor padrão
        // throw new... = se não tiver, lança erro
        _jwtSecretKey = configuration["Jwt:SecretKey"]
            ?? throw new ArgumentNullException(nameof(configuration), "Jwt:SecretKey not configured");

        // Pega o issuer (padrão: "PcInventory")
        _jwtIssuer = configuration["Jwt:Issuer"] ?? "PcInventory";

        // Pega a audience (padrão: "PcInventoryClient")
        _jwtAudience = configuration["Jwt:Audience"] ?? "PcInventoryClient";

        // Guarda referência do repositório para usar depois
        _userRepository = userRepository;
    }

    // ============================================================
    // MÉTODO: AUTENTICAR (FAZER LOGIN)
    // ============================================================
    /// <summary>
    /// Autentica um usuário e retorna tokens JWT se sucesso
    ///
    /// Fluxo:
    /// 1. Busca usuário no banco
    /// 2. Valida senha
    /// 3. Gera tokens de segurança
    /// 4. Retorna tokens
    ///
    /// Retorna null se falhar
    /// </summary>
    public async Task<AuthResponse?> AuthenticateAsync(string usuario, string password)
    {
        // async = método assíncrono (não trava o servidor enquanto busca no banco)
        // Task = "tarefa" que vai retornar algo quando terminar
        // ? = pode retornar null (nothing)

        // 1. BUSCAR USUÁRIO NO BANCO
        var user = await _userRepository.GetByUsuarioAsync(usuario);
        // ^ Espera o banco retornar (await)
        // ^ user é null se não encontrou

        // 2. VERIFICAR SE USUÁRIO EXISTE
        if (user == null)
            return null; // Usuário não existe → erro login

        // 3. VERIFICAR SE SENHA ESTÁ CORRETA
        if (!VerifyPassword(password, user.PasswordHash))
            return null; // Senha errada → erro login

        // 4. GERAR TOKENS (se chegou aqui, tudo certo!)
        var accessToken = GenerateAccessToken(user);
        // ^ Token para usar a API (15 minutos)

        var refreshToken = GenerateRefreshToken();
        // ^ Token para renovar o access token (7 dias)

        // 5. RETORNAR RESPOSTA COM TOKENS
        return new AuthResponse
        {
            // Token de acesso = usa para fazer requisições à API
            AccessToken = accessToken,

            // Token para renovar = quando access expirar, pode renovar
            RefreshToken = refreshToken,

            // Tempo de expiração em SEGUNDOS (15 min * 60 sec)
            ExpiresIn = AccessTokenExpirationMinutes * 60,

            // Tipo do token (sempre "Bearer" para JWT)
            TokenType = "Bearer"
        };
    }

    // ============================================================
    // MÉTODO: RENOVAR ACCESS TOKEN
    // ============================================================
    /// <summary>
    /// Gera um novo access token usando o nome de usuário
    /// Usado quando o token anterior expirou
    /// </summary>
    public async Task<string?> RefreshAccessTokenAsync(string usuario)
    {
        // Busca usuário no banco
        var user = await _userRepository.GetByUsuarioAsync(usuario);

        // Operador ternário: if (user != null) ? gera token : retorna null
        return user != null ? GenerateAccessToken(user) : null;
    }

    // ============================================================
    // MÉTODO: VALIDAR TOKEN
    // ============================================================
    /// <summary>
    /// Valida um token JWT e extrai informações do usuário
    ///
    /// Verifica:
    /// - Assinatura (não foi alterado)
    /// - Emissor (veio de um lugar confiável)
    /// - Audiência (é para essa aplicação)
    /// - Expiração (não expirou)
    /// </summary>
    public ClaimsPrincipal? ValidateToken(string token)
    {
        // ClaimsPrincipal = informações sobre o usuário extraídas do token
        // ? = pode retornar null se token inválido

        try
        {
            // Cria um manipulador de tokens JWT
            var tokenHandler = new JwtSecurityTokenHandler();

            // Converte chave secreta para bytes (formato que algoritmo entende)
            var key = Encoding.ASCII.GetBytes(_jwtSecretKey);

            // VALIDA O TOKEN
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                // Verifica se a assinatura é válida (usando a chave secreta)
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),

                // Verifica se o emissor é o esperado
                ValidateIssuer = true,
                ValidIssuer = _jwtIssuer,

                // Verifica se a audiência é esperada
                ValidateAudience = true,
                ValidAudience = _jwtAudience,

                // Verifica se não expirou
                ValidateLifetime = true,

                // ClockSkew = tolerância de tempo (para não expirar no meio da requisição)
                // TimeSpan.Zero = sem tolerância (expira EXATAMENTE no tempo)
                ClockSkew = TimeSpan.Zero

            }, out SecurityToken validatedToken); // out = retorna o token validado

            // Se chegou aqui, token é válido
            return principal;
        }
        catch
        {
            // Se der erro em qualquer validação, token é inválido
            return null;
        }
    }

    // ============================================================
    // MÉTODO PRIVADO: GERAR ACCESS TOKEN
    // ============================================================
    /// <summary>
    /// Cria um token JWT válido por 15 minutos
    ///
    /// O token contém:
    /// - ID do usuário
    /// - Email/usuário
    /// - Nome completo
    /// - Tempo de expiração
    /// - Assinatura criptográfica
    /// </summary>
    private string GenerateAccessToken(User user)
    {
        // Cria um manipulador de tokens
        var tokenHandler = new JwtSecurityTokenHandler();

        // Converte chave secreta para bytes (formato que JWT entende)
        var key = Encoding.ASCII.GetBytes(_jwtSecretKey);

        // ========== DEFINE CONTEÚDO DO TOKEN ==========
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            // Subject = informações sobre quem é (claims)
            Subject = new ClaimsIdentity(new[]
            {
                // Cada Claim é um dado (tipo CPF, nome, email)
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // ID do usuário
                new Claim(ClaimTypes.Email, user.Usuario), // Login/email
                new Claim(ClaimTypes.Name, user.Name) // Nome completo
            }),

            // Quanto tempo o token é válido (15 minutos a partir de agora)
            Expires = DateTime.UtcNow.AddMinutes(AccessTokenExpirationMinutes),
            // ^ DateTime.UtcNow = horário atual em UTC (padrão internacional)
            // ^ AddMinutes = adiciona 15 minutos

            // Quem emitiu (tipo "PcInventory")
            Issuer = _jwtIssuer,

            // Para quem é (tipo "PcInventoryClient")
            Audience = _jwtAudience,

            // Assinatura criptográfica (prova que veio realmente de nós)
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature) // Algoritmo de criptografia
            // ^ HMAC-SHA256 = muito seguro, padrão de indústria
        };

        // Cria o token baseado no descritor
        var token = tokenHandler.CreateToken(tokenDescriptor);

        // Converte token para string JSON compactada
        // Resultado: "eyJhbGc...eyJzdWI...SflKxw..."
        return tokenHandler.WriteToken(token);
    }

    // ============================================================
    // MÉTODO PRIVADO: GERAR REFRESH TOKEN
    // ============================================================
    /// <summary>
    /// Cria um número aleatório e converte para texto
    /// Usado para renovar o access token quando expira
    /// </summary>
    private static string GenerateRefreshToken()
    {
        // static = não precisa instância (classe.Metodo())

        // Cria array de 64 bytes (aleatórios)
        var randomNumber = new byte[64];

        // RandomNumberGenerator = gerador de números ALEATÓRIOS criptograficamente seguro
        using (var rng = RandomNumberGenerator.Create())
        {
            // Preenche array com bytes aleatórios
            rng.GetBytes(randomNumber);
            // ^ Dessa forma, cada token é único e impossível de adivinhar
        }

        // Converte bytes para string Base64 (texto legível)
        // Resultado: "xK7pZ9qL..." (string longa)
        return Convert.ToBase64String(randomNumber);
    }

    // ============================================================
    // MÉTODO PRIVADO: CRIPTOGRAFAR SENHA
    // ============================================================
    /// <summary>
    /// Criptografa uma senha usando PBKDF2-SHA256
    ///
    /// Processo:
    /// 1. Gera salt aleatório (16 bytes)
    /// 2. Aplica PBKDF2 10.000 vezes
    /// 3. Combina salt + hash
    /// 4. Retorna em Base64
    ///
    /// POR QUÊ TÃO COMPLICADO?
    /// - Salt: cada senha é diferente (mesma senha → hash diferente)
    /// - 10.000 iterações: demora pra quebrar (força bruta leva horas)
    /// - SHA256: algoritmo criptográfico militar
    /// </summary>
    private static string HashPassword(string password)
    {
        // 1. GERAR SALT ALEATÓRIO
        var salt = new byte[16]; // 16 bytes = 128 bits (muito aleatório)

        using (var rng = RandomNumberGenerator.Create())
        {
            // Preenche array com bytes aleatórios
            rng.GetBytes(salt);
            // ^ Exemplo de salt: [0x42, 0xA7, 0x19, ...]
        }

        // 2. APLICAR PBKDF2-SHA256
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
            password,                       // Senha que o usuário digitou
            salt,                           // Salt gerado acima
            10000,                          // Quantas vezes repetir (segurança)
            HashAlgorithmName.SHA256,       // Algoritmo (padrão NIST)
            20                              // Tamanho do hash em bytes
        );
        // ^ Resultado: hash de 20 bytes (praticamente impossível reverter)

        // 3. COMBINAR SALT + HASH
        byte[] hashWithSalt = new byte[36]; // 16 (salt) + 20 (hash) = 36 bytes

        // Copia salt para os primeiros 16 bytes
        Array.Copy(salt, 0, hashWithSalt, 0, 16);

        // Copia hash para os próximos 20 bytes
        Array.Copy(hash, 0, hashWithSalt, 16, 20);
        // ^ Agora temos: [salt (16 bytes) + hash (20 bytes)]

        // 4. CONVERTER PARA TEXTO (BASE64)
        return Convert.ToBase64String(hashWithSalt);
        // ^ Resultado: "L3K7Q...pM2K7..."
        // ^ Isso é guardado no banco de dados
    }

    // ============================================================
    // MÉTODO PRIVADO: VERIFICAR SENHA
    // ============================================================
    /// <summary>
    /// Valida se a senha digitada corresponde ao hash armazenado
    ///
    /// Fluxo:
    /// 1. Extrai salt do hash armazenado
    /// 2. Recomputa o hash com a senha digitada + salt
    /// 3. Compara bytes a bytes
    /// </summary>
    private static bool VerifyPassword(string password, string hash)
    {
        // 1. CONVERTER HASH DE BASE64 PARA BYTES
        byte[] hashWithSalt = Convert.FromBase64String(hash);
        // ^ Converte "L3K7Q...pM2K7..." em array de bytes

        // 2. EXTRAIR SALT (primeiros 16 bytes)
        byte[] salt = new byte[16];
        Array.Copy(hashWithSalt, 0, salt, 0, 16);
        // ^ Salt é o mesmo que foi usado na criptografia

        // 3. RECOMPUTAR HASH COM A SENHA DIGITADA
        byte[] computedHash = Rfc2898DeriveBytes.Pbkdf2(
            password,                       // Senha que o usuário digitou agora
            salt,                           // Salt extraído acima
            10000,                          // Mesmas 10.000 iterações
            HashAlgorithmName.SHA256,       // Mesmo algoritmo
            20                              // Mesmo tamanho
        );
        // ^ Se a senha está correta, este hash será IDÊNTICO ao original

        // 4. COMPARAR BYTES A BYTES
        for (int i = 0; i < 20; i++) // 20 = tamanho do hash
        {
            // hashWithSalt[i + 16] = hash original (começa no byte 16)
            // computedHash[i] = hash recomputado
            if (hashWithSalt[i + 16] != computedHash[i])
                return false; // Um byte diferente → senha errada
        }

        return true; // Todos os bytes são iguais → senha correta!
    }
}
