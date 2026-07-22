// ============================================================
// IMPORTAÇÕES
// ============================================================
// Microsoft.AspNetCore.Mvc = classe base e atributos para controllers
using Microsoft.AspNetCore.Mvc;

// Microsoft.Extensions.Logging = sistema de logs
// Registra eventos (login, erros, etc)
using Microsoft.Extensions.Logging;

// DTOs = classes de requisição/resposta
using PcInventory.DTOs;

// Services = lógica de negócio
using PcInventory.Services;

// ============================================================
// NAMESPACE - Organização do código
// ============================================================
// Agrupa este controller com outros em PcInventory.Controllers
namespace PcInventory.Controllers
{
    // ============================================================
    // CLASSE AuthController - Endpoints de autenticação
    // ============================================================
    // Responsável por:
    // - Login: autenticar usuário (usuario + senha)
    // - Refresh Token: renovar JWT expirado
    //
    // Endpoints:
    // - POST /api/auth/login
    // - POST /api/auth/refresh

    // [ApiController] = atributo que ativa resources de API
    // Ex: validação automática, error handling padrão
    [ApiController]

    // [Route("api/[controller]")] = prefixo da rota
    // [controller] = substitui pelo nome do controller sem "Controller"
    // Resultado: /api/auth
    [Route("api/[controller]")]

    // : ControllerBase = herança de classe base
    // ControllerBase = classe .NET para controllers de API (sem View support)
    public class AuthController : ControllerBase
    {
        // ============================================================
        // DEPENDÊNCIAS INJETADAS
        // ============================================================

        // private readonly AuthService _authService;
        // readonly = não pode ser reassignado depois de definido
        // Injected via constructor (Dependency Injection)
        // Contém lógica de autenticação
        private readonly AuthService _authService;

        // private readonly ILogger<AuthController> _logger;
        // ILogger = interface para fazer logs
        // <AuthController> = tipo genérico indicando qual classe usa este logger
        // Exemplo: _logger.LogInformation("Login bem-sucedido")
        private readonly ILogger<AuthController> _logger;

        // ============================================================
        // CONSTRUTOR - Dependency Injection
        // ============================================================
        // Parametros são injetados automaticamente pelo .NET
        // No Program.cs: builder.Services.AddScoped<AuthService>()
        // No Program.cs: builder.Services.AddLogging()
        public AuthController(AuthService authService, ILogger<AuthController> logger)
        {
            // Atribuir dependências às variáveis privadas
            _authService = authService;
            _logger = logger;
        }

        // ============================================================
        // ENDPOINT 1 - Login
        // ============================================================
        // [HttpPost("login")] = POST /api/auth/login
        // Autenticar usuário com usuario e senha
        [HttpPost("login")]

        // public async Task<IActionResult> Login(...)
        // async = função assíncrona (pode usar await)
        // Task<IActionResult> = promessa de retornar resultado HTTP
        // IActionResult = interface para respostas HTTP (Ok, Unauthorized, etc)
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // ========== VALIDAÇÃO 1: CAMPOS VAZIOS ==========
            // [FromBody] = dados vêm do corpo da requisição (JSON)
            // Exemplo de request:
            // {
            //   "usuario": "mateus",
            //   "senha": "123456"
            // }

            // if (string.IsNullOrWhiteSpace(...))
            // Verifica se usuario OU senha estão vazios/null
            if (string.IsNullOrWhiteSpace(request.Usuario) || string.IsNullOrWhiteSpace(request.Senha))
                // BadRequest = HTTP 400
                // Envia mensagem de erro ao cliente
                return BadRequest(new { message = "Usuario e senha são obrigatórios" });

            // ========== AUTENTICAR ==========
            // Chama AuthService para:
            // 1. Buscar usuário no banco
            // 2. Verificar senha
            // 3. Gerar JWT token
            var response = await _authService.AuthenticateAsync(request.Usuario, request.Senha);

            // ========== VALIDAÇÃO 2: AUTENTICAÇÃO FALHOU ==========
            // response == null significa autenticação falhou
            // Usuário não existe OU senha incorreta
            if (response == null)
            {
                // Log de segurança: registra tentativas de login falhadas
                // Útil para detectar ataques (força bruta, etc)
                _logger.LogWarning($"Tentativa de login falhada para usuario: {request.Usuario}");

                // Unauthorized = HTTP 401
                // Mensagem genérica (não diferencia usuário inválido de senha)
                // Por segurança, não dizer qual campo está errado
                return Unauthorized(new { message = "Usuario ou senha inválidos" });
            }

            // ========== SUCESSO ==========
            // Log de sucesso
            _logger.LogInformation($"Login bem-sucedido para usuario: {request.Usuario}");

            // Ok = HTTP 200
            // response contém:
            // {
            //   "accessToken": "eyJhbGc...",
            //   "refreshToken": "eyJhbGc...",
            //   "expiresIn": 900
            // }
            return Ok(response);
        }

        // ============================================================
        // ENDPOINT 2 - Refresh Token
        // ============================================================
        // [HttpPost("refresh")] = POST /api/auth/refresh
        // Renovar JWT expirado usando refresh token
        //
        // Fluxo de refresh:
        // 1. accessToken expirou (15 minutos)
        // 2. Cliente envia username + refreshToken
        // 3. Servidor verifica refreshToken (7 dias)
        // 4. Se válido, gera novo accessToken
        // 5. Responde com novo accessToken
        [HttpPost("refresh")]

        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            // ========== VALIDAÇÃO: USUARIO OBRIGATÓRIO ==========
            // request contém { usuario, refreshToken }
            if (string.IsNullOrWhiteSpace(request.Usuario))
                return BadRequest(new { message = "Usuario é obrigatório" });

            // ========== RENOVAR TOKEN ==========
            // AuthService tenta gerar novo accessToken
            // Valida refreshToken antes de gerar novo
            var newAccessToken = await _authService.RefreshAccessTokenAsync(request.Usuario);

            // ========== VALIDAÇÃO: REFRESH FALHOU ==========
            // Falha se:
            // - RefreshToken expirou (> 7 dias)
            // - RefreshToken inválido
            // - Usuário não existe
            if (newAccessToken == null)
                return Unauthorized(new { message = "Falha ao renovar token" });

            // ========== SUCESSO ==========
            // Retorna novo accessToken
            return Ok(new { accessToken = newAccessToken });
        }
    }
}
