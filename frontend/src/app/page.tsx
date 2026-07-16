"use client";

import { useState, useEffect, useCallback } from "react";
import { Pedido, Cliente } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import PedidoCard from "@/components/PedidoCard";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import ProtectedRoute from "@/components/ProtectedRoute";

const API_ENDPOINTS = {
  PEDIDOS: "/pedidos?pagina=1&tamanho=50",
  CLIENTES: "/clientes?pagina=1&tamanho=100",
};

/**
 * Extrai mensagem de erro de diferentes tipos de exceção
 */
function getErrorMessage(error: unknown, defaultMessage: string): string {
  return error instanceof Error ? error.message : defaultMessage;
}

/**
 * Página inicial que lista pedidos com filtros
 */
function HomeContent() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cnpj, setCnpj] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /**
   * Recarrega apenas a lista de pedidos
   */
  const reloadPedidos = useCallback(async () => {
    try {
      const response = await apiFetch<{ data: Pedido[] }>(API_ENDPOINTS.PEDIDOS);
      setPedidos(response?.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar pedidos"));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    setLoading(true);
    setError(null);

    const fetchInitialData = async () => {
      try {
        const [pedidosRes, clientesRes] = await Promise.all([
          apiFetch<{ data: Pedido[] }>(API_ENDPOINTS.PEDIDOS),
          apiFetch<{ data: Cliente[] }>(API_ENDPOINTS.CLIENTES),
        ]);

        setPedidos(pedidosRes?.data || []);
        setClientes(clientesRes?.data || []);
      } catch (err) {
        setError(getErrorMessage(err, "Erro ao carregar dados"));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  /**
   * Encontra um cliente pelo CNPJ, considerando formatos com ou sem formatação
   */
  const findClientByCnpj = (cnpjValue: string): Cliente | undefined => {
    const unformattedCnpj = cnpjValue.replace(/\D/g, "");
    return clientes.find(
      (c) => c.cnpj === cnpjValue || c.cnpj === unformattedCnpj
    );
  };

  /**
   * Busca cliente por CNPJ e redireciona para novo pedido
   */
  const handleSearchClientByCnpj = async () => {
    if (!cnpj.trim()) {
      setError("Informe um CNPJ");
      return;
    }

    try {
      const cliente = findClientByCnpj(cnpj);
      if (cliente) {
        setIsModalOpen(false);
        window.location.href = `/pedidos/novo?clienteCnpj=${cliente.cnpj}`;
      } else {
        setError("Cliente não encontrado");
      }
    } catch {
      setError("Erro ao buscar cliente");
    }
  };

  /**
   * Deleta um pedido após confirmação do usuário
   */
  const handleDeletePedido = async (pedidoId: number) => {
    if (!confirm("Tem certeza que deseja excluir este pedido?")) return;

    try {
      setDeletingId(pedidoId);
      await apiFetch(`/pedidos/${pedidoId}`, { method: "DELETE" });
      await reloadPedidos();
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao deletar pedido"));
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Obtém nome do cliente para um pedido
   */
  const getClientName = (codCliente: number): string => {
    return clientes.find((c) => c.codCliente === codCliente)?.nome || "N/A";
  };

  /**
   * Verifica se cliente corresponde ao filtro por nome
   */
  const matchesClientFilter = (
    pedido: Pedido,
    filterText: string
  ): boolean => {
    const cliente = clientes.find((c) => c.codCliente === pedido.codCliente);
    if (!cliente) return false;
    return cliente.nome.toLowerCase().includes(filterText.toLowerCase());
  };

  /**
   * Verifica se data do pedido corresponde ao filtro
   */
  const matchesDateFilter = (pedido: Pedido, filterText: string): boolean => {
    const pedidoDate = new Date(pedido.dataPedido).toLocaleDateString("pt-BR");
    return pedidoDate.includes(filterText);
  };

  /**
   * Filtra pedidos baseado nos filtros de cliente e data
   */
  const filteredPedidos = pedidos.filter((pedido) => {
    const clientFilterMatch = !clientFilter || matchesClientFilter(pedido, clientFilter);
    const dateFilterMatch = !dateFilter || matchesDateFilter(pedido, dateFilter);
    return clientFilterMatch && dateFilterMatch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Pedidos</h1>
        <p className="text-white">Gerencie e visualize seus pedidos</p>
      </div>

      {/* Ações */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          + Novo Pedido
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-black mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cliente"
            placeholder="Nome do cliente"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          />
          <Input
            label="Data"
            placeholder="dd/mm/yyyy"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Pedidos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-black mt-4">Carregando pedidos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : filteredPedidos.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <p className="text-black">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPedidos.map((pedido) => (
            <PedidoCard
              key={pedido.codPedido}
              pedido={{ ...pedido, clienteNome: getClientName(pedido.codCliente) }}
              onDelete={handleDeletePedido}
              isDeleting={deletingId === pedido.codPedido}
            />
          ))}
        </div>
      )}

      {/* Modal - Novo Pedido */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCnpj("");
          setError(null);
        }}
        title="Novo Pedido"
      >
        <div className="space-y-4">
          <p className="text-black">
            Informe o CNPJ do cliente para criar um novo pedido
          </p>
          <Input
            label="CNPJ"
            placeholder="00000000000000"
            type="text"
            inputMode="numeric"
            value={cnpj}
            onChange={(e) => {
              const numbers = e.target.value.replace(/\D/g, "");
              setCnpj(numbers);
            }}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleSearchClientByCnpj}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Continuar
          </button>
        </div>
      </Modal>
    </div>
  );
}

/**
 * Página home protegida por autenticação
 */
export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}