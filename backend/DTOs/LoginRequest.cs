namespace PcInventory.DTOs;

public class LoginRequest
{
    public required string Usuario { get; set; }
    public required string Senha { get; set; }
}
