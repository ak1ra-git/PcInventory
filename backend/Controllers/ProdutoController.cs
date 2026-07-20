using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PcInventory.DTOs;
using PcInventory.Interfaces;
using PcInventory.Models;

namespace PcInventory.Controllers
{
    [ApiController]
    [Route("api/produtos")]
    [Authorize]
    public class ProdutoController : ControllerBase
    {
        private readonly IProdutoService _produtoService;

        public ProdutoController(IProdutoService produtoService)
        {
            _produtoService = produtoService;
        }

        [HttpGet]
        public async Task<IActionResult> ObterTodos(int pagina = 1, int tamanho = 10)
        {
            // Validação
            if (pagina < 1) pagina = 1;
            if (tamanho < 1) tamanho = 10;

            // Obtém todos os produtos
            var todosProdutos = (await _produtoService.ObterTodosAsync()).ToList();
            var totalItens = todosProdutos.Count;
            var totalPaginas = (int)Math.Ceiling(totalItens / (double)tamanho);

            // Calcula offset e busca produtos da página
            var offset = (pagina - 1) * tamanho;
            var produtosPaginados = todosProdutos
                .Skip(offset)
                .Take(tamanho)
                .ToList();

            var resposta = new PaginatedResponse<Produto>
            {
                Data = produtosPaginados,
                TotalPaginas = totalPaginas,
                PaginaAtual = pagina,
                TotalItens = totalItens
            };

            return Ok(resposta);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObterPorId(int id)
        {
            // Busca um produto específico pelo ID.
            var produto = await _produtoService.ObterPorIdAsync(id);

            if (produto == null)
                return NotFound(new { mensagem = $"Produto com ID {id} não encontrado." });

            return Ok(produto);
        }

        [HttpPost]
        public async Task<IActionResult> Adicionar([FromBody] Produto produto)
        {
            try
            {
                // Envia a validação e a inserção para a camada de serviço.
                var id = await _produtoService.AdicionarAsync(produto);

                // Retorna 201 Created com a rota para obter o produto criado.
                return CreatedAtAction(nameof(ObterPorId), new { id }, produto);
            }
            catch (ArgumentException ex)
            {
                // Validação de entrada falhou, devolve 400 Bad Request.
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] Produto produto)
        {
            try
            {
                produto.CodProduto = id; // Garante que o ID da rota e do corpo sejam os mesmos.
                var atualizado = await _produtoService.AtualizarAsync(produto);

                if (!atualizado)
                    return NotFound(new { mensagem = $"Produto com ID {id} não encontrado." });

                return Ok(produto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Remover(int id)
        {
            try
            {
                var removido = await _produtoService.RemoverAsync(id);

                if (!removido)
                    return NotFound(new { mensagem = $"Produto com ID {id} não encontrado." });

                return Ok(new { mensagem = $"Produto com ID {id} removido com sucesso." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
        }
    }
}