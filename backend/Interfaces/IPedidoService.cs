using PcInventory.Models;

namespace PcInventory.Interfaces
{
    // Interface de serviço para pedidos. Define as operações de negócio disponíveis ao controller.
    public interface IPedidoService
    {
        Task<IEnumerable<Pedido>> ObterTodosAsync();
        Task<Pedido?> ObterPorIdAsync(int id);
        Task<int> AdicionarAsync(Pedido pedido);
        Task<bool> AtualizarAsync(Pedido pedido);
        Task<bool> DeletarAsync(int id);
        Task<bool> CancelarPedidoAsync(int codPedido);
    }
}