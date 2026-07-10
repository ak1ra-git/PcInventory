using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PcInventory.Interfaces;
using PcInventory.Models;

namespace PcInventory.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PedidosController : ControllerBase
    {
        private readonly IPedidoService _pedidoService;

        public PedidosController(IPedidoService pedidoService)
        {
            _pedidoService = pedidoService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pedido>>> ObterTodos()
        {
            // Retorna todos os pedidos cadastrados no sistema.
            var pedidos = await _pedidoService.ObterTodosAsync();
            return Ok(pedidos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Pedido>> ObterPorId(int id)
        {
            // Busca um pedido por ID.
            var pedido = await _pedidoService.ObterPorIdAsync(id);
            if (pedido == null)
            {
                return NotFound(new { mensagem = $"Pedido com ID {id} não encontrado." });
            }
            return Ok(pedido);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Adicionar([FromBody] Pedido pedido)
        {
            try
            {
                // Encaminha a criação do pedido para a camada de serviço.
                var id = await _pedidoService.AdicionarAsync(pedido);
                return CreatedAtAction(nameof(ObterPorId), new { id }, pedido);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Atualizar(int id, [FromBody] Pedido pedido)
        {
            if (id != pedido.CodPedido)
                return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID do pedido." });

            try
            {
                var atualizado = await _pedidoService.AtualizarAsync(pedido);

                if (!atualizado)
                    return NotFound(new { mensagem = $"Pedido com ID {id} não encontrado." });

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Excluir(int id)
        {
            var excluido = await _pedidoService.DeletarAsync(id);
            if (!excluido)
                return NotFound(new { mensagem = $"Pedido com ID {id} não encontrado." });
            return NoContent();
        }
    }
}
