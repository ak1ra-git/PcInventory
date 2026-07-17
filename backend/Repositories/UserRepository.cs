using Dapper;
using PcInventory.Database;
using PcInventory.Models;

namespace PcInventory.Repositories;

public class UserRepository
{
    private readonly ConnectionFactory _connectionFactory;

    public UserRepository(ConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> GetByUsuarioAsync(string usuario)
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string query = @"
            SELECT
                CodUsuario as Id,
                NomeUsuario as Usuario,
                SenhaHash as PasswordHash,
                DataCriacao as CreatedAt
            FROM Usuario
            WHERE NomeUsuario = @Usuario
        ";

        return await connection.QueryFirstOrDefaultAsync<User>(query,
            new { Usuario = usuario });
    }
}
