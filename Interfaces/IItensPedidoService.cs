using PcInventory.Models;

namespace PcInventory.Interfaces
{
    // Interface de serviço para itens de pedido.
    // Controla a lógica de adição e remoção de itens.
    public interface IItensPedidoService
    {
        Task<IEnumerable<ItensPedidos>> ObterPorPedidoAsync(int codPedido);
        Task AdicionarItemAsync(int codPedido, int codProduto, int quantidade);
        Task RemoverItemAsync(int codPedido, int codProduto);
    }
}