namespace PcInventory.DTOs;

/// <summary>
/// Resposta de autenticação com tokens JWT
/// </summary>
public class AuthResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public required int ExpiresIn { get; set; }
    public required string TokenType { get; set; } = "Bearer";
}
