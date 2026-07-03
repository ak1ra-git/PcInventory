// IClienteService.cs
using PcInventory.Models;

namespace PcInventory.Interfaces
{
    // Interface de serviço para clientes. Define operações de negócio para controller.
    public interface IClienteService
    {
        Task<IEnumerable<Cliente>> ObterTodosAsync();
        Task<Cliente?> ObterPorIdAsync(int id);
        Task<int> AdicionarAsync(Cliente cliente);
        Task<bool> AtualizarAsync(Cliente cliente);
        Task<bool> DeletarAsync(int id);
    }
}