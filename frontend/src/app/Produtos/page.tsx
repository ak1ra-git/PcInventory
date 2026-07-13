"use client";

import { useState, useEffect } from "react";
import { Produto } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import Input from "@/components/Input";
import Modal from "@/components/Modal";

const API_ENDPOINTS = {
  PRODUTOS: "/produtos?pagina=1&tamanho=50",
  PRODUTOS_BASE: "/produtos",
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(FORM_INITIAL_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line
    setLoading(true);
    setError(null);

    const fetchProducts = async () => {
      try {
        const response = await apiFetch<{ data: Produto[] }>(API_ENDPOINTS.PRODUTOS);
        setProducts(response?.data || []);
      } catch (err) {
        setError(getErrorMessage(err, "Erro ao carregar produtos"));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /**
   * Recarrega lista de produtos
   */
  const reloadProducts = async () => {
    try {
      const response = await apiFetch<{ data: Produto[] }>(API_ENDPOINTS.PRODUTOS);
      setProducts(response?.data || []);
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
      setFormError(getErrorMessage(err, "Erro ao criar produto"));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Deleta um produto após confirmação do usuário
   */
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      setDeletingId(productId);
      await apiFetch(`${API_ENDPOINTS.PRODUTOS_BASE}/${productId}`, {
        method: "DELETE",
      });
      await reloadProducts();
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao deletar produto"));
    } finally {
      setDeletingId(null);
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
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
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
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDeleteProduct(product.codProduto)}
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
            placeholder="R$ 0,00"
            mask="currency"
            value={formData.preco}
            onUnmaskedChange={(unmasked) =>
              setFormData({ ...formData, preco: unmasked })
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
    </div>
  );
}
