using Dapper;
using PcInventory.Database;
using PcInventory.Interfaces;
using PcInventory.Models;

namespace PcInventory.Repositories
{
    public class ClienteRepository : IClienteRepository
    {
        private readonly ConnectionFactory _connectionFactory;

        public ClienteRepository(ConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Cliente>> ObterTodosAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            const string sql = "SELECT * FROM Cliente";
            return await connection.QueryAsync<Cliente>(sql);
        }

        public async Task<Cliente?> ObterPorIdAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            const string sql = "SELECT * FROM Cliente WHERE CodCliente = @Id";
            return await connection.QueryFirstOrDefaultAsync<Cliente>(sql, new { Id = id });
        }

        public async Task<int> AdicionarAsync(Cliente cliente)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            const string sql = @"
                INSERT INTO Cliente (CNPJ, Nome, Email, DataCadastro)
                VALUES (@CNPJ, @Nome, @Email, @DataCadastro);
                SELECT CAST(SCOPE_IDENTITY() AS INT);";

            return await connection.QuerySingleAsync<int>(sql, cliente);
        }

        public async Task<bool> AtualizarAsync(Cliente cliente)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            const string sql = @"
                UPDATE Cliente
                SET CNPJ = @CNPJ, Nome = @Nome, Email = @Email
                WHERE CodCliente = @CodCliente";

            var linhasAfetadas = await connection.ExecuteAsync(sql, cliente);
            return linhasAfetadas > 0;
        }

        public async Task<bool> RemoverAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            const string sql = "DELETE FROM Cliente WHERE CodCliente = @Id";
            var linhasAfetadas = await connection.ExecuteAsync(sql, new { Id = id });
            return linhasAfetadas > 0;
        }

        public async Task<bool> TemPedidosVinculadosAsync(int clienteId)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            const string sql = "SELECT COUNT(*) FROM Pedido WHERE CodCliente = @ClienteId";
            var count = await connection.ExecuteScalarAsync<int>(sql, new { ClienteId = clienteId });
            return count > 0;
        }
    }
}