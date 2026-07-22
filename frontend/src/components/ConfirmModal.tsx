// ============================================================
// CONFIRM MODAL - MODAL DE CONFIRMAÇÃO DE AÇÃO
// ============================================================
// Modal com dois botões: Cancelar e Confirmar (Deletar)
// Mostra ícone de alerta (⚠️) em amarelo
// Tem animação de fade-in e slide-up
// Desabilita botões enquanto processa ação
//
// Exemplo de uso:
// <ConfirmModal
//   isOpen={showDeleteConfirm}
//   title="Deletar Produto?"
//   message="Esta ação não pode ser desfeita"
//   onConfirm={handleDelete}
//   onCancel={() => setShowDeleteConfirm(false)}
//   isLoading={isDeleting}
// />
"use client";

// ============================================================
// INTERFACE - Define props do componente
// ============================================================
interface ConfirmModalProps {
  // isOpen: boolean;
  // true = modal visível
  // false = modal oculto
  isOpen: boolean;

  // title: string;
  // Título do modal (pergunta)
  // Exemplo: "Deletar Produto?", "Sair sem salvar?", etc
  title: string;

  // message: string;
  // Descrição/mensagem de alerta
  // Exemplo: "Esta ação não pode ser desfeita"
  message: string;

  // onConfirm: () => void;
  // Função chamada ao clicar "Deletar"
  // Exemplo: onConfirm={async () => {
  //   await fetch(`/api/produtos/${id}`, { method: 'DELETE' })
  // }}
  onConfirm: () => void;

  // onCancel: () => void;
  // Função chamada ao clicar "Cancelar" ou no fundo
  // Exemplo: onCancel={() => setShowDeleteConfirm(false)}
  onCancel: () => void;

  // isLoading?: boolean;
  // ? = opcional (default = false)
  // true = está processando ação (desabilita botões)
  // false = pronto para agir
  isLoading?: boolean;
}

// ============================================================
// COMPONENTE CONFIRM MODAL
// ============================================================
export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,  // Padrão se não passar
}: ConfirmModalProps) {

  // ========== CONDICIONAL: RENDERIZAR OU NÃO ==========
  // if (!isOpen) return null;
  // Se isOpen for false, não renderiza nada
  if (!isOpen) return null;

  return (
    // ========== CONTAINER FIXO ==========
    // fixed inset-0 = preenche a tela toda
    // z-50 = fica acima de tudo
    // flex items-center justify-center = centraliza conteúdo
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      // ========== BACKDROP (FUNDO ESCURO) ==========
      // absolute inset-0 = preenche container
      // bg-black bg-opacity-50 = preto semi-transparente
      // animate-fadeIn = anima aparecimento (opacity 0 -> 1)
      // onClick={onCancel} = clique no fundo cancela
      <div
        className="absolute inset-0 bg-black bg-opacity-50 animate-fadeIn"
        onClick={onCancel}
      />

      // ========== MODAL (CAIXA COM CONTEÚDO) ==========
      // relative = fica acima do backdrop
      // bg-white = fundo branco
      // rounded-2xl = bordas muito arredondadas
      // shadow-2xl = sombra grande (3D)
      // max-w-md = largura máxima (~448px)
      // w-full = 100% de largura (até máximo)
      // mx-4 = margem horizontal (mobile)
      // animate-slideUp = anima deslizando para cima
      // p-8 = padding (espaço interno)
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-slideUp p-8">

        // ========== ÍCONE DE ALERTA ==========
        // Círculo amarelo com ⚠️
        <div className="flex justify-center mb-4">

          // Círculo:
          // w-12 h-12 = 48x48 pixels
          // bg-yellow-100 = amarelo bem claro
          // rounded-full = círculo
          // flex items-center justify-center = centraliza ícone
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">

            // Ícone de aviso (emoji)
            // text-yellow-600 = amarelo escuro
            // text-2xl = grande
            <span className="text-yellow-600 text-2xl">⚠️</span>
          </div>
        </div>

        // ========== TÍTULO ==========
        // text-xl = fonte grande
        // font-bold = negrito
        // text-center = centralizado
        // text-gray-900 = cinza escuro
        // mb-2 = margem inferior
        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
          // {title} = "Deletar Produto?"
          {title}
        </h2>

        // ========== MENSAGEM ==========
        // text-center = centralizado
        // text-gray-600 = cinza médio
        // mb-6 = margem inferior (espaço antes botões)
        <p className="text-center text-gray-600 mb-6">{message}</p>

        // ========== CONTAINER DE BOTÕES ==========
        // flex = layout horizontal
        // gap-3 = espaço entre botões
        <div className="flex gap-3">

          // ========== BOTÃO CANCELAR ==========
          // onClick={onCancel} = fecha modal
          // disabled={isLoading} = desabilita enquanto processa
          <button
            onClick={onCancel}
            disabled={isLoading}

            // Estilos:
            // - flex-1 = ocupa 50% (split com outro botão)
            // - bg-gray-300 = cinza claro
            // - hover:bg-gray-400 = mais escuro ao passar mouse
            // - text-gray-900 = texto cinza escuro
            // - font-bold = negrito
            // - py-2 px-4 = padding
            // - rounded-lg = bordas arredondadas
            // - transition-colors = cor muda suavemente
            // - disabled:opacity-50 = 50% transparente quando desabilitado
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          // ========== BOTÃO CONFIRMAR ==========
          // onClick={onConfirm} = executa ação
          // disabled={isLoading} = desabilita enquanto processa
          <button
            onClick={onConfirm}
            disabled={isLoading}

            // Estilos:
            // - flex-1 = ocupa 50%
            // - bg-red-600 = vermelho escuro (ação destrutiva)
            // - hover:bg-red-700 = mais escuro ao passar mouse
            // - text-white = texto branco
            // - font-bold = negrito
            // - py-2 px-4 = padding
            // - rounded-lg = bordas arredondadas
            // - transition-colors = cor muda suavemente
            // - disabled:opacity-50 = 50% transparente quando desabilitado
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            // ========== TEXTO DINÂMICO ==========
            // Se loading = "Deletando..."
            // Se não loading = "Deletar"
            // Avisa usuário que está processando
            {isLoading ? "Deletando..." : "Deletar"}
          </button>
        </div>
      </div>

      // ========== ESTILOS CSS ==========
      // <style jsx> = scoped styles (só afeta este componente)
      <style jsx>{`
        // ========== ANIMAÇÃO 1: fadeIn ==========
        // Fundo aparece gradualmente
        @keyframes fadeIn {
          from {
            opacity: 0;  // Invisível
          }
          to {
            opacity: 1;  // Visível
          }
        }

        // ========== ANIMAÇÃO 2: slideUp ==========
        // Modal desliza para cima enquanto aparece
        @keyframes slideUp {
          from {
            opacity: 0;              // Invisível
            transform: translateY(20px);  // 20px abaixo
          }
          to {
            opacity: 1;              // Visível
            transform: translateY(0);    // No lugar correto
          }
        }

        // ========== APLICAR ANIMAÇÕES ==========
        // animate-fadeIn = fundo
        // animate-slideUp = modal
        :global(.animate-fadeIn) {
          animation: fadeIn 0.3s ease-out;  // 0.3s = rápido
        }

        :global(.animate-slideUp) {
          animation: slideUp 0.3s ease-out;  // ease-out = começa rápido, termina devagar
        }
      `}</style>
    </div>
  );
}
