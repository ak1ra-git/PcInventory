using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace PcInventory.Database;

// Classe responsável por criar conexões SQL usando a connection string do appsettings.
// Ela permite centralizar a configuração do banco de dados em um único lugar.
public class ConnectionFactory
{
    private readonly IConfiguration _configuration;

    public ConnectionFactory(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public SqlConnection CreateConnection()
    {
        // Usa a connection string DefaultConnection definida em appsettings.json.
        return new SqlConnection(
            _configuration.GetConnectionString("DefaultConnection")
        );
    }
}