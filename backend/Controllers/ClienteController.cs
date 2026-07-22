// ============================================================
// IMPORTAÇÕES
// ============================================================
// Microsoft.AspNetCore.Authorization = atributos [Authorize]
// Protege endpoints verificando se usuário tem token JWT válido
using Microsoft.AspNetCore.Authorization;

// Microsoft.AspNetCore.Mvc = classes base de controllers
using Microsoft.AspNetCore.Mvc;

// Microsoft.Data.SqlClient = exceções do SQL Server
// Usado para tratar erros de constraint (CNPJ duplicado)
using Microsoft.Data.SqlClient;

// DTOs = classes de request/response
using PcInventory.DTOs;

// Interfaces de serviços
using PcInventory.Interfaces;

// Models = classes de dados
using PcInventory.Models;

// ============================================================
// NAMESPACE
// ============================================================
namespace PcInventory.Controllers
{
    // ============================================================
    // CLASSE ClienteController
    // ============================================================
    // Endpoints para gerenciar clientes
    // CRUD: Create, Read, Update, Delete
    //
    // Endpoints:
    // GET    /api/clientes?pagina=1&tamanho=10    - Lista clientes
    // GET    /api/clientes/{id}                    - Busca cliente
    // POST   /api/clientes                         - Cria cliente
    // PUT    /api/clientes/{id}                    - Atualiza cliente
    // DELETE /api/clientes/{id}                    - Deleta cliente

    // [ApiController] = ativa validação automática e error handling
    [ApiController]

    // [Route("api/clientes")] = prefixo da rota
    // Todos endpoints começam com /api/clientes
    [Route("api/clientes")]

    // [Authorize] = TODOS os endpoints requerem JWT válido
    // Se token ausente ou expirado -> 401 Unauthorized
    // Protege dados de clientes de acesso não autorizado
    [Authorize]

    public class ClienteController : ControllerBase
    {
        // ============================================================
        // DEPENDÊNCIA INJETADA
        // ============================================================
        // private readonly IClienteService _clienteService;
        // IClienteService = interface de serviço
        // Contém lógica de negócio (validação, operações BD)
        private readonly IClienteService _clienteService;

        // ============================================================
        // CONSTRUTOR - Dependency Injection
        // ============================================================
        public ClienteController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        // ============================================================
        // ENDPOINT 1 - GET /api/clientes (lista com paginação)
        // ============================================================
        // Retorna lista de clientes com paginação
        // Query params: pagina=1, tamanho=10 (opcionais, têm defaults)
        //
        // Exemplo de request:
        // GET /api/clientes?pagina=1&tamanho=10
        //
        // Exemplo de response:
        // {
        //   "data": [{ "codCliente": 1, "nome": "Empresa A", ... }, ...],
        //   "totalPaginas": 5,
        //   "paginaAtual": 1,
        //   "totalItens": 50
        // }
        [HttpGet]
        public async Task<IActionResult> ObterTodos(int pagina = 1, int tamanho = 10)
        {
            // ========== VALIDAÇÃO DE PARÂMETROS ==========
            // Se pagina < 1 -> força para 1
            // Se tamanho < 1 -> força para 10
            // Evita valores inválidos (0, -1, etc)
            if (pagina < 1) pagina = 1;
            if (tamanho < 1) tamanho = 10;

            // ========== BUSCAR TODOS OS CLIENTES ==========
            // ObterTodosAsync() retorna IEnumerable<Cliente>
            // .ToList() converte em List (permite Skip/Take)
            var todosClientes = (await _clienteService.ObterTodosAsync()).ToList();

            // ========== CALCULAR PAGINAÇÃO ==========
            // totalItens = quantidade total no banco
            // totalPaginas = quantas páginas necessárias
            // Math.Ceiling arredonda para cima
            // Exemplo: 50 itens com tamanho 10 = 5 páginas
            var totalItens = todosClientes.Count;
            var totalPaginas = (int)Math.Ceiling(totalItens / (double)tamanho);

            // ========== CALCULAR OFFSET E PEGAR PÁGINA ==========
            // offset = (página - 1) * tamanho
            // Exemplo: página 2, tamanho 10 -> offset = 10
            // .Skip(10) pula os 10 primeiros
            // .Take(10) pega os próximos 10
            var offset = (pagina - 1) * tamanho;
            var clientesPaginados = todosClientes
                .Skip(offset)
                .Take(tamanho)
                .ToList();

            // ========== MONTAR RESPOSTA ==========
            // PaginatedResponse = classe que encapsula dados + metadados
            var resposta = new PaginatedResponse<Cliente>
            {
                Data = clientesPaginados,           // Array de clientes desta página
                TotalPaginas = totalPaginas,        // Quantas páginas tem ao total
                PaginaAtual = pagina,               // Página atual
                TotalItens = totalItens             // Total de clientes
            };

            // Ok = HTTP 200 com resposta JSON
            return Ok(resposta);
        }

        // ============================================================
        // ENDPOINT 2 - GET /api/clientes/{id} (busca um cliente)
        // ============================================================
        // Retorna um cliente específico pelo ID
        //
        // Exemplo:
        // GET /api/clientes/5
        // Response: { "codCliente": 5, "nome": "Empresa Tech", ... }
        [HttpGet("{id}")]
        public async Task<IActionResult> ObterPorId(int id)
        {
            // ========== BUSCAR CLIENTE ==========
            // Faz query no banco por ID
            var cliente = await _clienteService.ObterPorIdAsync(id);

            // ========== VALIDAR RESULTADO ==========
            // Se não encontrou -> null
            if (cliente == null)
                // NotFound = HTTP 404
                // Avisa ao cliente que recurso não existe
                return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });

