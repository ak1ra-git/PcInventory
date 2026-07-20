/**
 * Tipos TypeScript do projeto
 * Sincronizados com o backend
 */

export interface Produto {
  codProduto: number;
  nome: string;
  preco: number;
  estoque: number;
  foto?: string; // Base64 ou URL da imagem
}

export interface Cliente {
  codCliente: number;
  cnpj: string;
  nome: string;
  email: string;
  dataCadastro: string;
}

export interface Pedido {
  codPedido: number;
  codCliente: number;
  dataPedido: string;
  valorTotal: number;
}

export interface ItemPedido {
  codProduto: number;
  quantidade: number;
  precoUnitario: number;
  codPedido: number;
  nomeProduto?: string;
}

export interface ItemCarrinho {
  codProduto: number;
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagina: number;
  tamanhoPagina: number;
  totalItens: number;
  totalPaginas: number;
}
