"use client";

import { Pedido } from "@/lib/types";
import Link from "next/link";

interface PedidoCardProps {
  pedido: Pedido & { clienteNome?: string; clienteCnpj?: string };
  onDelete?: (codPedido: number) => void;
  isDeleting?: boolean;
}

/**
 * Card que exibe informações de um pedido
 */
export default function PedidoCard({ pedido, onDelete, isDeleting }: PedidoCardProps) {
  const data = new Date(pedido.dataPedido).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    onDelete?.(pedido.codPedido);
  };

  return (
    <Link href={`/pedidos/${pedido.codPedido}`}>
      <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden group">
        <div className="p-5">
          {/* Botão de deletar */}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="absolute top-2 right-2 p-2 rounded-lg bg-red-100 hover:bg-red-200 disabled:bg-gray-200 text-red-600 hover:text-red-700 disabled:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
              title="Deletar pedido"
            >
              ✕
            </button>
          )}

          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm text-black">Pedido</p>
              <p className="text-2xl font-bold text-blue-600">#{pedido.codPedido}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-black">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">
                {pedido.valorTotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-black">Cliente:</span>
              <span className="font-medium text-black">{pedido.clienteNome || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black">Data:</span>
              <span className="font-medium text-black">{data}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
