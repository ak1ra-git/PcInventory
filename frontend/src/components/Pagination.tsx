// ============================================================
// PAGINAÇÃO - NAVEGAR ENTRE PÁGINAS DE RESULTADOS
// ============================================================
// Componente que mostra: [← Anterior] [1] [2] [3] [Próximo →]
// Usado para navegar em listas grandes (Produtos, Clientes, etc)
//
// Exemplo de uso:
// <Pagination
//   currentPage={page}
//   totalPages={10}
//   onPageChange={(newPage) => setPage(newPage)}
//   isLoading={isLoading}
// />
"use client";

// ============================================================
// INTERFACE - Define props que Pagination aceita
// ============================================================
interface PaginationProps {
  // currentPage: number;
  // Página atual que está sendo exibida
  // Exemplo: 1, 2, 3, ..., totalPages
  currentPage: number;

  // totalPages: number;
  // Número total de páginas
  // Calculado no backend: Math.Ceiling(totalItens / itensPorPagina)
  // Exemplo: se temos 250 produtos e mostra 10 por página = 25 páginas
  totalPages: number;

  // onPageChange: (page: number) => void;
  // Função chamada quando usuário clica em um botão
  // Recebe o número da nova página
  // Exemplo: onPageChange={async (p) => {
  //   const data = await fetch(`/api/produtos?page=${p}`)
  //   setProducts(data)
  // }}
  onPageChange: (page: number) => void;

  // isLoading: boolean;
  // true = está carregando dados (desabilita botões)
  // false = carregamento completo (botões habilitados)
  // Evita que usuário clique 100x enquanto carrega
  isLoading: boolean;
}

// ============================================================
// COMPONENTE PAGINATION
// ============================================================
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: PaginationProps) {
  // ========== RENDERIZAÇÃO CONDICIONAL ==========
  // if (totalPages <= 1) return null;
  // Se tem 1 página ou menos, não mostra paginação
  // Por quê?
  // - Com 1 página, não há outras páginas para navegar
  // - Mostrar paginação seria confuso (só o botão "1" ativo)
  // - Espaço economizado
  if (totalPages <= 1) return null;

  return (
    // ========== CONTAINER PAGINAÇÃO ==========
    // <div className="flex justify-center items-center gap-2 mt-8">
    // - flex = layout flexbox (alinha horizontalmente)
    // - justify-center = centraliza horizontalmente
    // - items-center = alinha verticalmente no meio
    // - gap-2 = espaço entre botões
    // - mt-8 = margem superior (espaço com conteúdo acima)
    <div className="flex justify-center items-center gap-2 mt-8">

      // ========== BOTÃO ANTERIOR ==========
      // onClick={() => onPageChange(currentPage - 1)}
      // Clique vai para página anterior (página atual - 1)
      // Exemplo: na página 5, clique vai para página 4
      <button
        onClick={() => onPageChange(currentPage - 1)}

        // disabled={currentPage === 1 || isLoading}
        // Desabilita o botão se:
        // 1. currentPage === 1 (já está na primeira página)
        // 2. isLoading === true (dados carregando, evita requisições múltiplas)
        disabled={currentPage === 1 || isLoading}

        // Estilos:
        // - px-4 py-2 = padding horizontal e vertical
        // - bg-gray-300 = cinza claro normalmente
        // - hover:bg-gray-400 = mais escuro ao passar mouse
        // - disabled:bg-gray-200 = ainda mais claro quando desabilitado
        // - disabled:cursor-not-allowed = cursor muda para "proibido"
        // - text-gray-900 = texto cinza escuro
        // - rounded-lg = bordas arredondadas
        // - font-medium = negrito médio
        // - transition-colors = cor muda suavemente
        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 rounded-lg font-medium transition-colors"
      >
        // Texto: ← Anterior (seta esquerda + texto)
        ← Anterior
      </button>

      // ========== NÚMEROS DE PÁGINA ==========
      // Exemplo: [1] [2] [3] [4] [5]
      <div className="flex gap-1">

        // ========== CRIAR ARRAY DE NÚMEROS ==========
        // Array.from({ length: totalPages }, (_, i) => i + 1)
        // Cria array de números de 1 até totalPages
        //
        // Explicação:
        // { length: totalPages } = cria array com 5 espaços vazios (se totalPages=5)
        // (_, i) => i + 1 = mapeia índice para número (0->1, 1->2, etc)
        //
        // Resultado: [1, 2, 3, 4, 5]
        //
        // Depois .map((page) => (...)) = cria um botão para cada número
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (

          // ========== BOTÃO DE NÚMERO ==========
          // key={page} = identificador único (React precisa disso)
          // onClick={() => onPageChange(page)} = ir para página específica
          <button
            key={page}
            onClick={() => onPageChange(page)}

            // disabled={isLoading}
            // Desabilita enquanto carrega
            disabled={isLoading}

            // Estilos dinâmicos (dependem do currentPage):
            // w-10 h-10 = 40x40 pixels (quadrado)
            // rounded-lg = bordas arredondadas
            // font-medium = negrito médio
            // transition-colors = cor muda suavemente
            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
              // CONDICIONAL: página atual vs outras páginas
              currentPage === page
                // SE É PÁGINA ATUAL (número selecionado):
                ? "bg-blue-600 text-white"
                //   bg-blue-600 = fundo azul
                //   text-white = texto branco

                // SE NÃO É PÁGINA ATUAL:
                : "bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:bg-gray-200"
                //   bg-gray-200 = fundo cinza claro
                //   hover:bg-gray-300 = mais escuro ao passar mouse
                //   text-gray-900 = texto cinza escuro
                //   disabled:bg-gray-200 = fica cinza quando desabilitado
            }`}
          >
            // Mostra o número da página
            {page}
          </button>
        ))}
      </div>

      // ========== BOTÃO PRÓXIMO ==========
      // onClick={() => onPageChange(currentPage + 1)}
      // Clique vai para próxima página (página atual + 1)
      // Exemplo: na página 3, clique vai para página 4
      <button
        onClick={() => onPageChange(currentPage + 1)}

        // disabled={currentPage === totalPages || isLoading}
        // Desabilita se:
        // 1. currentPage === totalPages (já está na última página)
        // 2. isLoading === true (dados carregando)
        disabled={currentPage === totalPages || isLoading}

        // Estilos: mesmo do botão "Anterior"
        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 rounded-lg font-medium transition-colors"
      >
        // Texto: Próximo → (texto + seta direita)
        Próximo →
      </button>

      // ========== INFO DE PÁGINA ==========
      // Mostra "Página X de Y" (acessibilidade, referência)
      // ml-4 = margem esquerda (espaço com botões)
      // text-sm = fonte pequena
      // text-gray-600 = texto cinza médio
      <span className="ml-4 text-sm text-gray-600">
        // Exemplo: "Página 3 de 25"
        Página {currentPage} de {totalPages}
      </span>
    </div>
  );
}
