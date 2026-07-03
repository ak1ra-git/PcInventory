using PcInventory.Models;

namespace PcInventory.Interfaces
{
    // Contrato: define O QUE o repositório deve fazer, sem dizer COMO.
    public interface IProdutoRepository
    {
        Task<IEnumerable<Produto>> ObterTodosAsync();
        Task<Produto?> ObterPorIdAsync(int id); // "?" = pode não encontrar (retorna null)
        Task<int> AdicionarAsync(Produto produto); // retorna o ID gerado pelo banco
        Task<bool> AtualizarAsync(Produto produto); // retorna true se atualizou, false se não encontrou
        Task<bool> RemoverAsync(int id); // retorna true se removeu, false se não encontrou
    }
}