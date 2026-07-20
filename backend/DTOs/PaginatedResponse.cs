namespace PcInventory.DTOs;

/// <summary>
/// Resposta paginada genérica
/// </summary>
public class PaginatedResponse<T>
{
    public List<T> Data { get; set; } = new();
    public int TotalPaginas { get; set; }
    public int PaginaAtual { get; set; }
    public int TotalItens { get; set; }
}
