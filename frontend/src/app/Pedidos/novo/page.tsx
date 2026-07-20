"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Produto, Cliente, ItemCarrinho } from "@/lib/types";
import { apiFetch } from "@/lib/api";

const API_ENDPOINTS = {
  PRODUTOS_BASE: "/produtos",
  CLIENTES_BASE: "/clientes",
  PEDIDOS: "/pedidos",
};

const PAGE_SIZE = 5;

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
 * Encontra cliente pelo CNPJ (com ou sem formatação)
 */
function findClientByCnpj(clients: Cliente[], cnpj: string): Cliente | undefined {
  const unformattedCnpj = cnpj.replace(/\D/g, "");
  return clients.find((c) => c.cnpj === cnpj || c.cnpj === unformattedCnpj);
}

/**
 * Conteúdo da página de novo pedido
 * Exibe lista de produtos com estoque e permite adicionar ao carrinho
 */
function NewOrderContent() {
  const searchParams = useSearchParams();
  const clientCnpjFromUrl = searchParams.get("clienteCnpj");

  const [products, setProducts] = useState<Produto[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [cart, setCart] = useState<ItemCarrinho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [totalProductPages, setTotalProductPages] = useState(1);

  useEffect(() => {
    // eslint-disable-next-line
    setLoading(true);
    setError(null);

    const fetchInitialData = async () => {
      try {
        const productsUrl = `${API_ENDPOINTS.PRODUTOS_BASE}?pagina=${currentProductPage}&tamanho=${PAGE_SIZE}`;
        const clientsUrl = `${API_ENDPOINTS.CLIENTES_BASE}?pagina=1&tamanho=100`;

        const [productsRes, clientsRes] = await Promise.all([
          apiFetch<{ data: Produto[]; totalPaginas: number }>(productsUrl),
          apiFetch<{ data: Cliente[] }>(clientsUrl),
        ]);

        const productsData = productsRes?.data || [];
        const clientsData = clientsRes?.data || [];

        setProducts(productsData);
        setTotalProductPages(productsRes?.totalPaginas || 1);
        setClients(clientsData);

        if (clientCnpjFromUrl) {
          const foundClient = findClientByCnpj(clientsData, clientCnpjFromUrl);
          if (foundClient) {
            setSelectedClient(foundClient);
          }
        }
      } catch (err) {
        setError(getErrorMessage(err, "Erro ao carregar dados"));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [clientCnpjFromUrl, currentProductPage]);

  useEffect(() => {
    if (shouldRedirect) {
      window.location.href = "/";
    }
  }, [shouldRedirect]);

  /**
   * Calcula total do carrinho
   */
  const calculateCartTotal = (cartItems: ItemCarrinho[]): number => {
    return cartItems.reduce(
      (acc, item) => acc + item.valorUnitario * item.quantidade,
      0
    );
  };

  /**
   * Adiciona produto ao carrinho ou aumenta quantidade se já existe
   */
  const handleAddToCart = (product: Produto) => {
    if (product.estoque <= 0) {
      setError("Produto sem estoque");
      return;
    }

    setError(null);
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.codProduto === product.codProduto
      );

      if (existingItem) {
        if (existingItem.quantidade < product.estoque) {
          return prevCart.map((item) =>
            item.codProduto === product.codProduto
              ? { ...item, quantidade: item.quantidade + 1 }
              : item
          );
        }
        setError(`Estoque máximo de ${product.estoque} unidades atingido`);
        return prevCart;
      }

      return [
        ...prevCart,
        {
          codProduto: product.codProduto,
          nomeProduto: product.nome,
          quantidade: 1,
          valorUnitario: product.preco,
        },
      ];
    });
  };

  /**
   * Aumenta quantidade de um item no carrinho
   */
  const handleIncreaseQuantity = (productId: number, availableStock: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.codProduto === productId && item.quantidade < availableStock) {
          return { ...item, quantidade: item.quantidade + 1 };
        }
        return item;
      })
    );
  };

  /**
   * Diminui quantidade de um item no carrinho (remove se quantidade atinge 0)
   */
  const handleDecreaseQuantity = (productId: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.codProduto === productId && item.quantidade > 1) {
            return { ...item, quantidade: item.quantidade - 1 };
          }
          return item;
        })
        .filter((item) => item.quantidade > 0)
    );
  };

  /**
   * Remove item do carrinho
   */
  const handleRemoveFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.codProduto !== productId)
    );
  };

  const cartTotal = calculateCartTotal(cart);

  /**
   * Cria novo pedido com itens do carrinho
   * Primeiro cria o pedido, depois adiciona cada item sequencialmente
   */
  const handleCreateOrder = async () => {
    if (!selectedClient) {
      setError("Cliente não selecionado");
      return;
    }

    if (cart.length === 0) {
      setError("Carrinho vazio");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderPayload = {
        codCliente: selectedClient.codCliente,
        dataPedido: new Date().toISOString(),
        valorTotal: cartTotal,
      };

      const orderResponse = await apiFetch<{ codPedido: number }>(
        API_ENDPOINTS.PEDIDOS,
        {
          method: "POST",
          body: JSON.stringify(orderPayload),
        }
      );

      const orderId = orderResponse?.codPedido;
      if (!orderId) {
        throw new Error("Não foi possível obter o ID do pedido criado");
      }

      for (const item of cart) {
        try {
          await apiFetch(`${API_ENDPOINTS.PEDIDOS}/${orderId}/itens`, {
            method: "POST",
            body: JSON.stringify({
              codProduto: item.codProduto,
              quantidade: item.quantidade,
            }),
          });
        } catch (itemErr) {
          throw new Error(
            `Falha ao adicionar produto ${item.nomeProduto}: ${getErrorMessage(itemErr, "Erro desconhecido")}`
          );
        }
      }

      setShouldRedirect(true);
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao criar pedido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Novo Pedido</h1>
        <p className="text-white">Selecione produtos e confirme o pedido</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-8">
          {error}
        </div>
      )}

      {/* Seleção de Cliente */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-black mb-4">Selecione o Cliente</h2>
        <select
          value={selectedClient?.codCliente || ""}
          onChange={(e) => {
            const selected = clients.find(
              (c) => c.codCliente === parseInt(e.target.value)
            );
            setSelectedClient(selected || null);
          }}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-black"
        >
          <option value="">-- Escolha um cliente --</option>
          {clients.map((c) => (
            <option key={c.codCliente} value={c.codCliente}>
              {c.nome}
            </option>
          ))}
        </select>
        {selectedClient && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-black">CNPJ: {selectedClient.cnpj}</p>
            <p className="text-sm text-black">Email: {selectedClient.email}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Produtos */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-black mb-6">Produtos</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-black">
              Nenhum produto disponível
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.codProduto}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
                >
                  <div>
                    <h3 className="font-bold text-black">{product.nome}</h3>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-black">
                        Preço: {formatCurrency(product.preco)}
                      </span>
                      <span
                        className={`font-medium ${
                          product.estoque > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        Estoque: {product.estoque}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.estoque <= 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Paginação de Produtos */}
          {!loading && products.length > 0 && totalProductPages > 1 && (
            <div className="mt-8">
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentProductPage(currentProductPage - 1)}
                  disabled={currentProductPage === 1 || loading}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-900 rounded-lg font-medium"
                >
                  ← Anterior
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalProductPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentProductPage(page)}
                        disabled={loading}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          currentProductPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setCurrentProductPage(currentProductPage + 1)}
                  disabled={currentProductPage === totalProductPages || loading}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-900 rounded-lg font-medium"
                >
                  Próximo →
                </button>

                <span className="ml-4 text-sm text-gray-600">
                  Página {currentProductPage} de {totalProductPages}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Carrinho */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-black mb-6">Carrinho</h2>

            {cart.length === 0 ? (
              <p className="text-black text-center py-8">Carrinho vazio</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => {
                    const availableStock = products.find(
                      (p) => p.codProduto === item.codProduto
                    )?.estoque || 0;
                    return (
                      <div
                        key={item.codProduto}
                        className="bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-black">
                            {item.nomeProduto}
                          </p>
                          <button
                            onClick={() => handleRemoveFromCart(item.codProduto)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() =>
                              handleDecreaseQuantity(item.codProduto)
                            }
                            className="bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded text-sm font-medium transition-colors"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium w-8 text-center text-black">
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() =>
                              handleIncreaseQuantity(
                                item.codProduto,
                                availableStock
                              )
                            }
                            disabled={item.quantidade >= availableStock}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-2 py-1 rounded text-sm font-medium transition-colors"
                          >
                            +
                          </button>
                          <span className="text-xs text-black ml-auto">
                            Max: {availableStock}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-black">
                          {formatCurrency(item.valorUnitario * item.quantidade)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-black">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCreateOrder}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                >
                  {loading ? "Criando..." : "Confirmar Pedido"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Página para criar novo pedido com Suspense boundary
 */
export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Carregando...</div>}>
      <NewOrderContent />
    </Suspense>
  );
}
