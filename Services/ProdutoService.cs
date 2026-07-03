using PcInventory.Interfaces;
using PcInventory.Models;

namespace PcInventory.Services
{
    // O ProdutoService aplica regras de negócio antes de delegar para o repositório.
    // Ele não faz acesso direto ao banco, apenas valida dados e chama a camada abaixo.
    public class ProdutoService : IProdutoService
    {
        private readonly IProdutoRepository _produtoRepository;

        public ProdutoService(IProdutoRepository produtoRepository)
        {
            _produtoRepository = produtoRepository;
        }

        public async Task<IEnumerable<Produto>> ObterTodosAsync()
        {
            // Retorna todos os produtos, sem validação adicional.
            return await _produtoRepository.ObterTodosAsync();
        }

        public async Task<Produto?> ObterPorIdAsync(int id)
        {
            // Busca um produto por ID. Se não existir, retorna null.
            return await _produtoRepository.ObterPorIdAsync(id);
        }

        public async Task<int> AdicionarAsync(Produto produto)
        {
            // Validações de negócio ficam aqui, não no Controller nem no Repository.
            if (string.IsNullOrWhiteSpace(produto.Nome))
                throw new ArgumentException("O nome do produto é obrigatório.");

            if (produto.Preco <= 0)
                throw new ArgumentException("O preço deve ser maior que zero.");

            if (produto.Estoque < 0)
                throw new ArgumentException("O estoque não pode ser negativo.");

            // Se passou na validação, insere no banco.
            return await _produtoRepository.AdicionarAsync(produto);
        }

        public async Task<bool> AtualizarAsync(Produto produto)
        {
            if (produto.CodProduto <= 0)
                throw new ArgumentException("O ID do produto é inválido.");

            if (string.IsNullOrWhiteSpace(produto.Nome))
                throw new ArgumentException("O nome do produto é obrigatório.");

            if (produto.Preco <= 0)
                throw new ArgumentException("O preço deve ser maior que zero.");

            if (produto.Estoque < 0)
                throw new ArgumentException("O estoque não pode ser negativo.");

            // Apenas passa para o repositório depois de validar.
            return await _produtoRepository.AtualizarAsync(produto);
        }

        public async Task<bool> RemoverAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("O ID do produto é inválido.");

            return await _produtoRepository.RemoverAsync(id);
        }
    }
}