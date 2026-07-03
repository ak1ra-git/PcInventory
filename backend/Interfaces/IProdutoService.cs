using PcInventory.Models;

namespace PcInventory.Interfaces
{
    // Interface de serviço para produtos. Define operações de negócio que podem ser usadas pelo controller.
    public interface IProdutoService
    {
        Task<IEnumerable<Produto>> ObterTodosAsync();
        Task<Produto?> ObterPorIdAsync(int id);
        Task<int> AdicionarAsync(Produto produto);
        Task<bool> AtualizarAsync(Produto produto);
        Task<bool> RemoverAsync(int id);
    }
}