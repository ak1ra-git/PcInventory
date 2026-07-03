using Dapper;
using PcInventory.Database;
using PcInventory.Interfaces;
using PcInventory.Models;

namespace PcInventory.Repositories
{
    public class ItensPedidoRepository : IItensPedidoRepository
    {
        private readonly ConnectionFactory _connectionFactory;

        public ItensPedidoRepository(ConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<ItensPedidos>> ObterPorPedidoAsync(int codPedido)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            const string sql = "SELECT * FROM ItensPedidos WHERE CodPedido = @CodPedido";
            return await connection.QueryAsync<ItensPedidos>(sql, new { CodPedido = codPedido });
        }

        // Insere o item, abate o estoque do produto e recalcula o total do pedido.
        // Tudo dentro de UMA transação: se algo falhar, nada é salvo.
        public async Task AdicionarItemAsync(ItensPedidos item)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                const string sqlInsertItem = @"
                    INSERT INTO ItensPedidos (CodPedido, CodProduto, Quantidade, PrecoUnitario)
                    VALUES (@CodPedido, @CodProduto, @Quantidade, @PrecoUnitario)";

                await connection.ExecuteAsync(sqlInsertItem, item, transaction);

                const string sqlAtualizaEstoque = @"
                    UPDATE Produtos
                    SET Estoque = Estoque - @Quantidade
                    WHERE CodProduto = @CodProduto";

                await connection.ExecuteAsync(sqlAtualizaEstoque,
                    new { item.Quantidade, item.CodProduto }, transaction);

                const string sqlAtualizaTotal = @"
                    UPDATE Pedido
                    SET ValorTotal = (
                        SELECT SUM(Quantidade * PrecoUnitario)
                        FROM ItensPedidos
                        WHERE CodPedido = @CodPedido
                    )
                    WHERE CodPedido = @CodPedido";

                await connection.ExecuteAsync(sqlAtualizaTotal,
                    new { item.CodPedido }, transaction);

                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task RemoverItemAsync(int codPedido, int codProduto)
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                const string sqlBuscaItem = @"
                    SELECT Quantidade FROM ItensPedidos
                    WHERE CodPedido = @CodPedido AND CodProduto = @CodProduto";

                var quantidade = await connection.QuerySingleOrDefaultAsync<int?>(
                    sqlBuscaItem, new { CodPedido = codPedido, CodProduto = codProduto }, transaction);

                if (quantidade == null)
                {
                    transaction.Rollback();
                    return; // item não existe, nada a fazer
                }

                const string sqlDeleta = @"
                    DELETE FROM ItensPedidos
                    WHERE CodPedido = @CodPedido AND CodProduto = @CodProduto";

                await connection.ExecuteAsync(sqlDeleta,
                    new { CodPedido = codPedido, CodProduto = codProduto }, transaction);

                const string sqlDevolveEstoque = @"
                    UPDATE Produtos
                    SET Estoque = Estoque + @Quantidade
                    WHERE CodProduto = @CodProduto";

                await connection.ExecuteAsync(sqlDevolveEstoque,
                    new { Quantidade = quantidade, CodProduto = codProduto }, transaction);

                const string sqlAtualizaTotal = @"
                    UPDATE Pedido
                    SET ValorTotal = ISNULL((
                        SELECT SUM(Quantidade * PrecoUnitario)
                        FROM ItensPedidos
                        WHERE CodPedido = @CodPedido
                    ), 0)
                    WHERE CodPedido = @CodPedido";

                await connection.ExecuteAsync(sqlAtualizaTotal,
                    new { CodPedido = codPedido }, transaction);

                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}