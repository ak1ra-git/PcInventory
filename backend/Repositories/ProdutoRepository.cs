using Dapper;
using PcInventory.Database;
using PcInventory.Interfaces;
using PcInventory.Models;

namespace PcInventory.Repositories
{
    // Implementação real: aqui SIM tem SQL. Repository nunca tem regra de negócio.
    // O objetivo dessa classe é executar as consultas no banco e devolver dados ao serviço.
    public class ProdutoRepository : IProdutoRepository
    {
        private readonly ConnectionFactory _connectionFactory;

        public ProdutoRepository(ConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Produto>> ObterTodosAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            // Tabela no banco: Produtos.
            const string sql = "SELECT * FROM Produtos";

            return await connection.QueryAsync<Produto>(sql);
        }

        public async Task<Produto?> ObterPorIdAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            const string sql = "SELECT * FROM Produtos WHERE CodProduto = @Id";

            // Null se o produto não existir.
            return await connection.QueryFirstOrDefaultAsync<Produto>(sql, new { Id = id });
        }

        public async Task<int> AdicionarAsync(Produto produto)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            // Parâmetros Dapper para evitar SQL injection.
            const string sql = @"
                INSERT INTO Produtos (Nome, Preco, Estoque)
                VALUES (@Nome, @Preco, @Estoque);
                SELECT CAST(SCOPE_IDENTITY() AS INT);";

            // Retorna o ID gerado pelo banco.
            return await connection.QuerySingleAsync<int>(sql, produto);
        }

        public async Task<bool> AtualizarAsync(Produto produto)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            const string sql = @"
                UPDATE Produtos
                SET Nome = @Nome, Preco = @Preco, Estoque = @Estoque
                WHERE CodProduto = @CodProduto";

            var rowsAffected = await connection.ExecuteAsync(sql, produto);
            return rowsAffected > 0; // true se atualizou algum registro.
        }

        public async Task<bool> RemoverAsync(int id)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            const string sql = "DELETE FROM Produtos WHERE CodProduto = @Id";

            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
            return rowsAffected > 0; // true se removeu algum registro.
        }

        public async Task<bool> TemItensVinculadosAsync(int produtoId)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            const string sql = "SELECT COUNT(*) FROM ItensPedidos WHERE CodProduto = @ProdutoId";
            var count = await connection.ExecuteScalarAsync<int>(sql, new { ProdutoId = produtoId });
            return count > 0;
        }
    }
}