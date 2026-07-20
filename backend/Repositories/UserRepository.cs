using Dapper;
using PcInventory.Database;
using PcInventory.Models;

namespace PcInventory.Repositories;

public class UserRepository
{
    private readonly ConnectionFactory _connectionFactory;
    private readonly ILogger<UserRepository> _logger;

    public UserRepository(ConnectionFactory connectionFactory, ILogger<UserRepository> logger)
    {
        _connectionFactory = connectionFactory;
        _logger = logger;
    }

    public async Task<User?> GetByUsuarioAsync(string usuario)
    {
        try
        {
            using var connection = _connectionFactory.CreateConnection();
            await connection.OpenAsync();

            const string query = @"
                SELECT
                    CodUsuario as Id,
                    Usuario,
                    Nome as Name,
                    SenhaHash as PasswordHash,
                    DataCadastro as CreatedAt
                FROM Usuario
                WHERE Usuario = @Usuario
            ";

            var user = await connection.QueryFirstOrDefaultAsync<User>(query,
                new { Usuario = usuario });

            _logger.LogInformation($"Usuário encontrado: {user?.Usuario}, Nome: {user?.Name ?? "NULL"}");

            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro ao buscar usuário {usuario}: {ex.Message}");
            throw;
        }
    }
}
