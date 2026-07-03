namespace PcInventory.Models;

// Entidade de domínio que representa um cliente cadastrado.
public class Cliente
{
    public int CodCliente { get; set; } // Chave primária do cliente.

    public string CNPJ { get; set; } = string.Empty; // Documento do cliente.

    public string Nome { get; set; } = string.Empty; // Nome ou razão social.

    public string Email { get; set; } = string.Empty; // Email de contato.

    public DateTime DataCadastro { get; set; } // Data de criação do registro.
}