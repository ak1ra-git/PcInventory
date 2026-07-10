using PcInventory.Models;
using PcInventory.Interfaces;

namespace PcInventory.Services
{
    // PedidoService aplica regras de negócio específicas para pedidos.
    // Ele valida dados e controla quais campos podem ser alterados pelo usuário.
    public class PedidoService : IPedidoService
    {
        private readonly IPedidoRepository _pedidoRepository;

        public PedidoService(IPedidoRepository pedidoRepository)
        {
            _pedidoRepository = pedidoRepository;
        }

        public async Task<IEnumerable<Pedido>> ObterTodosAsync()
        {
            // Retorna todos os pedidos do banco.
            return await _pedidoRepository.ObterTodosAsync();
        }

        public async Task<Pedido?> ObterPorIdAsync(int id)
        {
            return await _pedidoRepository.ObterPorIdAsync(id);
        }

        public async Task<int> AdicionarAsync(Pedido pedido)
        {
            if (pedido.CodCliente <= 0)
                throw new ArgumentException("É necessário informar um cliente válido.");

            // Data do pedido é definida pelo sistema, não pelo cliente.
            pedido.DataPedido = DateTime.Now;

            // Se o valor total não foi informado, inicializa em zero
            if (pedido.ValorTotal < 0)
                pedido.ValorTotal = 0;

            var id = await _pedidoRepository.AdicionarAsync(pedido);
            pedido.CodPedido = id;
            return id;
        }

        public async Task<bool> AtualizarAsync(Pedido pedido)
        {
            if (pedido.CodCliente <= 0)
                throw new ArgumentException("É necessário informar um cliente válido.");

            // Não alteramos DataPedido e ValorTotal aqui. O total é recalculado pelos itens.
            return await _pedidoRepository.AtualizarAsync(pedido);
        }

        public async Task<bool> DeletarAsync(int id)
        {
            return await _pedidoRepository.DeletarAsync(id);
        }
    }
}