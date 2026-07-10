"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Pedido, ItemPedido } from "@/lib/types";
import { apiFetch } from "@/lib/api";

/**
 * Extrai mensagem de erro de diferentes tipos de exceção
 */
function getErrorMessage(error: unknown, defaultMessage: string): string {
  return error instanceof Error ? error.message : defaultMessage;
}

/**
 * Formata data para exibição em padrão pt-BR com hora
 */
function formatDateWithTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formata valor monetário para BRL
 */
function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Página de detalhes do pedido com lista de itens
 */
export default function PedidoDetailsPage() {
  const params = useParams();
  const pedidoId = params.id as string;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [items, setItems] = useState<ItemPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pedidoId) return;

    const fetchPedidoDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const [pedidoRes, itemsRes] = await Promise.all([
          apiFetch<Pedido>(`/pedidos/${pedidoId}`),
          apiFetch<{ data: ItemPedido[] }>(`/pedidos/${pedidoId}/itens`),
        ]);

        setPedido(pedidoRes);
        setItems(itemsRes?.data || []);
      } catch (err) {
        setError(getErrorMessage(err, "Erro ao carregar pedido"));
      } finally {
        setLoading(false);
      }
    };

    fetchPedidoDetails();
  }, [pedidoId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            ← Voltar
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || "Pedido não encontrado"}
        </div>
      </div>
    );
  }

  const formattedDate = formatDateWithTime(pedido.dataPedido);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Voltar */}
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-700">
          ← Voltar para pedidos
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">
          Pedido #{pedido.codPedido}
        </h1>
        <p className="text-white">{formattedDate}</p>
      </div>

      {/* Informações do Pedido */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-black mb-6">Informações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-black text-sm">Cliente ID</p>
            <p className="text-black font-bold text-lg">{pedido.codCliente}</p>
          </div>
          <div>
            <p className="text-black text-sm">Status</p>
            <p className="text-black font-bold text-lg">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Confirmado
              </span>
            </p>
          </div>
          <div>
            <p className="text-black text-sm">Data</p>
            <p className="text-black font-bold text-lg">{formattedDate}</p>
          </div>
          <div>
            <p className="text-black text-sm">Valor Total</p>
            <p className="text-green-600 font-bold text-lg">
              {formatCurrency(pedido.valorTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Itens do Pedido */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-black mb-6">Itens</h2>

        {items && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-black">
                    Produto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-black">
                    Quantidade
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-black">
                    Valor Unitário
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-black">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-black">
                      {item.nomeProduto || "Produto"}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      {item.quantidade}
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      {formatCurrency(item.precoUnitario)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">
                      {formatCurrency(item.precoUnitario * item.quantidade)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-black text-center py-8">
            Nenhum item neste pedido
          </p>
        )}

        {/* Resumo */}
        <div className="border-t mt-6 pt-6 flex justify-end">
          <div className="text-right">
            <p className="text-black mb-2">Total do Pedido</p>
            <p className="text-4xl font-bold text-green-600">
              {formatCurrency(pedido.valorTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
