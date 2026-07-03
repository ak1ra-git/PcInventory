using PcInventory.Models;

namespace PcInventory.Interfaces
{
    // Contrato do repositório de pedidos. Responsável por CRUD no banco de dados.
    public interface IPedidoRepository
    {
        Task<IEnumerable<Pedido>> ObterTodosAsync();
        Task<Pedido?> ObterPorIdAsync(int id);
        Task<int> AdicionarAsync(Pedido pedido);
        Task<bool> AtualizarAsync(Pedido pedido);
        Task<bool> DeletarAsync(int id);
    }
}