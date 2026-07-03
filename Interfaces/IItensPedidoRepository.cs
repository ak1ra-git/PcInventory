using PcInventory.Models;

namespace PcInventory.Interfaces
{
    // Contrato do repositório de itens de pedido.
    // Define as operações de persistência no banco.
    public interface IItensPedidoRepository
    {
        Task<IEnumerable<ItensPedidos>> ObterPorPedidoAsync(int codPedido);
        Task AdicionarItemAsync(ItensPedidos item);
        Task RemoverItemAsync(int codPedido, int codProduto);
    }
}