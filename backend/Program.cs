// ============================================================
// PROGRAMA PRINCIPAL DO BACKEND - ARQUIVO DE CONFIGURAÇÃO
// ============================================================
// Este arquivo configura TUDO que o servidor precisa para funcionar.
// É como uma lista de tarefas: "configure isso, depois aquilo, então inicie"

using System.Text; // Importa utilitários de texto (para UTF8)
using Microsoft.AspNetCore.Authentication.JwtBearer; // JWT = autenticação com tokens
using Microsoft.IdentityModel.Tokens; // Ferramentas para validar tokens
using PcInventory.Database; // Classe que conecta ao banco de dados
using PcInventory.Interfaces; // Interfaces (contratos de métodos)
using PcInventory.Repositories; // Acesso ao banco de dados
using PcInventory.Services; // Lógica de negócio
using PcInventory.Middlewares; // Processamento de requisições

// ============================================================
// 1. CRIAR O "CONSTRUTOR" DA APLICAÇÃO
// ============================================================
// WebApplication.CreateBuilder cria um objeto que vai configurar tudo
// args = argumentos da linha de comando (geralmente vazio)
var builder = WebApplication.CreateBuilder(args);

// ============================================================
// 2. DEFINIR AS URLS ONDE O SERVIDOR FICARÁ DISPONÍVEL
// ============================================================
// localhost:5000 = HTTP (inseguro, só para teste local)
// localhost:5001 = HTTPS (seguro, com certificado SSL)
builder.WebHost.UseUrls("http://localhost:5000", "https://localhost:5001");

// ============================================================
// 3. REGISTRAR CONTROLLERS
// ============================================================
// AddControllers() = "Adicionar suporte para Controllers"
// Controllers são as classes que recebem requisições HTTP
// Sem isso, o servidor não saberia como processar requisições
builder.Services.AddControllers();

// ============================================================
// 4. CONFIGURAR DOCUMENTAÇÃO AUTOMÁTICA (SWAGGER)
// ============================================================
// Swagger é uma ferramenta que gera documentação da API automaticamente
// Acessa em: https://localhost:5001/swagger
builder.Services.AddEndpointsApiExplorer(); // Descobre todos os endpoints
builder.Services.AddSwaggerGen(); // Gera o HTML do Swagger

// ============================================================
// 5. INJEÇÃO DE DEPENDÊNCIA (DEPENDENCY INJECTION)
// ============================================================
// AddScoped = Cria UMA instância para CADA requisição HTTP
// É como: "sempre que alguém pedir Produto, dê uma instância nova"
// Sem isso, diferentes requisições compartilhariam o mesmo objeto (bug!)

// Fábrica de conexão com banco de dados
builder.Services.AddScoped<ConnectionFactory>();
// Quando alguém pedir ConnectionFactory, cria novo e dá

// PRODUTOS
builder.Services.AddScoped<IProdutoRepository, ProdutoRepository>();
// Interface IProdutoRepository → Implementação ProdutoRepository
builder.Services.AddScoped<IProdutoService, ProdutoService>();
// Serviço de lógica de produtos

// CLIENTES
builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<IClienteService, ClienteService>();

// PEDIDOS
builder.Services.AddScoped<IPedidoRepository, PedidoRepository>();
builder.Services.AddScoped<IPedidoService, PedidoService>();

// ITENS DO PEDIDO (produtos dentro de um pedido)
builder.Services.AddScoped<IItensPedidoRepository, ItensPedidoRepository>();
builder.Services.AddScoped<IItensPedidoService, ItensPedidoService>();

// AUTENTICAÇÃO
builder.Services.AddScoped<UserRepository>(); // Busca usuários no banco
builder.Services.AddScoped<AuthService>(); // Lógica de login

