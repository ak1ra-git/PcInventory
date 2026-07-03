using System.Net;
using System.Text.Json;
using Microsoft.Data.SqlClient;

namespace PcInventory.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Deixa a requisição seguir normalmente pelo resto do pipeline
                await _next(context);
            }
            catch (Exception ex)
            {
                // Se qualquer coisa no caminho lançar exceção, cai aqui
                _logger.LogError(ex, "Erro não tratado capturado pelo middleware.");
                await TratarExcecaoAsync(context, ex);
            }
        }

        private static Task TratarExcecaoAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";

            // Decide o status HTTP e a mensagem com base no TIPO de exceção
            var (statusCode, mensagem) = ex switch
            {
                ArgumentException => (HttpStatusCode.BadRequest, ex.Message),
                InvalidOperationException => (HttpStatusCode.Conflict, ex.Message),
                KeyNotFoundException => (HttpStatusCode.NotFound, ex.Message),
                SqlException sqlEx when sqlEx.Number == 2627 || sqlEx.Number == 2601
                    => (HttpStatusCode.Conflict, "Já existe um registro com esses dados (violação de restrição única)."),
                _ => (HttpStatusCode.InternalServerError, "Ocorreu um erro inesperado. Tente novamente mais tarde.")
            };

            context.Response.StatusCode = (int)statusCode;

            var resposta = JsonSerializer.Serialize(new { mensagem });

            return context.Response.WriteAsync(resposta);
        }
    }
}