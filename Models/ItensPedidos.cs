namespace PcInventory.Models
{
    // Entidade de domínio que representa um item dentro de um pedido.
    public class ItensPedidos
    {
        public int CodPedido { get; set; } // FK para o pedido.
        public int CodProduto { get; set; } // FK para o produto.
        public int Quantidade { get; set; } // Quantidade comprada desse produto.
        public decimal PrecoUnitario { get; set; } // Preço do produto no momento da compra.
    }
}
