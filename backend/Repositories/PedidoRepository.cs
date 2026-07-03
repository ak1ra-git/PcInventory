using Dapper;
using PcInventory.Database;
using PcInventory.Interfaces;
using PcInventory.Models;

namespace PcInventory.Repositories
{
    // Repositório responsável por persistir pedidos no banco.
    // Ele executa apenas SQL e devolve informações à camada de serviço.
    public class PedidoRepository : IPedidoRepository
    {
        private readonly ConnectionFactory ConnectionFactory;

        public PedidoRepository(ConnectionFactory ConnectionFactory)
        {
            this.ConnectionFactory = ConnectionFactory;
        }

        public async Task<IEnumerable<Pedido>> ObterTodosAsync()
        {
            using var connection = ConnectionFactory.CreateConnection();
            await connection.OpenAsync();
            return await connection.QueryAsync<Pedido>("SELECT * FROM Pedido");
        }

        public async Task<Pedido?> ObterPorIdAsync(int id)
        {
            using var connection = ConnectionFactory.CreateConnection();
            await connection.OpenAsync();
            return await connection.QueryFirstOrDefaultAsync<Pedido>("SELECT * FROM Pedido WHERE CodPedido = @CodPedido", new { CodPedido = id });
        }

        public async Task<int> AdicionarAsync(Pedido pedido)
        {
            using var connection = ConnectionFactory.CreateConnection();
            await connection.OpenAsync();
            var sql = "INSERT INTO Pedido (CodCliente, DataPedido, ValorTotal) VALUES (@CodCliente, @DataPedido, @ValorTotal); SELECT CAST(SCOPE_IDENTITY() as int)";
            return await connection.ExecuteScalarAsync<int>(sql, pedido);
        }

        public async Task<bool> AtualizarAsync(Pedido pedido)
        {
            using var connection = ConnectionFactory.CreateConnection();
            await connection.OpenAsync();
            var sql = "UPDATE Pedido SET CodCliente = @CodCliente, DataPedido = @DataPedido, ValorTotal = @ValorTotal WHERE CodPedido = @CodPedido";
            var linhasAfetadas = await connection.ExecuteAsync(sql, pedido);
            return linhasAfetadas > 0;
        }

        public async Task<bool> DeletarAsync(int id)
        {
            using var connection = ConnectionFactory.CreateConnection();
            await connection.OpenAsync();
            var sql = "DELETE FROM Pedido WHERE CodPedido = @CodPedido";
            var linhasAfetadas = await connection.ExecuteAsync(sql, new { CodPedido = id });
            return linhasAfetadas > 0;
        }
    }
}