// ============================================================
// CONTROLLER DE PRODUTOS - Recebe requisições HTTP sobre Produtos
// ============================================================
// Um Controller é como um "recepcionista" que:
// 1. Recebe requisição HTTP (GET, POST, PUT, DELETE)
// 2. Chama serviço apropriado para processar
// 3. Retorna resposta HTTP
//
// Fluxo: Usuário clica botão → Frontend envia HTTP → Este controller recebe → Chama service → Retorna JSON

// Importa o atributo [Authorize] (apenas usuários autenticados)
using Microsoft.AspNetCore.Authorization;

// Importa classes base para criar controllers
using Microsoft.AspNetCore.Mvc;

// Importa DTOs (objetos para transferência de dados)
using PcInventory.DTOs;

// Importa interfaces (contratos de métodos)
using PcInventory.Interfaces;

// Importa modelos (estruturas de dados)
using PcInventory.Models;

// Organiza o código em namespace (endereço do código)
namespace PcInventory.Controllers
{
    // ============================================================
    // ATRIBUTOS DO CONTROLLER - Configurações
    // ============================================================

    // [ApiController] = "Isso é um API Controller"
    // Habilita validação automática, binding automático, etc
    [ApiController]

    // [Route("api/produtos")] = "As rotas desse controller começam com /api/produtos"
    // Exemplos:
    // GET /api/produtos = lista
    // GET /api/produtos/5 = detalhe do 5
    // POST /api/produtos = criar novo
    // PUT /api/produtos/5 = atualizar o 5
    // DELETE /api/produtos/5 = deletar o 5
    [Route("api/produtos")]

    // [Authorize] = "Apenas usuários autenticados (com token JWT válido) podem acessar"
    // Se não tiver token, retorna 401 Unauthorized
    [Authorize]

    // ============================================================
    // DECLARAÇÃO DA CLASSE
    // ============================================================
    // public class ProdutoController : ControllerBase
    // : ControllerBase = herda de ControllerBase (base para controllers de API)
    // Dá acesso a Ok(), NotFound(), BadRequest(), etc
    public class ProdutoController : ControllerBase
    {
        // ============================================================
        // CAMPO PRIVADO - Dependência Injetada
        // ============================================================
        // readonly = não pode ser mudado após inicializar
        // IProdutoService = interface (contrato) do serviço de produtos
        // Usamos interface (não implementação) para flexibilidade
        private readonly IProdutoService _produtoService;

        // ============================================================
        // CONSTRUTOR - Inicializa o controller
        // ============================================================
        // Construtor recebe IProdutoService como parâmetro
        // Isso é "injeção de dependência" (dependency injection)
        // O container (Program.cs) fornece automaticamente
        public ProdutoController(IProdutoService produtoService)
        {
            // Guarda referência do serviço para usar em outros métodos
            _produtoService = produtoService;
        }

        // ============================================================
        // ENDPOINT 1: GET /api/produtos - LISTAR TODOS COM PAGINAÇÃO
        // ============================================================
        // [HttpGet] = responde a requisições GET
        // Sem especificar rota = usa a do controller (/api/produtos)
        [HttpGet]

        // Método assíncrono que retorna IActionResult
        // IActionResult = qualquer resposta HTTP (Ok, NotFound, BadRequest, etc)
        // async Task = pode esperar operações sem travar
        public async Task<IActionResult> ObterTodos(
            // pagina = página atual (default = 1)
            // ? = parâmetro opcional vem da query string
            // /api/produtos?pagina=2&tamanho=5
            int pagina = 1,

            // tamanho = quantos itens por página (default = 10)
            int tamanho = 10
        )
        {
            // ========== VALIDAÇÃO ==========
            // Garante que página é válida (não pode ser < 1)
            // Se usuário enviar pagina=0, corrige para 1
            if (pagina < 1) pagina = 1;

            // Garante que tamanho é válido (não pode ser < 1)
            if (tamanho < 1) tamanho = 10;

            // ========== BUSCAR DADOS ==========
            // Chama o serviço para obter TODOS os produtos
            // await = espera a resposta (assíncrono)
            // .ToList() = converte para List (para contar total)
            var todosProdutos = (await _produtoService.ObterTodosAsync()).ToList();

            // Conta quantos produtos existem no total
            var totalItens = todosProdutos.Count;

            // Calcula quantas páginas vão ser necessárias
            // Exemplo: 25 produtos, 10 por página = 3 páginas
            // Math.Ceiling = arredonda para cima (2.5 → 3)
            var totalPaginas = (int)Math.Ceiling(totalItens / (double)tamanho);

            // ========== PAGINAÇÃO ==========
            // Calcula o índice inicial (offset)
            // Página 1: offset = (1-1) * 10 = 0 (começa no 0)
            // Página 2: offset = (2-1) * 10 = 10 (começa no 10)
            // Página 3: offset = (3-1) * 10 = 20 (começa no 20)
            var offset = (pagina - 1) * tamanho;

            // Pega os produtos dessa página
            var produtosPaginados = todosProdutos
                .Skip(offset)      // Pula os primeiros "offset" itens
                .Take(tamanho)     // Pega apenas "tamanho" itens
                .ToList();         // Converte para list

            // ========== MONTAR RESPOSTA ==========
            // Cria objeto de resposta com paginação
            var resposta = new PaginatedResponse<Produto>
            {
                // Lista de produtos dessa página
                Data = produtosPaginados,

                // Total de páginas
                TotalPaginas = totalPaginas,

                // Página atual
                PaginaAtual = pagina,

                // Total de produtos
                TotalItens = totalItens
            };

            // ========== RETORNAR ==========
            // Ok(resposta) = retorna HTTP 200 OK com JSON
            // Resultado:
            // {
            //   "data": [...],
            //   "totalPaginas": 3,
            //   "paginaAtual": 1,
            //   "totalItens": 25
            // }
            return Ok(resposta);
        }

