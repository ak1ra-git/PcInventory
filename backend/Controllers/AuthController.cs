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
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Usuario) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { mensagem = "Usuário e senha são obrigatórios" });

        var response = await _authService.AuthenticateAsync(request.Usuario, request.Password);
        if (response == null)
            return Unauthorized(new { mensagem = "Usuário ou senha inválidos" });

        return Ok(response);
    }

    /// <summary>
    /// Renova access token usando refresh token
    /// </summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] string usuario)
    {
        if (string.IsNullOrWhiteSpace(usuario))
            return BadRequest(new { mensagem = "Usuário é obrigatório" });

        var accessToken = await _authService.RefreshAccessTokenAsync(usuario);
        if (accessToken == null)
            return Unauthorized(new { mensagem = "Usuário inválido" });

        return Ok(new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = "",
            ExpiresIn = 15 * 60,
            TokenType = "Bearer"
        });
    }
}
