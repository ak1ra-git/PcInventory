namespace PcInventory.DTOs;

/// <summary>
/// Requisição de login do usuário
/// </summary>
public class LoginRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
