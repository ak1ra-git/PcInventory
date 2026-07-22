// ============================================================
// MODAL - POPUP/JANELA FLUTUANTE REUTILIZÁVEL
// ============================================================
// Modal = "janelinha" que aparece no centro da tela
// Usada para: confirmar ação, mostrar formulário, avisos, etc
//
// Exemplo de uso:
// <Modal
//   isOpen={showDeleteConfirm}
//   onClose={() => setShowDeleteConfirm(false)}
//   title="Deletar Produto?"
// >
//   <p>Tem certeza que deseja deletar este produto?</p>
//   <button onClick={handleDelete}>Sim, deletar</button>
// </Modal>
"use client";

// ============================================================
// IMPORTAÇÕES
// ============================================================
// ReactNode = tipo TypeScript para qualquer conteúdo React
// Pode ser texto, componentes, JSX, etc
// Usado em "children" para aceitar qualquer conteúdo dentro
import { ReactNode } from "react";

// ============================================================
// INTERFACE - Define props que Modal aceita
// ============================================================
interface ModalProps {
  // isOpen: boolean;
  // true = modal visível
  // false = modal escondido (retorna null, não renderiza)
  isOpen: boolean;

  // onClose: () => void;
  // Função chamada ao fechar (clica no X, no fundo, etc)
  // void = não retorna nada
  // Exemplo: onClose={() => setIsOpen(false)}
  onClose: () => void;

  // title: string;
  // Título exibido no topo do modal
  // Exemplo: "Novo Produto", "Deletar Cliente?", etc
  title: string;

  // children: ReactNode;
  // Conteúdo dentro do modal
  // Pode ser:
  // - Texto: "Tem certeza?"
  // - JSX: <p>Mensagem</p>
  // - Componentes: <FormProduto />
  // - Tudo junto: <> <p>Msg</p> <button>OK</button> </>
  children: ReactNode;
}

