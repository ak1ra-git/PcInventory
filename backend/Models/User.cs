namespace PcInventory.Models;

/// <summary>
/// Modelo de usuário para autenticação
/// </summary>
public class User
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public required string Name { get; set; }
    public DateTime CreatedAt { get; set; }
}
