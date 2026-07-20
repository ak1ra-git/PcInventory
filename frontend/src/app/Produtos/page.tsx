"use client";

import { useState, useEffect } from "react";
import { Produto } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import ErrorModal from "@/components/ErrorModal";
import ConfirmModal from "@/components/ConfirmModal";
import Pagination from "@/components/Pagination";

const API_ENDPOINTS = {
  PRODUTOS_BASE: "/produtos",
};

const PAGE_SIZE = 10;

const FORM_INITIAL_STATE = {
  nome: "",
  preco: "",
  estoque: "",
};

/**
 * Extrai mensagem de erro de diferentes tipos de exceção
 */
function getErrorMessage(error: unknown, defaultMessage: string): string {
  return error instanceof Error ? error.message : defaultMessage;
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
 * Página de gestão de produtos
 */
export default function ProductsPage() {
  const [products, setProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(FORM_INITIAL_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isEstoqueModalOpen, setIsEstoqueModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [novoEstoque, setNovoEstoque] = useState("");
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    productId: null as number | null,
  });

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchProducts = async () => {
      try {
        const url = `${API_ENDPOINTS.PRODUTOS_BASE}?pagina=${currentPage}&tamanho=${PAGE_SIZE}`;
        const response = await apiFetch<{
          data: Produto[];
          totalPaginas: number;
        }>(url);

        setProducts(response?.data || []);
        setTotalPages(response?.totalPaginas || 1);
      } catch (err) {
        setErrorModal({
          isOpen: true,
          message: getErrorMessage(err, "Erro ao carregar produtos"),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  /**
   * Recarrega lista de produtos da página atual
   */
  const reloadProducts = async () => {
    try {
      const url = `${API_ENDPOINTS.PRODUTOS_BASE}?pagina=${currentPage}&tamanho=${PAGE_SIZE}`;
      const response = await apiFetch<{
        data: Produto[];
        totalPaginas: number;
      }>(url);

      setProducts(response?.data || []);
      setTotalPages(response?.totalPaginas || 1);
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar produtos"));
    }
  };

  /**
   * Valida dados do formulário antes de enviar
   */
  const validateFormData = (): boolean => {
    if (!formData.nome.trim()) {
      setFormError("Nome é obrigatório");
      return false;
    }

    if (!formData.preco || isNaN(parseFloat(formData.preco))) {
      setFormError("Preço inválido");
      return false;
    }

    if (!formData.estoque || isNaN(parseInt(formData.estoque))) {
      setFormError("Estoque inválido");
      return false;
    }

    return true;
  };

  /**
   * Submete formulário para criar novo produto
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateFormData()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await apiFetch(API_ENDPOINTS.PRODUTOS_BASE, {
        method: "POST",
        body: JSON.stringify({
          nome: formData.nome,
          preco: parseFloat(formData.preco),
          estoque: parseInt(formData.estoque),
        }),
      });

      setIsModalOpen(false);
      setFormData(FORM_INITIAL_STATE);
      await reloadProducts();
    } catch (err) {
      setErrorModal({
        isOpen: true,
        message: getErrorMessage(err, "Erro ao criar produto"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Abre modal de confirmação para deletar produto
   */
  const handleOpenDeleteConfirm = (productId: number) => {
    setConfirmModal({ isOpen: true, productId });
  };

  /**
   * Deleta um produto após confirmação do usuário
   */
  const handleConfirmDelete = async () => {
    const productId = confirmModal.productId;
    if (!productId) return;

    try {
      setDeletingId(productId);
      setConfirmModal({ isOpen: false, productId: null });
      await apiFetch(`${API_ENDPOINTS.PRODUTOS_BASE}/${productId}`, {
        method: "DELETE",
      });
      await reloadProducts();
    } catch (err) {
      setErrorModal({
        isOpen: true,
        message: getErrorMessage(err, "Erro ao deletar produto"),
      });
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Abre modal para atualizar estoque
   */
  const handleOpenEstoqueModal = (productId: number, estoqueAtual: number) => {
    setSelectedProductId(productId);
    setNovoEstoque(estoqueAtual.toString());
    setFormError(null);
    setIsEstoqueModalOpen(true);
  };

  /**
   * Atualiza estoque do produto
   */
  const handleUpdateEstoque = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedProductId) return;

    if (!novoEstoque || isNaN(parseInt(novoEstoque))) {
      setFormError("Estoque inválido");
      return;
    }

    try {
      setIsSubmitting(true);
      const product = products.find((p) => p.codProduto === selectedProductId);
      if (!product) return;

      await apiFetch(`${API_ENDPOINTS.PRODUTOS_BASE}/${selectedProductId}`, {
        method: "PUT",
        body: JSON.stringify({
          codProduto: selectedProductId,
          nome: product.nome,
          preco: product.preco,
          estoque: parseInt(novoEstoque),
        }),
      });

      setIsEstoqueModalOpen(false);
      setSelectedProductId(null);
      setNovoEstoque("");
      await reloadProducts();
    } catch (err) {
      setErrorModal({
        isOpen: true,
        message: getErrorMessage(err, "Erro ao atualizar estoque"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Produtos</h1>
        <p className="text-white">Gerencie o catálogo de produtos</p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          + Novo Produto
        </button>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-white mt-4">Carregando produtos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <p className="text-white">Nenhum produto cadastrado</p>
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
                  Preço
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Estoque
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr
                  key={product.codProduto}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.nome}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(product.preco)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.estoque > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.estoque}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-3">
                    <button
                      onClick={() =>
                        handleOpenEstoqueModal(
                          product.codProduto,
                          product.estoque
                        )
                      }
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      📦 Estoque
                    </button>
                    <button
                      onClick={() => handleOpenDeleteConfirm(product.codProduto)}
                      disabled={deletingId === product.codProduto}
                      className="text-red-600 hover:text-red-700 disabled:text-gray-400 font-medium transition-colors"
                    >
                      {deletingId === product.codProduto ? "Excluindo..." : "Excluir"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isLoading={loading}
        />
      )}

      {/* New Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData(FORM_INITIAL_STATE);
          setFormError(null);
        }}
        title="Novo Produto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            placeholder="Nome do produto"
            value={formData.nome}
            onChange={(e) =>
              setFormData({ ...formData, nome: e.target.value })
            }
          />
          <Input
            label="Preço"
            type="number"
            step="0.01"
            placeholder="150.00"
            value={formData.preco}
            onChange={(e) =>
              setFormData({ ...formData, preco: e.target.value })
            }
          />
          <Input
            label="Estoque"
            type="number"
            placeholder="0"
            value={formData.estoque}
            onChange={(e) =>
              setFormData({ ...formData, estoque: e.target.value })
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
            {isSubmitting ? "Salvando..." : "Salvar Produto"}
          </button>
        </form>
      </Modal>

      {/* Update Estoque Modal */}
      <Modal
        isOpen={isEstoqueModalOpen}
        onClose={() => {
          setIsEstoqueModalOpen(false);
          setSelectedProductId(null);
          setNovoEstoque("");
          setFormError(null);
        }}
        title="Atualizar Estoque"
      >
        <form onSubmit={handleUpdateEstoque} className="space-y-4">
          <Input
            label="Novo Estoque"
            type="number"
            placeholder="0"
            value={novoEstoque}
            onChange={(e) => setNovoEstoque(e.target.value)}
          />
          {formError && (
            <p className="text-red-500 text-sm">{formError}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? "Atualizando..." : "Atualizar Estoque"}
          </button>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Deletar Produto?"
        message="Tem certeza que deseja excluir este produto?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, productId: null })}
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
