using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PcInventory.Interfaces;

namespace PcInventory.Controllers
{
    [ApiController]
    [Route("api/pedidos/{codPedido}/itens")]
    public class ItensPedidoController : ControllerBase
    {
        private readonly IItensPedidoService _itensPedidoService;

        public ItensPedidoController(IItensPedidoService itensPedidoService)
        {
            _itensPedidoService = itensPedidoService;
        }

        [HttpGet]
        public async Task<IActionResult> ObterPorPedido(int codPedido)
        {
            // Retorna todos os itens de um pedido específico.
            var itens = await _itensPedidoService.ObterPorPedidoAsync(codPedido);
            return Ok(itens);
        }

        public class AdicionarItemRequest
        {
            public int CodProduto { get; set; }
            public int Quantidade { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Adicionar(int codPedido, [FromBody] AdicionarItemRequest request)
        {
            try
            {
                // Cria um novo item para o pedido e atualiza estoque/total.
                await _itensPedidoService.AdicionarItemAsync(codPedido, request.CodProduto, request.Quantidade);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // Estoque insuficiente → 409 Conflict.
                return Conflict(new { mensagem = ex.Message });
            }
        }

        [HttpDelete("{codProduto}")]
        public async Task<IActionResult> Remover(int codPedido, int codProduto)
        {
            // Remove um item do pedido e ajusta estoque/total.
            await _itensPedidoService.RemoverItemAsync(codPedido, codProduto);
            return NoContent();
        }
    }
}