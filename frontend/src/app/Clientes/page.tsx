"use client";

import { useState, useEffect } from "react";
import { Cliente } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { maskCnpj } from "@/lib/masks";
import Input from "@/components/Input";
import Modal from "@/components/Modal";

const API_ENDPOINTS = {
  CLIENTES: "/clientes?pagina=1&tamanho=50",
  CLIENTES_BASE: "/clientes",
};

const FORM_INITIAL_STATE = {
  nome: "",
  cnpj: "",
  email: "",
};

/**
 * Extrai mensagem de erro de diferentes tipos de exceção
 */
function getErrorMessage(error: unknown, defaultMessage: string): string {
  return error instanceof Error ? error.message : defaultMessage;
}

/**
 * Valida se CNPJ tem 14 dígitos
 */
function isValidCnpj(cnpj: string): boolean {
  return cnpj.replace(/\D/g, "").length === 14;
}

/**
 * Página de gestão de clientes
 */
export default function ClientsPage() {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(FORM_INITIAL_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line
    setLoading(true);
    setError(null);

    const fetchClients = async () => {
      try {
        const response = await apiFetch<{ data: Cliente[] }>(API_ENDPOINTS.CLIENTES);
        setClients(response?.data || []);
      } catch (err) {
        setError(getErrorMessage(err, "Erro ao carregar clientes"));
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  /**
   * Recarrega lista de clientes
   */
  const reloadClients = async () => {
    try {
      const response = await apiFetch<{ data: Cliente[] }>(API_ENDPOINTS.CLIENTES);
      setClients(response?.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar clientes"));
    }
  };

  /**
   * Submete formulário para criar novo cliente
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nome.trim()) {
      setFormError("Nome é obrigatório");
      return;
    }

    if (!isValidCnpj(formData.cnpj)) {
      setFormError("CNPJ inválido");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiFetch(API_ENDPOINTS.CLIENTES_BASE, {
        method: "POST",
        body: JSON.stringify({
          nome: formData.nome,
          cnpj: formData.cnpj.replace(/\D/g, ""),
          email: formData.email,
        }),
      });

      setIsModalOpen(false);
      setFormData(FORM_INITIAL_STATE);
      await reloadClients();
    } catch (err) {
      setFormError(getErrorMessage(err, "Erro ao criar cliente"));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Deleta um cliente após confirmação do usuário
   */
  const handleDeleteClient = async (clientId: number) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

    try {
      setDeletingId(clientId);
      await apiFetch(`${API_ENDPOINTS.CLIENTES_BASE}/${clientId}`, {
        method: "DELETE",
      });
      await reloadClients();
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao deletar cliente"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Clientes</h1>
        <p className="text-white">Gerencie os clientes da empresa</p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          + Novo Cliente
        </button>
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-white mt-4">Carregando clientes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <p className="text-white">Nenhum cliente cadastrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  CNPJ
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clients.map((client) => (
                <tr
                  key={client.codCliente}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {client.nome}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {maskCnpj(client.cnpj)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {client.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDeleteClient(client.codCliente)}
                      disabled={deletingId === client.codCliente}
                      className="text-red-600 hover:text-red-700 disabled:text-gray-400 font-medium transition-colors"
                    >
                      {deletingId === client.codCliente ? "Excluindo..." : "Excluir"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData(FORM_INITIAL_STATE);
          setFormError(null);
        }}
        title="Novo Cliente"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            placeholder="Nome da empresa"
            value={formData.nome}
            onChange={(e) =>
              setFormData({ ...formData, nome: e.target.value })
            }
          />
          <Input
            label="CNPJ"
            placeholder="00.000.000/0000-00"
            mask="cnpj"
            value={formData.cnpj}
            onUnmaskedChange={(unmasked) =>
              setFormData({
                ...formData,
                cnpj: unmasked,
              })
            }
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@empresa.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          {formError && (
            <p className="text-red-500 text-sm">{formError}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? "Salvando..." : "Salvar Cliente"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
