public class User
{
    public int Id { get; set; }
    public required string Usuario { get; set; }      // ← Username de login
    public required string PasswordHash { get; set; }
    public required string Name { get; set; }
    public DateTime CreatedAt { get; set; }
}