            // ========== SUCESSO ==========
            // Ok = HTTP 200 com cliente
            return Ok(cliente);
        }

        // ============================================================
        // ENDPOINT 3 - POST /api/clientes (criar cliente)
        // ============================================================
        // Cria um novo cliente no banco
        //
        // Exemplo de request:
        // POST /api/clientes
        // Body: {
        //   "cnpj": "12.345.678/0001-90",
        //   "nome": "Empresa Nova LTDA",
        //   "email": "contato@empresa.com"
        // }
        //
        // Response: HTTP 201 Created (com Location header)
        [HttpPost]
        public async Task<IActionResult> Adicionar([FromBody] Cliente cliente)
        {
            try
            {
                // ========== CRIAR CLIENTE ==========
                // AdicionarAsync retorna o ID do cliente criado
                var id = await _clienteService.AdicionarAsync(cliente);

                // ========== RESPOSTA SUCESSO ==========
                // CreatedAtAction = HTTP 201 Created
                // Inclui header Location: /api/clientes/5 (novo recurso)
                // nameof(ObterPorId) = pega nome do método para montar URL
                return CreatedAtAction(nameof(ObterPorId), new { id }, cliente);
            }
            catch (ArgumentException ex)
            {
                // ========== VALIDAÇÃO FALHOU ==========
                // ArgumentException = erro de validação do serviço
                // Exemplo: email inválido, CNPJ vazio
                // BadRequest = HTTP 400 (dados inválidos)
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601)
            {
                // ========== CONSTRAINT VIOLADA ==========
                // SqlException com número 2627 ou 2601 = violação de chave única
                // 2627 = UNIQUE constraint
                // 2601 = PRIMARY KEY constraint
                // Causa comum: CNPJ duplicado
                // Conflict = HTTP 409 (conflito com recurso existente)
                return Conflict(new { mensagem = "Já existe um cliente cadastrado com esse CNPJ." });
            }
        }

        // ============================================================
        // ENDPOINT 4 - PUT /api/clientes/{id} (atualizar cliente)
        // ============================================================
        // Atualiza um cliente existente
        // ID na URL deve corresponder ao ID no corpo
        //
        // Exemplo:
        // PUT /api/clientes/5
        // Body: { "codCliente": 5, "nome": "Nova Empresa", ... }
        //
        // Response: HTTP 204 No Content (sem body)
        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, [FromBody] Cliente cliente)
        {
            // ========== VALIDAÇÃO: ID CORRESPONDE ==========
            // ID da URL (id) deve ser igual ao ID do cliente no body
            // Evita que cliente mude ID de outro cliente
            // Exemplo:
            // PUT /api/clientes/5 com body { "codCliente": 10, ... } -> erro
            if (id != cliente.CodCliente)
                // BadRequest = HTTP 400 (inconsistência nos dados)
                return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID do cliente." });

            try
            {
                // ========== ATUALIZAR ==========
                // AtualizarAsync retorna true se sucesso, false se não encontrou
                var atualizado = await _clienteService.AtualizarAsync(cliente);

                // ========== VALIDAR RESULTADO ==========
                // Se false, cliente com este ID não existe
                if (!atualizado)
                    // NotFound = HTTP 404
                    return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });

                // ========== SUCESSO ==========
                // NoContent = HTTP 204 (sucesso, sem retornar conteúdo)
                // Padrão para PUT
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                // ========== VALIDAÇÃO ==========
                // BadRequest = HTTP 400 (dados inválidos)
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (SqlException ex) when (ex.Number == 2627 || ex.Number == 2601)
            {
                // ========== CNPJ DUPLICADO ==========
                // Conflict = HTTP 409
                return Conflict(new { mensagem = "Já existe um cliente cadastrado com esse CNPJ." });
            }
        }

        // ============================================================
        // ENDPOINT 5 - DELETE /api/clientes/{id} (deletar cliente)
        // ============================================================
        // Deleta um cliente do banco
        //
        // Exemplo:
        // DELETE /api/clientes/5
        //
        // Response: HTTP 204 No Content (sem body)
        //
        // CUIDADO: Esta ação é destrutiva!
        // Cliente pode ter pedidos relacionados
        // Serviço deve validar antes de deletar
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletar(int id)
        {
            try
            {
                // ========== DELETAR ==========
                // DeletarAsync retorna true se sucesso, false se não encontrou
                var deletado = await _clienteService.DeletarAsync(id);

                // ========== VALIDAR RESULTADO ==========
                // Se false, cliente com este ID não existe
                if (!deletado)
                    // NotFound = HTTP 404
                    return NotFound(new { mensagem = $"Cliente com ID {id} não encontrado." });

                // ========== SUCESSO ==========
                // NoContent = HTTP 204 (deletado com sucesso, sem retornar conteúdo)
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                // ========== VALIDAÇÃO ==========
                // Exemplo: cliente tem pedidos vinculados
                // Serviço lança ArgumentException
                // BadRequest = HTTP 400
                return BadRequest(new { mensagem = ex.Message });
            }
        }
    }
}