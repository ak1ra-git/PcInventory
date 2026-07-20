"use client";

import { useState, useEffect } from "react";
import { Cliente } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { maskCnpj } from "@/lib/masks";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import ErrorModal from "@/components/ErrorModal";
import ConfirmModal from "@/components/ConfirmModal";
import Pagination from "@/components/Pagination";

const API_ENDPOINTS = {
  CLIENTES_BASE: "/clientes",
};

const PAGE_SIZE = 5;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(FORM_INITIAL_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    clientId: null as number | null,
  });

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchClients = async () => {
      try {
        const url = `${API_ENDPOINTS.CLIENTES_BASE}?pagina=${currentPage}&tamanho=${PAGE_SIZE}`;
        const response = await apiFetch<{
          data: Cliente[];
          totalPaginas: number;
        }>(url);

        setClients(response?.data || []);
        setTotalPages(response?.totalPaginas || 1);
      } catch (err) {
        setErrorModal({
          isOpen: true,
          message: getErrorMessage(err, "Erro ao carregar clientes"),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [currentPage]);

  /**
   * Recarrega lista de clientes da página atual
   */
  const reloadClients = async () => {
    try {
      const url = `${API_ENDPOINTS.CLIENTES_BASE}?pagina=${currentPage}&tamanho=${PAGE_SIZE}`;
      const response = await apiFetch<{
        data: Cliente[];
        totalPaginas: number;
      }>(url);

      setClients(response?.data || []);
      setTotalPages(response?.totalPaginas || 1);
    } catch (err) {
      setErrorModal({
        isOpen: true,
        message: getErrorMessage(err, "Erro ao carregar clientes"),
      });
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
      setErrorModal({
        isOpen: true,
        message: getErrorMessage(err, "Erro ao criar cliente"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Abre modal de confirmação para deletar cliente
   */
  const handleOpenDeleteConfirm = (clientId: number) => {
    setConfirmModal({ isOpen: true, clientId });
  };

  /**
   * Deleta um cliente após confirmação do usuário
   */
  const handleConfirmDelete = async () => {
    const clientId = confirmModal.clientId;
    if (!clientId) return;

    try {
      setDeletingId(clientId);
      setConfirmModal({ isOpen: false, clientId: null });
      await apiFetch(`${API_ENDPOINTS.CLIENTES_BASE}/${clientId}`, {
        method: "DELETE",
      });
      await reloadClients();
    } catch (err) {
      setErrorModal({
        isOpen: true,
        message: getErrorMessage(err, "Erro ao deletar cliente"),
      });
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
                      onClick={() => handleOpenDeleteConfirm(client.codCliente)}
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

      {/* Pagination */}
      {!loading && clients.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isLoading={loading}
        />
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
            type="text"
            inputMode="numeric"
            value={maskCnpj(formData.cnpj)}
            onChange={(e) => {
              const numbers = e.target.value.replace(/\D/g, "");
              setFormData({ ...formData, cnpj: numbers });
            }}
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Deletar Cliente?"
        message="Tem certeza que deseja excluir este cliente?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, clientId: null })}
        isLoading={deletingId !== null}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
      />
    </div>
  );
}
