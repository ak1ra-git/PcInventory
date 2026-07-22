// ============================================================
// ERROR MODAL - MODAL PARA MOSTRAR MENSAGENS DE ERRO
// ============================================================
// Modal simples com fundo escuro, ícone X vermelho, e mensagem
// Usado para alertar usuário de erros (API falhou, validação, etc)
//
// Exemplo de uso:
// <ErrorModal
//   isOpen={hasError}
//   message="Erro ao salvar produto"
//   onClose={() => setHasError(false)}
// />

// ============================================================
// INTERFACE - Define props do componente
// ============================================================
interface ErrorModalProps {
  // isOpen: boolean;
  // true = modal visível
  // false = modal oculto
  isOpen: boolean;

  // message: string;
  // Mensagem de erro a exibir
  // Exemplo: "Erro ao conectar ao servidor", "Campo obrigatório"
  message: string;

  // onClose: () => void;
  // Função chamada ao clicar OK
  // Exemplo: onClose={() => setError(null)}
  onClose: () => void;
}

// ============================================================
// COMPONENTE ERROR MODAL
// ============================================================
export default function ErrorModal({
  isOpen,
  message,
  onClose,
}: ErrorModalProps) {

  // ========== CONDICIONAL: RENDERIZAR OU NÃO ==========
  // if (!isOpen) return null;
  // Se isOpen for false, não renderiza nada
  // Modal fica invisível
  if (!isOpen) return null;

  return (
    // ========== CONTAINER FIXO COM BACKDROP ==========
    // fixed inset-0 = preenche a tela toda
    // bg-black bg-opacity-50 = fundo escuro semi-transparente
    // flex items-center justify-center = centraliza conteúdo
    // z-50 = fica acima de tudo
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      // ========== MODAL (CAIXA BRANCA) ==========
      // bg-white = fundo branco
      // rounded-lg = bordas arredondadas
      // shadow-lg = sombra (efeito 3D)
      // p-8 = padding (espaço interno)
      // max-w-md = largura máxima (~448px)
      // w-full = 100% de largura
      // mx-4 = margem horizontal (mobile)
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">

        // ========== ÍCONE DE ERRO ==========
        // Círculo vermelho com X branco
        <div className="flex justify-center mb-4">

          // Círculo vermelho:
          // w-12 h-12 = 48x48 pixels
          // bg-red-100 = fundo vermelho bem claro
          // rounded-full = círculo (100% border-radius)
          // flex items-center justify-center = centraliza conteúdo
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">

            // X branco dentro do círculo
            // text-red-600 = cor vermelha
            // text-2xl = grande
            <span className="text-red-600 text-2xl">✕</span>
          </div>
        </div>

        // ========== TÍTULO "Erro" ==========
        // text-xl = fonte grande
        // font-bold = negrito
        // text-center = centralizado
        // text-gray-900 = cor cinza escura
        // mb-2 = margem inferior (espaço)
        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
          Erro
        </h2>

        // ========== MENSAGEM DE ERRO ==========
        // text-center = centralizado
        // text-gray-600 = cor cinza média
        // mb-6 = margem inferior (espaço antes botão)
        <p className="text-center text-gray-600 mb-6">{message}</p>

        // ========== BOTÃO OK ==========
        // onClick={onClose} = fecha modal ao clicar
        // w-full = 100% de largura (preenche container)
        // bg-red-600 = vermelho escuro
        // hover:bg-red-700 = mais escuro ao passar mouse
        // text-white = texto branco
        // font-bold = negrito
        // py-2 px-4 = padding
        // rounded = bordas arredondadas
        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          OK
        </button>
      </div>
    </div>
  );
}
