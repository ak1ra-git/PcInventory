namespace PcInventory.Models;

// Entidade de domínio que representa um produto no estoque.
public class Produto
{
    public int CodProduto { get; set; } // Chave primária do produto.

    public string Nome { get; set; } = string.Empty; // Nome do produto.

    public decimal Preco { get; set; } // Preço unitário do produto.

    public int Estoque { get; set; } // Quantidade disponível em estoque.
}