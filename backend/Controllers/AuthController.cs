using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PcInventory.DTOs;
using PcInventory.Services;

namespace PcInventory.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(AuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Usuario) || string.IsNullOrWhiteSpace(request.Senha))
                return BadRequest(new { message = "Usuario e senha são obrigatórios" });

            var response = await _authService.AuthenticateAsync(request.Usuario, request.Senha);

            if (response == null)
            {
                _logger.LogWarning($"Tentativa de login falhada para usuario: {request.Usuario}");
                return Unauthorized(new { message = "Usuario ou senha inválidos" });
            }

            _logger.LogInformation($"Login bem-sucedido para usuario: {request.Usuario}");
            return Ok(response);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Usuario))
                return BadRequest(new { message = "Usuario é obrigatório" });

            var newAccessToken = await _authService.RefreshAccessTokenAsync(request.Usuario);

            if (newAccessToken == null)
                return Unauthorized(new { message = "Falha ao renovar token" });

            return Ok(new { accessToken = newAccessToken });
        }
    }
}
