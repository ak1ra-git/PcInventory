// ============================================================
// NAMESPACE - Organização do código
// ============================================================
// namespace = "endereço" do código
// Isso está em PcInventory.Models
// Outros arquivos usam: using PcInventory.Models;
namespace PcInventory.Models;

// ============================================================
// CLASSE MODELO - PRODUTO
// ============================================================
// Esta classe define a ESTRUTURA de um Produto
// É como um "desenho" ou "planta" do que é um produto
//
// Um produto possui:
// - ID (identificador único)
// - Nome (texto descritivo)
// - Preço (valor em reais)
// - Estoque (quantidade disponível)
// - Foto (imagem do produto em Base64)
//
// Quando dados vêm do banco de dados, são mapeados para esta classe
// Quando JSON vem do frontend, é convertido para esta classe
// É a representação em código de uma linha na tabela Produtos do banco
public class Produto
{
    // ============================================================
    // PROPRIEDADE 1: CodProduto - ID ÚNICO DO PRODUTO
    // ============================================================
    // public = qualquer um pode acessar
    // int = número inteiro (1, 2, 3, ..., 999)
    // CodProduto = nome da propriedade (PascalCase = primeira letra maiúscula)
    // { get; set; } = permite ler (get) e escrever (set)
    //
    // Exemplo:
    // var produto = new Produto();
    // produto.CodProduto = 5;  // set
    // int id = produto.CodProduto;  // get
    //
    // No banco de dados:
    // - É a chave primária (PRIMARY KEY)
    // - Auto-incremento (1, 2, 3, 4, ...)
    // - Nunca dois produtos com mesmo ID
    public int CodProduto { get; set; }

    // ============================================================
    // PROPRIEDADE 2: Nome - DESCRIÇÃO DO PRODUTO
    // ============================================================
    // string = texto ("Monitor Samsung 24\"", "Teclado Mecânico", etc)
    // = string.Empty = inicializa com string vazia ("") ao invés de null
    // Isso evita NullReferenceException (erro comum em C#)
    //
    // Exemplo:
    // var produto = new Produto();
    // produto.Nome = "Monitor Samsung";
    // MessageBox.Show(produto.Nome);  // "Monitor Samsung"
    //
    // Sem = string.Empty:
    // var produto = new Produto();
    // var comprimento = produto.Nome.Length;  // ERRO! Nome é null
    //
    // Com = string.Empty:
    // var produto = new Produto();
    // var comprimento = produto.Nome.Length;  // 0 (string vazia)
    public string Nome { get; set; } = string.Empty;

    // ============================================================
    // PROPRIEDADE 3: Preco - VALOR DO PRODUTO
    // ============================================================
    // decimal = número com casa decimal (500.50, 1.99, 0.01)
    // Melhor que float/double para dinheiro (mais precisão)
    //
    // Por que decimal e não double?
    // double: 0.1 + 0.2 = 0.30000000000000004 (ERRO!)
    // decimal: 0.1 + 0.2 = 0.3 (CORRETO!)
    //
    // Exemplo:
    // produto.Preco = 500.50M;  // M = sufixo para decimal
    // decimal total = produto.Preco * 2;  // 1001.00
    //
    // No banco de dados:
    // - Tipo DECIMAL(10,2) = até 8 dígitos + 2 casas decimais
    // - Exemplo: 99999999.99
    public decimal Preco { get; set; }

    // ============================================================
    // PROPRIEDADE 4: Estoque - QUANTIDADE DISPONÍVEL
    // ============================================================
    // int = número inteiro (não faz sentido ter 1.5 produtos!)
    // Representa quantos produtos temos no estoque
    //
    // Exemplo:
    // produto.Estoque = 50;  // Temos 50 unidades desse produto
    //
    // Lógica comum:
    // if (produto.Estoque > 0) {
    //   // Produto em estoque, pode vender
    // } else {
    //   // Produto fora de estoque
    // }
    //
    // Quando vende:
    // produto.Estoque = produto.Estoque - 1;  // Diminui 1
    public int Estoque { get; set; }

    // ============================================================
    // PROPRIEDADE 5: Foto - IMAGEM DO PRODUTO
    // ============================================================
    // string? = string NULÁVEL (pode ser null ou string)
    // O ? significa "este campo pode ser null"
    //
    // Por que nulável?
    // - Nem todo produto tem foto no início
    // - Foto é opcional
    // - null = "não tem valor" (diferente de string vazia "")
    //
    // Tipos de valores:
    // - null = sem foto
    // - "" = foto vazia (não faz sentido, evitar)
    // - "data:image/png;base64,iVBORw0KG..." = foto em Base64
    // - "https://exemplo.com/foto.jpg" = URL da foto (futuro)
    //
    // Exemplo:
    // var p1 = new Produto { Foto = null };  // Sem foto
    // var p2 = new Produto { Foto = "data:image/png;base64,..." };  // Com foto
    //
    // Verificação:
    // if (produto.Foto != null) {
    //   // Mostrar foto
    // } else {
    //   // Mostrar placeholder
    // }
    //
    // Base64 explained:
    // - Imagem binária (bytes) convertida para texto
    // - Permite guardar imagem no banco de dados
    // - Formato: "data:image/tipo;base64,conteúdo"
    // - Exemplo completo:
    //   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    public string? Foto { get; set; }
}