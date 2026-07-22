// ============================================================
// PEDIDO CARD - COMPONENTE PARA EXIBIR PEDIDO
// ============================================================
// Card visual que mostra informações resumidas de um pedido
// Usado em: página home (/), listagens de pedidos
//
// Informações exibidas:
// - Número do pedido (ID)
// - Valor total em BRL
// - Nome do cliente
// - Data e hora
//
// Funcionalidades:
// - Clique no card navega para /pedidos/{id}
// - Botão delete aparece ao passar mouse
// - Efeitos de hover (shadow, escala)
"use client";

// ============================================================
// IMPORTAÇÕES
// ============================================================
// Tipo do pedido do projeto
import { Pedido } from "@/lib/types";

// Link do Next.js (navegação sem recarregar)
import Link from "next/link";

// ============================================================
// INTERFACE - Props do componente
// ============================================================
interface PedidoCardProps {
  // pedido: Pedido & { clienteNome?, clienteCnpj? }
  // Pedido = dados do pedido do banco
  // & = intersection type (combina dois tipos)
  // { clienteNome?, clienteCnpj? } = adiciona propriedades opcionais
  //
  // Por quê dessa forma?
  // - Banco retorna: { codPedido, dataPedido, valorTotal, codCliente }
  // - Component recebe: { ..., clienteNome: "Empresa A" }
  // - clienteNome é calculado no componente pai (page.tsx)
  pedido: Pedido & { clienteNome?: string; clienteCnpj?: string };

  // onDelete?: (codPedido: number) => void;
  // ? = opcional
  // Callback chamado ao deletar pedido
  // Exemplo: onDelete={(id) => { console.log("deletar", id) }}
  // Se não passar, botão delete não aparece
  onDelete?: (codPedido: number) => void;

  // isDeleting?: boolean;
  // ? = opcional
  // true = pedido está sendo deletado agora
  // false = pedido está pronto
  // Usado para desabilitar botão enquanto processa
  isDeleting?: boolean;
}

