namespace PcInventory.Models
{
    // Entidade de domínio que representa um pedido de venda.
    public class Pedido
    {
        public int CodPedido { get; set; } // Chave primária do pedido.
        public int CodCliente { get; set; } // FK para o cliente que fez o pedido.
        public DateTime DataPedido { get; set; } // Data em que o pedido foi criado.
        public decimal ValorTotal { get; set; } // Soma dos itens do pedido.
    }
}