        // ============================================================
        // ENDPOINT 2: GET /api/produtos/{id} - OBTER UM PRODUTO
        // ============================================================
        // [HttpGet("{id}")] = responde a GET com parâmetro na rota
        // /api/produtos/5 → id = 5
        // /api/produtos/42 → id = 42
        [HttpGet("{id}")]

        // Método para buscar um produto específico pelo ID
        public async Task<IActionResult> ObterPorId(int id)
        {
            // Chama serviço para buscar produto com esse ID
            var produto = await _produtoService.ObterPorIdAsync(id);

            // Se não encontrou (produto == null)
            if (produto == null)
                // Retorna HTTP 404 Not Found com mensagem de erro
                // new { mensagem = "..." } = cria objeto JSON anonimamente
                return NotFound(new { mensagem = $"Produto com ID {id} não encontrado." });

            // Se encontrou
            // Retorna HTTP 200 OK com o produto em JSON
            return Ok(produto);
        }

        // ============================================================
        // ENDPOINT 3: POST /api/produtos - CRIAR NOVO PRODUTO
        // ============================================================
        // [HttpPost] = responde a requisições POST
        // POST = enviar dados para criar algo novo
        [HttpPost]

        // Método para criar novo produto
        public async Task<IActionResult> Adicionar(
            // [FromBody] = "pegue os dados do corpo da requisição"
            // O JSON será convertido para objeto Produto
            // Exemplo de entrada:
            // {
            //   "nome": "Monitor",
            //   "preco": 500,
            //   "estoque": 10,
            //   "foto": "data:image/png;base64,..."
            // }
            [FromBody] Produto produto
        )
        {
            // try = "tente fazer isso"
            // Se der erro, vai pro catch
            try
            {
                // Chama serviço para adicionar o produto
                // Retorna o ID do novo produto
                var id = await _produtoService.AdicionarAsync(produto);

                // CreatedAtAction = retorna HTTP 201 Created
                // nameof(ObterPorId) = nome do método que retorna o item criado
                // new { id } = parâmetros para chamar ObterPorId
                // produto = objeto criado (retorna no corpo)
                //
                // Resultado:
                // HTTP 201 Created
                // Location: /api/produtos/15
                // Body: { codProduto: 15, nome: "Monitor", ... }
                return CreatedAtAction(nameof(ObterPorId), new { id }, produto);
            }
            catch (ArgumentException ex)
            {
                // Se serviço lançar ArgumentException (dados inválidos)
                // Retorna HTTP 400 Bad Request com mensagem de erro
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // ============================================================
        // ENDPOINT 4: PUT /api/produtos/{id} - ATUALIZAR PRODUTO
        // ============================================================
        // [HttpPut("{id}")] = responde a PUT com parâmetro
        // PUT = atualizar algo existente
        // /api/produtos/5 → atualiza o 5
        [HttpPut("{id}")]

        // Método para atualizar um produto existente
        public async Task<IActionResult> Atualizar(
            // ID vem da rota (/api/produtos/5)
            int id,

            // [FromBody] = dados novos vêm do corpo JSON
            [FromBody] Produto produto
        )
        {
            try
            {
                // Garante que o ID do produto é o mesmo da rota
                // Previne confusão: PUT /api/produtos/5 com body id=10
                produto.CodProduto = id;

                // Chama serviço para atualizar
                // Retorna true se atualizou, false se não encontrou
                var atualizado = await _produtoService.AtualizarAsync(produto);

                // Se não encontrou o produto
                if (!atualizado)
                    // Retorna HTTP 404 Not Found
                    return NotFound(new { mensagem = $"Produto com ID {id} não encontrado." });

                // Se atualizou com sucesso
                // Retorna HTTP 200 OK com o produto atualizado
                return Ok(produto);
            }
            catch (ArgumentException ex)
            {
                // Dados inválidos
                return BadRequest(new { mensagem = ex.Message });
            }
        }

        // ============================================================
        // ENDPOINT 5: DELETE /api/produtos/{id} - DELETAR PRODUTO
        // ============================================================
        // [HttpDelete("{id}")] = responde a DELETE com parâmetro
        // DELETE = remover algo
        // /api/produtos/5 → deleta o 5
        [HttpDelete("{id}")]

        // Método para deletar um produto
        public async Task<IActionResult> Remover(int id)
        {
            try
            {
                // Chama serviço para remover
                // Retorna true se removeu, false se não encontrou
                var removido = await _produtoService.RemoverAsync(id);

                // Se não encontrou
                if (!removido)
                    // Retorna HTTP 404 Not Found
                    return NotFound(new { mensagem = $"Produto com ID {id} não encontrado." });

                // Se removeu com sucesso
                // Retorna HTTP 200 OK com mensagem de confirmação
                return Ok(new { mensagem = $"Produto com ID {id} removido com sucesso." });
            }
            catch (ArgumentException ex)
            {
                // Erro ao remover
                return BadRequest(new { mensagem = ex.Message });
            }
        }
    }
}