// ============================================================
// COMPONENTE PEDIDO CARD
// ============================================================
export default function PedidoCard({ pedido, onDelete, isDeleting }: PedidoCardProps) {
  // ========== FORMATAR DATA ==========
  // Converte "2026-07-22T14:30:00" para "22/07/2026 14:30"
  // toLocaleDateString = formata data localmente
  // "pt-BR" = português Brasil
  // Opções: day, month, year, hour, minute
  const data = new Date(pedido.dataPedido).toLocaleDateString("pt-BR", {
    day: "2-digit",        // 22
    month: "2-digit",      // 07
    year: "numeric",       // 2026
    hour: "2-digit",       // 14
    minute: "2-digit",     // 30
  });

  // ========== HANDLER - DELETAR PEDIDO ==========
  // Chamado ao clicar botão delete
  const handleDelete = (e: React.MouseEvent) => {
    // e.preventDefault() = evita default de clique
    // Sem isso, navegaria para /pedidos/{id} ao clicar delete
    e.preventDefault();

    // onDelete?.(pedido.codPedido)
    // ?. = optional chaining (chama só se onDelete existe)
    // Passa ID do pedido ao callback
    onDelete?.(pedido.codPedido);
  };

  // ========== RENDERIZAR CARD ==========
  return (
    // ========== LINK - Navegação ao clicar ==========
    // <Link href={`/pedidos/${pedido.codPedido}`}>
    // Clique em qualquer lugar do card navega para página do pedido
    // Template string: /pedidos/5 (exemplo com ID 5)
    <Link href={`/pedidos/${pedido.codPedido}`}>

      // ========== CONTAINER CARD ==========
      // bg-white = fundo branco
      // border-l-4 border-blue-500 = borda azul grossa na esquerda
      // rounded-lg = bordas arredondadas
      // shadow = sombra leve
      // hover:shadow-lg = sombra maior ao passar mouse
      // transition-all duration-300 = todas propriedades animam em 300ms
      // hover:scale-[1.02] = cresce 2% ao passar mouse
      // cursor-pointer = cursor de mão (clickable)
      // overflow-hidden = esconde conteúdo que sai da borda
      // group = classe de referência para hover effects
      <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden group">

        // ========== PADDING INTERNO ==========
        <div className="p-5">

          // ========== BOTÃO DELETE ==========
          // {onDelete && (...)} = renderiza só se onDelete passou
          // Se usuário não tem permissão de deletar, botão não aparece
          {onDelete && (
            <button
              // onClick={handleDelete} = executa handleDelete ao clicar
              onClick={handleDelete}

              // disabled={isDeleting}
              // true = enquanto processa (muda estilo, cursor not-allowed)
              disabled={isDeleting}

              // Estilos:
              // absolute top-2 right-2 = canto superior direito
              // p-2 = padding
              // rounded-lg = bordas arredondadas
              // bg-red-100 = fundo vermelho bem claro
              // hover:bg-red-200 = mais escuro ao passar mouse
              // disabled:bg-gray-200 = cinza quando desabilitado
              // text-red-600 = texto vermelho
              // hover:text-red-700 = mais escuro ao passar mouse
              // disabled:text-gray-400 = cinza quando desabilitado
              // transition-colors = cor muda suavemente
              // opacity-0 = invisível normalmente
              // group-hover:opacity-100 = visível ao passar mouse no card
              className="absolute top-2 right-2 p-2 rounded-lg bg-red-100 hover:bg-red-200 disabled:bg-gray-200 text-red-600 hover:text-red-700 disabled:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"

              // title = tooltip ao passar mouse
              title="Deletar pedido"
            >
              // Ícone de close (✕ = X)
              ✕
            </button>
          )}

          // ========== SEÇÃO SUPERIOR - ID E VALOR ==========
          // flex justify-between items-start
          // = layout horizontal
          // = ID esquerda, valor direita
          // = alinha topo (items-start)
          <div className="flex justify-between items-start mb-3">

            // ========== ESQUERDA: ID PEDIDO ==========
            <div>
              // Label: "Pedido"
              <p className="text-sm text-black">Pedido</p>

              // Número: "#5" (exemplo)
              // text-2xl = muito grande
              // font-bold = negrito
              // text-blue-600 = azul
              <p className="text-2xl font-bold text-blue-600">#{pedido.codPedido}</p>
            </div>

            // ========== DIREITA: VALOR TOTAL ==========
            <div className="text-right">
              // Label: "Valor Total"
              <p className="text-sm text-black">Valor Total</p>

              // Valor em BRL: "R$ 1.234,56"
              // toLocaleString = formata número
              // style: "currency" = como moeda
              // currency: "BRL" = real brasileiro
              // text-2xl = muito grande
              // font-bold = negrito
              // text-green-600 = verde (valor positivo)
              <p className="text-2xl font-bold text-green-600">
                {pedido.valorTotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>

          // ========== SEÇÃO INFERIOR - CLIENTE E DATA ==========
          // border-t = borda no topo (separador)
          // pt-3 = padding superior (espaço com borda)
          // space-y-2 = espaço entre elementos (2 unidades)
          <div className="border-t pt-3 space-y-2">

            // ========== ROW 1: CLIENTE ==========
            // flex justify-between = layout horizontal, espaço entre
            <div className="flex justify-between text-sm">
              // Label
              <span className="text-black">Cliente:</span>

              // Valor
              // font-medium = semi-negrito
              // clienteNome vem do componente pai
              // || "N/A" = fallback se não tiver nome
              <span className="font-medium text-black">{pedido.clienteNome || "N/A"}</span>
            </div>

            // ========== ROW 2: DATA ==========
            // Mesmo layout que cliente
            <div className="flex justify-between text-sm">
              // Label
              <span className="text-black">Data:</span>

              // Valor: "22/07/2026 14:30" (formatada acima)
              <span className="font-medium text-black">{data}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
