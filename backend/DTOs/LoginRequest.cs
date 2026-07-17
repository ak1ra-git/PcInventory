namespace PcInventory.DTOs;

/// <summary>
/// Requisição de login do usuário
/// </summary>
public class LoginRequest
{
    public required string Usuario { get; set; }
    public required string Password { get; set; }
}
