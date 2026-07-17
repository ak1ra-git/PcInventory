using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using PcInventory.Database;
using Dapper;

namespace PcInventory.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ConnectionFactory _connectionFactory;
        private readonly ILogger<HealthController> _logger;

        public HealthController(ConnectionFactory connectionFactory, ILogger<HealthController> logger)
        {
            _connectionFactory = connectionFactory;
            _logger = logger;
        }

        [HttpGet("db")]
        public async Task<IActionResult> CheckDatabase()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                await connection.OpenAsync();
                _logger.LogInformation("Conexão ao banco bem-sucedida");
                await connection.CloseAsync();
                return Ok(new { status = "ok", message = "Banco de dados conectado" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao conectar no banco: {ex.Message}");
                return BadRequest(new { status = "error", message = ex.Message });
            }
        }

        [HttpGet("tables")]
        public async Task<IActionResult> ListTables()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                await connection.OpenAsync();

                var tables = await connection.QueryAsync<string>(
                    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'");

                return Ok(new { tables = tables });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao listar tabelas: {ex.Message}");
                return BadRequest(new { status = "error", message = ex.Message });
            }
        }

        [HttpGet("usuarios")]
        public async Task<IActionResult> CheckUsuarios()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                await connection.OpenAsync();

                var usuarios = await connection.QueryAsync<dynamic>(
                    "SELECT * FROM Usuario");

                return Ok(new { count = usuarios.Count(), data = usuarios });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao buscar usuários: {ex.Message}");
                return BadRequest(new { status = "error", message = ex.Message });
            }
        }

        [HttpGet("pedidos")]
        public async Task<IActionResult> CheckPedidos()
        {
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                await connection.OpenAsync();

                var pedidos = await connection.QueryAsync<dynamic>(
                    "SELECT * FROM Pedido");

                return Ok(new { count = pedidos.Count(), data = pedidos });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao buscar pedidos: {ex.Message}");
                return BadRequest(new { status = "error", message = ex.Message });
            }
        }
    }
}
