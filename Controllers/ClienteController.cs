using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using PcInventory.Interfaces;
using PcInventory.Models;

namespace PcInventory.Controllers
{
    [ApiController]
    [Route("api/clientes")]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        public ClienteController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        [HttpGet]
        public async Task<IActionResult> ObterTodos()
        {
            // Retorna todos os clientes cadastrados.
            var clientes = await _clienteService.ObterTodosAsync();
            return Ok(clientes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObterPorId(int id)
        {
            var cliente = await _clienteService.ObterPorIdAsync(id);

            if (cliente == null)
                return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });

            return Ok(cliente);
        }

        [HttpPost]
        public async Task<IActionResult> Adicionar([FromBody] Cliente cliente)
        {
            try
            {
                // Cria um cliente novo e devolve 201 Created.
                var id = await _clienteService.AdicionarAsync(cliente);
                return CreatedAtAction(nameof(ObterPorId), new { id }, cliente);
            }
            catch (ArgumentException ex)
            {
                // Validação de dados enviada pela camada de serviço.
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601)
            {
                // Conflito de chave única, como CNPJ duplicado.
                return Conflict(new { mensagem = "Já existe um cliente cadastrado com esse CNPJ." });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] Cliente cliente)
        {
            if (id != cliente.CodCliente)
                return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID do cliente." });

            try
            {
                var atualizado = await _clienteService.AtualizarAsync(cliente);

                if (!atualizado)
                    return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601)
            {
                return Conflict(new { mensagem = "Já existe um cliente cadastrado com esse CNPJ." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletar(int id)
        {
            var deletado = await _clienteService.DeletarAsync(id);

            if (!deletado)
                return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });

            return NoContent();
        }
    }
}