// ============================================================
// 6. CONFIGURAR AUTENTICAÇÃO COM JWT (TOKENS)
// ============================================================
// AddAuthentication = "Adicionar suporte a autenticação"
// JwtBearer = tipo de autenticação usando JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Aqui configuramos COMO validar o token
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            // ^ Verifica se o "emissor" (quem criou o token) é válido

            ValidateAudience = true,
            // ^ Verifica se a "audiência" (para quem é o token) é válida

            ValidateLifetime = true,
            // ^ Verifica se o token NÃO expirou
            // Token JWT expira após 15 minutos, depois precisa fazer login de novo

            ValidateIssuerSigningKey = true,
            // ^ Verifica se a assinatura do token é válida (não foi alterado)

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            // ^ Emissor válido (vem do appsettings.json)

            ValidAudience = builder.Configuration["Jwt:Audience"],
            // ^ Audiência válida

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:SecretKey"]
                    ?? throw new InvalidOperationException("JWT Secret Key is not configured.")
                )
            )
            // ^ Chave secreta para validar assinatura
            // Se a chave for roubada, alguém pode criar tokens falsos!
        };
    });

// ============================================================
// 7. CONFIGURAR CORS (PERMITIR REQUISIÇÕES DO FRONTEND)
// ============================================================
// CORS = "Cross-Origin Resource Sharing"
// Sem isso, navegador bloqueia requisições para outro domínio (segurança)
// Frontend está em localhost:3000, backend em localhost:5001
// Precisa liberar explicitamente
builder.Services.AddCors(options =>
{
    // Criar uma política chamada "PermitirFrontend"
    options.AddPolicy("PermitirFrontend", policy =>
    {
        // Liberar apenas localhost:3000 (frontend Next.js)
        policy.WithOrigins("http://localhost:3000")
              // AllowAnyHeader = aceitar qualquer header (authorization, content-type, etc)
              .AllowAnyHeader()
              // AllowAnyMethod = aceitar qualquer método HTTP (GET, POST, PUT, DELETE, etc)
              .AllowAnyMethod();
    });
});

// ============================================================
// 8. CONSTRUIR A APLICAÇÃO
// ============================================================
// Até agora era configuração
// builder.Build() = "ok, tá configurado, agora constrói o app"
var app = builder.Build();

// ============================================================
// 9. ATIVAR SWAGGER (DOCUMENTAÇÃO)
// ============================================================
// Ativa a interface do Swagger
// Acesse: https://localhost:5001/swagger
app.UseSwagger(); // Gera os dados JSON
app.UseSwaggerUI(); // Cria a página HTML bonitinha

// ============================================================
// 10. REDIRECIONAR HTTP PARA HTTPS
// ============================================================
// Se alguém tentar acessar http://localhost:5000
// Será redirecionado para https://localhost:5001
// Segurança: HTTPS encripta os dados
app.UseHttpsRedirection();

// ============================================================
// 11. APLICAR POLÍTICA DE CORS
// ============================================================
// Ativa a política "PermitirFrontend" que criamos
// Agora frontend pode fazer requisições ao backend
app.UseCors("PermitirFrontend");

// ============================================================
// 12. MIDDLEWARE DE AUTENTICAÇÃO E AUTORIZAÇÃO
// ============================================================
// UseAuthentication = "Verificar se o token é válido"
// UseAuthorization = "Verificar se o usuário tem permissão"
app.UseAuthentication();
app.UseAuthorization();

// ============================================================
// 13. REGISTRAR OS CONTROLLERS COMO ROTAS
// ============================================================
// MapControllers = "Use os Controllers que registrei antes"
// Sem isso, as rotas não funcionariam
app.MapControllers();

// ============================================================
// 14. MIDDLEWARE DE EXCEÇÃO GLOBAL
// ============================================================
// Se algo der erro em qualquer lugar, este middleware captura
// e retorna um JSON com erro ao invés de quebrar o servidor
app.UseMiddleware<ExceptionMiddleware>();

// ============================================================
// 15. INICIAR O SERVIDOR
// ============================================================
// app.Run() = "Pronto! Agora escuta requisições HTTP"
// Código fica aqui esperando requisições até você parar (Ctrl+C)
app.Run();