using Microsoft.AspNetCore.Mvc;
using PcInventory.DTOs;
using PcInventory.Services;

namespace PcInventory.Controllers;

/// <summary>
/// Controller para autenticação com JWT
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Autentica usuário e retorna access token + refresh token
    /// </summary>
    /// <remarks>
    /// Usuários de teste:
    /// - admin@pcinventory.com / admin123
    /// - user@pcinventory.com / user123
    /// </remarks>
    [HttpPost("login")]
    public ActionResult<AuthResponse> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { mensagem = "Email e senha são obrigatórios" });

        var response = _authService.Authenticate(request.Email, request.Password);
        if (response == null)
            return Unauthorized(new { mensagem = "Email ou senha inválidos" });

        return Ok(response);
    }

    /// <summary>
    /// Renova access token usando refresh token
    /// </summary>
    [HttpPost("refresh")]
    public ActionResult<AuthResponse> Refresh([FromBody] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { mensagem = "Email é obrigatório" });

        var accessToken = _authService.RefreshAccessToken(email);
        if (accessToken == null)
            return Unauthorized(new { mensagem = "Email inválido" });

        return Ok(new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = "",
            ExpiresIn = 15 * 60,
            TokenType = "Bearer"
        });
    }
}
