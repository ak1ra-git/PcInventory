using PcInventory.Interfaces;
using PcInventory.Models;

namespace PcInventory.Services
{
    // ItensPedidoService controla a lógica de adicionar e remover itens de pedido.
    // Ele garante que o estoque seja verificado antes e que o preço seja travado no momento da compra.
    public class ItensPedidoService : IItensPedidoService
    {
        private readonly IItensPedidoRepository _itensPedidoRepository;
        private readonly IProdutoRepository _produtoRepository;

        public ItensPedidoService(
            IItensPedidoRepository itensPedidoRepository,
            IProdutoRepository produtoRepository)
        {
            _itensPedidoRepository = itensPedidoRepository;
            _produtoRepository = produtoRepository;
        }

        public async Task<IEnumerable<ItensPedidos>> ObterPorPedidoAsync(int codPedido)
        {
            return await _itensPedidoRepository.ObterPorPedidoAsync(codPedido);
        }

        public async Task AdicionarItemAsync(int codPedido, int codProduto, int quantidade)
        {
            if (quantidade <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");

            var produto = await _produtoRepository.ObterPorIdAsync(codProduto);

            if (produto == null)
                throw new ArgumentException("Produto não encontrado.");

            if (produto.Estoque < quantidade)
                throw new InvalidOperationException(
                    $"Estoque insuficiente para '{produto.Nome}'. Disponível: {produto.Estoque}, solicitado: {quantidade}.");

            var item = new ItensPedidos
            {
                CodPedido = codPedido,
                CodProduto = codProduto,
                Quantidade = quantidade,
                PrecoUnitario = produto.Preco // trava o preço no momento da compra.
            };

            // A lógica de transação fica no repositório.
            await _itensPedidoRepository.AdicionarItemAsync(item);
        }

        public async Task RemoverItemAsync(int codPedido, int codProduto)
        {
            // Delegamos a remoção de item e ajuste de estoque para o repositório.
            await _itensPedidoRepository.RemoverItemAsync(codPedido, codProduto);
        }
    }
}