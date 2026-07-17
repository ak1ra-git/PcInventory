using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using PcInventory.Database;
using PcInventory.Interfaces;
using PcInventory.Repositories;
using PcInventory.Services;
using PcInventory.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// Configura a URL da aplicação (HTTP e HTTPS)
// O app ficará disponível em localhost nas portas 5000 e 5001.
builder.WebHost.UseUrls("http://localhost:5000", "https://localhost:5001");

// Adiciona suporte a controllers no pipeline do ASP.NET Core.
builder.Services.AddControllers();

// Configura o Swagger para gerar documentação automática da API.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Injeção de Dependência: registra os serviços e repositórios usados pela aplicação.
// AddScoped cria uma instância por requisição HTTP.
builder.Services.AddScoped<ConnectionFactory>();

builder.Services.AddScoped<IProdutoRepository, ProdutoRepository>();
builder.Services.AddScoped<IProdutoService, ProdutoService>();

builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<IClienteService, ClienteService>();

builder.Services.AddScoped<IPedidoRepository, PedidoRepository>();
builder.Services.AddScoped<IPedidoService, PedidoService>();

builder.Services.AddScoped<IItensPedidoRepository, ItensPedidoRepository>();
builder.Services.AddScoped<IItensPedidoService, ItensPedidoService>();

builder.Services.AddScoped<UserRepository>();

// Registra o serviço de autenticação JWT
builder.Services.AddScoped<AuthService>();

// Configura autenticação JWT
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"]
    ?? throw new InvalidOperationException("JWT SecretKey is not configured");
var key = Encoding.ASCII.GetBytes(jwtSecretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "PcInventory",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "PcInventoryClient",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Define uma política de CORS liberando o front-end Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // porta padrão do Next.js
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Ativa o Swagger para visualização e testes locais.
app.UseSwagger();
app.UseSwaggerUI();

// Redireciona requisições HTTP para HTTPS, para segurança.
app.UseHttpsRedirection();

// Aplica a política de CORS definida anteriormente, permitindo que o front-end acesse a API.
app.UseCors("PermitirFrontend");

// Habilita autenticação JWT
app.UseAuthentication();

// Habilita a autorização
app.UseAuthorization();

// Registra os controllers como endpoints da API.
app.MapControllers();

// Registra o middleware de exceção global.
app.UseMiddleware<ExceptionMiddleware>();

// Inicia a aplicação.
app.Run();