// ============================================================
// COMPONENTE MODAL
// ============================================================
// Renderiza um popup no centro da tela com backdrop (fundo escuro)
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // ========== CONDICIONAL: RENDERIZAR OU NÃO ==========
  // if (!isOpen) return null;
  // Se isOpen for false, não renderiza NADA (modal invisível)
  // Se isOpen for true, renderiza o HTML abaixo
  //
  // Por quê não usar display:none?
  // return null é mais eficiente, não renderiza elementos DOM desnecessários
  if (!isOpen) return null;

  // ========== RENDERIZAR MODAL ==========
  return (
    // ========== CONTAINER FIXO ==========
    // <div className="fixed inset-0 z-50 flex items-center justify-center">
    // - fixed = posição fixa (não scroll com página)
    // - inset-0 = preenche a tela toda (top:0, right:0, bottom:0, left:0)
    // - z-50 = fica acima de tudo (50 = muito alto)
    // - flex = layout flexbox
    // - items-center = centraliza verticalmente
    // - justify-center = centraliza horizontalmente
    // Resultado: container que preenche a tela e centraliza conteúdo
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      // ========== BACKDROP (FUNDO ESCURO) ==========
      // <div className="absolute inset-0 bg-black bg-opacity-50 animate-fadeIn">
      // - absolute = posição absoluta (dentro do container fixed)
      // - inset-0 = preenche o container
      // - bg-black = fundo preto
      // - bg-opacity-50 = 50% de transparência (cinza semi-escuro)
      // - animate-fadeIn = animação que aparece suavemente
      // - onClick={onClose} = clique no fundo fecha o modal
      <div
        className="absolute inset-0 bg-black bg-opacity-50 animate-fadeIn"
        onClick={onClose}
        // Clique no fundo escuro fecha o modal
      />

      // ========== MODAL (A JANELA BRANCA) ==========
      // <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-slideUp">
      // - relative = posição relativa (fica acima do backdrop)
      // - bg-white = fundo branco
      // - rounded-2xl = bordas arredondadas bem redondas
      // - shadow-2xl = sombra grande (efeito 3D)
      // - max-w-md = largura máxima média (~448px)
      // - w-full = 100% de largura (até o máximo)
      // - mx-4 = margem horizontal (espaço nas laterais em telas pequenas)
      // - animate-slideUp = animação que desliza para cima
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-slideUp">

        // ========== HEADER (TOPO COM TÍTULO E BOTÃO X) ==========
        // <div className="flex justify-between items-center p-6 border-b border-gray-100">
        // - flex = layout flexbox
        // - justify-between = título esquerda, X direita
        // - items-center = alinha verticalmente
        // - p-6 = padding (espaço interno)
        // - border-b = borda embaixo
        // - border-gray-100 = cor cinza clara
        <div className="flex justify-between items-center p-6 border-b border-gray-100">

          // ========== TÍTULO ==========
          // <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          // - h2 = heading nível 2 (grande)
          // - text-xl = font grande
          // - font-bold = negrito
          // - text-gray-900 = cor cinza escura (quase preta)
          // - {title} = conteúdo passado via props
          // Exemplo: "Novo Produto", "Deletar Cliente?"
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>

          // ========== BOTÃO FECHAR (X) ==========
          // <button onClick={onClose} ...>
          // - onClick={onClose} = clique fecha o modal
          // - aria-label="Fechar" = acessibilidade (leitores de tela)
          <button
            onClick={onClose}
            // Estilos:
            // - text-gray-400 = cinza claro normalmente
            // - hover:text-gray-600 = mais escuro ao passar mouse
            // - transition-colors = muda cor suavemente
            // - p-1 = pequeno padding
            // - hover:bg-gray-100 = fundo cinza bem claro ao passar mouse
            // - rounded-lg = bordas um pouco arredondadas
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
            // aria-label = texto para leitores de tela (acessibilidade)
            aria-label="Fechar"
          >
            // ========== SVG: ÍCONE X ==========
            // <svg className="w-6 h-6" ...>
            // SVG = gráfico vetorial (X em vez de imagem)
            // - w-6 h-6 = 24x24 pixels
            // - fill="none" = sem preenchimento
            // - stroke="currentColor" = usa cor do texto (cinza)
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              // SVG path = desenho do X
              // d="M6 18L18 6M6 6l12 12" = duas linhas que formam X
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        // ========== CONTEÚDO (O QUE ESTÁ DENTRO) ==========
        // <div className="p-6">{children}</div>
        // - p-6 = padding (espaço interno)
        // - {children} = qualquer conteúdo passado via props
        // Exemplo:
        // <Modal ...>
        //   <p>Deletar este produto?</p>
        //   <button>Sim</button>
        // </Modal>
        // O conteúdo acima entra aqui como {children}
        <div className="p-6">{children}</div>
      </div>

      // ========== ANIMAÇÕES CSS ==========
      // <style jsx> = estilos scoped a este componente (só afeta este componente)
      <style jsx>{`
        // ANIMAÇÃO 1: fadeIn
        // Fundo aparece gradualmente (opaco de 0 a 1)
        @keyframes fadeIn {
          from {
            opacity: 0;  // Invisível
          }
          to {
            opacity: 1;  // Visível
          }
        }

        // ANIMAÇÃO 2: slideUp
        // Modal desliza para cima enquanto aparece
        @keyframes slideUp {
          from {
            opacity: 0;                // Invisível
            transform: translateY(20px);  // 20px abaixo
          }
          to {
            opacity: 1;                // Visível
            transform: translateY(0);  // No lugar correto
          }
        }

        // APLICAR ANIMAÇÕES AOS ELEMENTOS
        :global(.animate-fadeIn) {
          animation: fadeIn 0.3s ease-out;  // 0.3s = muito rápido
        }

        :global(.animate-slideUp) {
          animation: slideUp 0.3s ease-out;  // ease-out = começa rápido, termina devagar
        }
      `}</style>
    </div>
  );
}
