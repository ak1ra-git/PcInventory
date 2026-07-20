using PcInventory.Models;
using PcInventory.Interfaces;
using PcInventory.Database;
using Dapper;

namespace PcInventory.Services
{
    // PedidoService aplica regras de negócio específicas para pedidos.
    // Ele valida dados e controla quais campos podem ser alterados pelo usuário.
    public class PedidoService : IPedidoService
    {
        private readonly IPedidoRepository _pedidoRepository;
        private readonly ConnectionFactory _connectionFactory;
        private readonly ILogger<PedidoService> _logger;

        public PedidoService(IPedidoRepository pedidoRepository, ConnectionFactory connectionFactory, ILogger<PedidoService> logger)
        {
            _pedidoRepository = pedidoRepository;
            _connectionFactory = connectionFactory;
            _logger = logger;
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
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                await connection.OpenAsync();

                using var transaction = connection.BeginTransaction();

                // 1. Devolve estoque dos produtos do pedido
                const string rollbackEstoqueQuery = @"
                    UPDATE Produtos
                    SET Estoque = Estoque + (
                        SELECT ISNULL(SUM(Quantidade), 0)
                        FROM ItensPedidos
                        WHERE CodPedido = @CodPedido
                        AND CodProduto = Produtos.CodProduto
                    )
                    WHERE CodProduto IN (
                        SELECT DISTINCT CodProduto
                        FROM ItensPedidos
                        WHERE CodPedido = @CodPedido
                    )
                ";
                await connection.ExecuteAsync(rollbackEstoqueQuery, new { CodPedido = id }, transaction);

                // 2. Deleta items do pedido
                const string deleteItensQuery = "DELETE FROM ItensPedidos WHERE CodPedido = @CodPedido";
                await connection.ExecuteAsync(deleteItensQuery, new { CodPedido = id }, transaction);

                // 3. Deleta o pedido
                const string deletePedidoQuery = "DELETE FROM Pedido WHERE CodPedido = @CodPedido";
                var linhasAfetadas = await connection.ExecuteAsync(deletePedidoQuery, new { CodPedido = id }, transaction);

                transaction.Commit();
                _logger.LogInformation($"Pedido {id} deletado com sucesso. Estoque restaurado.");
                return linhasAfetadas > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao deletar pedido {id}: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> CancelarPedidoAsync(int codPedido)
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                await connection.OpenAsync();

                // Inicia transação para garantir atomicidade
                using var transaction = connection.BeginTransaction();

                // 1. Atualiza status do pedido para Cancelado
                const string updatePedidoQuery = @"
                    UPDATE Pedido
                    SET Status = 'Cancelado'
                    WHERE CodPedido = @CodPedido
                ";
                await connection.ExecuteAsync(updatePedidoQuery, new { CodPedido = codPedido }, transaction);

                // 2. Devolve o estoque para cada produto do pedido
                const string rollbackEstoqueQuery = @"
                    UPDATE Produtos
                    SET Estoque = Estoque + (
                        SELECT ISNULL(SUM(Quantidade), 0)
                        FROM ItensPedidos
                        WHERE CodPedido = @CodPedido
                        AND CodProduto = Produtos.CodProduto
                    )
                    WHERE CodProduto IN (
                        SELECT DISTINCT CodProduto
                        FROM ItensPedidos
                        WHERE CodPedido = @CodPedido
                    )
                ";
                await connection.ExecuteAsync(rollbackEstoqueQuery, new { CodPedido = codPedido }, transaction);

                transaction.Commit();
                _logger.LogInformation($"Pedido {codPedido} cancelado com sucesso. Estoque restaurado.");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao cancelar pedido {codPedido}: {ex.Message}");
                throw;
            }
        }
    }
}