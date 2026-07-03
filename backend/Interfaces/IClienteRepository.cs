using PcInventory.Models;

namespace PcInventory.Interfaces
{
    // Contrato do repositório de clientes.
    // Define métodos para acesso ao banco de dados.
    public interface IClienteRepository
    {
        Task<IEnumerable<Cliente>> ObterTodosAsync();
        Task<Cliente?> ObterPorIdAsync(int id);
        Task<int> AdicionarAsync(Cliente cliente);
        Task<bool> AtualizarAsync(Cliente cliente);
        Task<bool> RemoverAsync(int id);
    }
}