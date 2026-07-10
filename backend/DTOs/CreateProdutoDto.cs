namespace PcInventory.DTOs;

/// <summary>
/// DTO para criar novo produto
/// </summary>
public class CreateProdutoDto
{
    public required string Nome { get; set; }
    public required decimal Preco { get; set; }
    public required int Estoque { get; set; }
}
