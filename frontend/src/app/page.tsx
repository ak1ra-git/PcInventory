// ============================================================
// PÁGINA HOME - DASHBOARD DE PEDIDOS
// ============================================================
// Página inicial que mostra:
// - Lista de pedidos com cards
// - Filtros por cliente e data
// - Botão para criar novo pedido
// - Modal para buscar cliente por CNPJ
//
// Fluxo:
// 1. Carrega pedidos e clientes ao abrir
// 2. Usuário filtra por cliente ou data
// 3. Clica "Novo Pedido" -> abre modal
// 4. Digita CNPJ -> busca cliente -> redireciona
"use client";

// ============================================================
// IMPORTAÇÕES
// ============================================================
// useState = gerencia estado (filtros, modal, carregamento)
// useEffect = busca dados ao carregar página
// useCallback = otimiza função reloadPedidos (memo)
import { useState, useEffect, useCallback } from "react";

// Tipos TypeScript do projeto
import { Pedido, Cliente } from "@/lib/types";

// Função para fazer requisições à API
import { apiFetch } from "@/lib/api";

// Componentes do projeto
import PedidoCard from "@/components/PedidoCard";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import ProtectedRoute from "@/components/ProtectedRoute";

// ============================================================
// CONSTANTES - URLs dos endpoints da API
// ============================================================
const API_ENDPOINTS = {
  // Busca primeiros 50 pedidos
  // pagina=1 (primeira página)
  // tamanho=50 (50 pedidos por página)
  PEDIDOS: "/pedidos?pagina=1&tamanho=50",

  // Busca primeiros 100 clientes
  // tamanho=100 (para poder filtrar qualquer cliente)
  CLIENTES: "/clientes?pagina=1&tamanho=100",
};

// ============================================================
// FUNÇÃO AUXILIAR - getErrorMessage
// ============================================================
// Extrai mensagem de erro de diferentes tipos de exceção
// Usado em try/catch para mostrar mensagens legíveis
//
// Por quê?
// - error pode ser Error, string, object, etc
// - TypeError: error.message não funciona em todos
// - Solução: verificar tipo antes de acessar
//
// Exemplo:
// try { ... } catch (err) {
//   const msg = getErrorMessage(err, "Erro padrão")
//   setError(msg)
// }
function getErrorMessage(error: unknown, defaultMessage: string): string {
  // error instanceof Error
  // Verifica se error é um objeto Error (tem propriedade .message)
  // Exemplo: new Error("Algo deu errado")
  return error instanceof Error ? error.message : defaultMessage;
  // Se error for Error -> retorna error.message
  // Se error for algo outro (string, null) -> retorna defaultMessage
}

// ============================================================
// COMPONENTE HOME CONTENT - Conteúdo da página home
// ============================================================
// Componente que renderiza a página inicial
// Busca dados, mostra filtros, lista pedidos
function HomeContent() {
  // ========== ESTADOS ==========

  // const [pedidos, setPedidos] = useState<Pedido[]>([]);
  // Lista de todos os pedidos carregados da API
  // Tipo: array de Pedido
  // Usado para filtrar e exibir cards
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  // const [clientes, setClientes] = useState<Cliente[]>([]);
  // Lista de todos os clientes carregados da API
  // Tipo: array de Cliente
  // Usado para:
  // - Buscar nome do cliente pelo ID
  // - Buscar cliente pelo CNPJ
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // const [loading, setLoading] = useState(true);
  // true = dados carregando
  // false = dados carregados
  // Mostra spinner enquanto busca da API
  const [loading, setLoading] = useState(true);

  // const [error, setError] = useState<string | null>(null);
  // null = sem erro
  // string = mensagem de erro
  // Exemplo: "Erro ao carregar dados"
  const [error, setError] = useState<string | null>(null);

  // const [clientFilter, setClientFilter] = useState("");
  // Texto do filtro por cliente
  // Usuário digita nome do cliente
  // Exemplo: "Empresa Tech"
  const [clientFilter, setClientFilter] = useState("");

  // const [dateFilter, setDateFilter] = useState("");
  // Texto do filtro por data
  // Usuário digita data
  // Exemplo: "22/07"
  const [dateFilter, setDateFilter] = useState("");

  // const [isModalOpen, setIsModalOpen] = useState(false);
  // false = modal fechado
  // true = modal aberto (buscar cliente por CNPJ)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // const [cnpj, setCnpj] = useState("");
  // CNPJ digitado no modal
  // Usuário digita, procuramos no array clientes
  const [cnpj, setCnpj] = useState("");

  // const [deletingId, setDeletingId] = useState<number | null>(null);
  // ID do pedido sendo deletado
  // null = nenhum deletando
  // number = ID do pedido
  // Usado para desabilitar botão enquanto deleta
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ========== FUNÇÃO - reloadPedidos ==========
  // Recarrega apenas a lista de pedidos
  // Sem recarregar clientes
  // Usado após deletar um pedido
  //
  // useCallback = otimiza função (evita recriação desnecessária)
  // async = faz requisição assíncrona
  const reloadPedidos = useCallback(async () => {
    try {
      // Busca pedidos da API
      const response = await apiFetch<{ data: Pedido[] }>(API_ENDPOINTS.PEDIDOS);

      // Atualiza estado com novo array
      // response?.data = dados se request bem-sucedida
      // || [] = array vazio se falhar (fallback)
      setPedidos(response?.data || []);
    } catch (err) {
      // Se algo der errado, mostra erro
      setError(getErrorMessage(err, "Erro ao carregar pedidos"));
    }
  }, []);

  // ========== useEffect - Buscar dados ao carregar ==========
  // Executado UMA VEZ quando componente monta
  // [] = array vazio = executar só uma vez
  useEffect(() => {
    // Ativar loading enquanto busca dados
    setLoading(true);

    // Limpar erros anteriores
    setError(null);

    // ========== FUNÇÃO INTERNA - fetchInitialData ==========
    // Busca pedidos E clientes ao mesmo tempo (paralelo)
    const fetchInitialData = async () => {
      try {
        // Promise.all = executar múltiplas requisições em paralelo
        // Mais rápido que esperar uma, depois outra
        const [pedidosRes, clientesRes] = await Promise.all([
          // Requisição 1: busca pedidos
          apiFetch<{ data: Pedido[] }>(API_ENDPOINTS.PEDIDOS),

          // Requisição 2: busca clientes
          apiFetch<{ data: Cliente[] }>(API_ENDPOINTS.CLIENTES),
        ]);

        // Atualizar estados com dados recebidos
        // ?. = optional chaining (seguro se response for null)
        // || [] = fallback para array vazio
        setPedidos(pedidosRes?.data || []);
        setClientes(clientesRes?.data || []);
      } catch (err) {
        // Se qualquer requisição falhar, mostrar erro
        setError(getErrorMessage(err, "Erro ao carregar dados"));
      } finally {
        // Sempre desativar loading (sucesso ou erro)
        // finally = executa depois de try ou catch
        setLoading(false);
      }
    };

    // Chamar a função
    fetchInitialData();

    // Dependências vazias = executar só na montagem
  }, []);

  // ========== FUNÇÃO - findClientByCnpj ==========
  // Busca um cliente no array clientes pelo CNPJ
  // Considera tanto CNPJ formatado quanto sem formatação
  //
  // Por quê duas buscas?
  // - DB pode ter "12.345.678/0001-90"
  // - Usuário digita "12345678000190" (sem máscara)
  // - Devem achar o mesmo cliente
  const findClientByCnpj = (cnpjValue: string): Cliente | undefined => {
    // Remove tudo que não é número
    // "12.345.678/0001-90" -> "12345678000190"
    const unformattedCnpj = cnpjValue.replace(/\D/g, "");

    // Busca no array
    // Retorna primeiro cliente que atender
    return clientes.find(
      // c.cnpj === cnpjValue (busca com formatação)
      // OR
      // c.cnpj === unformattedCnpj (busca sem formatação)
      (c) => c.cnpj === cnpjValue || c.cnpj === unformattedCnpj
    );
  };

  // ========== FUNÇÃO - handleSearchClientByCnpj ==========
  // Executada ao clicar "Continuar" no modal
  // 1. Valida CNPJ (não vazio)
  // 2. Busca cliente
  // 3. Se encontrou -> redireciona para criar pedido
  // 4. Se não encontrou -> mostra erro
  const handleSearchClientByCnpj = async () => {
    // ========== VALIDAÇÃO ==========
    // !cnpj.trim() = CNPJ vazio ou só espaços
    if (!cnpj.trim()) {
      setError("Informe um CNPJ");
      return;
    }

    try {
      // ========== BUSCAR CLIENTE ==========
      const cliente = findClientByCnpj(cnpj);

      // ========== VERIFICAR RESULTADO ==========
      if (cliente) {
        // Cliente encontrado!

        // Fechar modal
        setIsModalOpen(false);

        // Redirecionar para página de novo pedido
        // Passa CNPJ como query parameter
        // Página /pedidos/novo vai pré-preencher com este cliente
        window.location.href = `/pedidos/novo?clienteCnpj=${cliente.cnpj}`;
      } else {
        // Cliente não encontrado
        setError("Cliente não encontrado");
      }
    } catch {
      // Erro durante a busca
      setError("Erro ao buscar cliente");
    }
  };

  // ========== FUNÇÃO - handleDeletePedido ==========
  // Deleta um pedido após confirmação
  // 1. Pede confirmação ao usuário (confirm)
  // 2. Marca como deletando (desabilita botão)
  // 3. Faz requisição DELETE à API
  // 4. Recarrega lista de pedidos
  // 5. Se erro -> mostra mensagem
  const handleDeletePedido = async (pedidoId: number) => {
    // Pedir confirmação
    // Se cancelar -> retorna sem fazer nada
    if (!confirm("Tem certeza que deseja excluir este pedido?")) return;

    try {
      // Marcar como deletando (para desabilitar botão)
      setDeletingId(pedidoId);

      // Fazer requisição DELETE ao servidor
      // /pedidos/{id} com method DELETE
      await apiFetch(`/pedidos/${pedidoId}`, { method: "DELETE" });

      // Se sucesso, recarregar lista
      await reloadPedidos();
    } catch (err) {
      // Se erro, mostrar mensagem
      setError(getErrorMessage(err, "Erro ao deletar pedido"));
    } finally {
      // Sempre limpar deletingId (sucesso ou erro)
      setDeletingId(null);
    }
  };

  // ========== FUNÇÃO - getClientName ==========
  // Retorna nome do cliente dado seu ID
  // Busca no array clientes
  //
  // Exemplo:
  // getClientName(1) -> "Empresa Tech LTDA"
  const getClientName = (codCliente: number): string => {
    // Busca cliente com este ID
    // ?. = optional chaining (seguro se não encontrar)
    // ?.nome = pega a propriedade nome
    // || "N/A" = fallback se não encontrar cliente
    return clientes.find((c) => c.codCliente === codCliente)?.nome || "N/A";
  };

  // ========== FUNÇÃO - matchesClientFilter ==========
  // Verifica se um pedido combina com filtro de cliente
  // Procura nome do cliente no texto do filtro
  //
  // Exemplo:
  // Se filtro = "Tech"
  // E cliente = "Empresa Tech LTDA"
  // Retorna true (contém "tech" minúsculo)
  const matchesClientFilter = (
    pedido: Pedido,
    filterText: string
  ): boolean => {
    // Busca cliente deste pedido
    const cliente = clientes.find((c) => c.codCliente === pedido.codCliente);

    // Se não encontrou cliente -> false
    if (!cliente) return false;

    // Verifica se nome do cliente contém o filtro
    // toLowerCase() = ignora maiúscula/minúscula
    return cliente.nome.toLowerCase().includes(filterText.toLowerCase());
  };

  // ========== FUNÇÃO - matchesDateFilter ==========
  // Verifica se data do pedido combina com filtro de data
  // Exemplo: usuário digita "22/07" e procura pedidos nesta data
  const matchesDateFilter = (pedido: Pedido, filterText: string): boolean => {
    // Converte data do pedido para formato brasileiro
    // "2026-07-22" -> "22/07/2026"
    const pedidoDate = new Date(pedido.dataPedido).toLocaleDateString("pt-BR");

    // Verifica se data contém o filtro digitado
    // Exemplo: "22/07/2026" contém "22/07"? Sim
    return pedidoDate.includes(filterText);
  };

  // ========== VARIÁVEL - filteredPedidos ==========
  // Array de pedidos FILTRADOS
  // Começa com todos os pedidos
  // Remove que não combinam com filtros
  const filteredPedidos = pedidos.filter((pedido) => {
    // ========== FILTRO DE CLIENTE ==========
    // !clientFilter = se não há filtro de cliente (campo vazio)
    // Então não filtra por cliente (aceita todos)
    // Se há filtro, verifica se pedido combina
    const clientFilterMatch = !clientFilter || matchesClientFilter(pedido, clientFilter);

    // ========== FILTRO DE DATA ==========
    // Mesmo lógica: sem filtro = aceita todos
    const dateFilterMatch = !dateFilter || matchesDateFilter(pedido, dateFilter);

    // ========== RESULTADO ==========
    // AMBOS os filtros devem passar para incluir pedido
    // clientFilterMatch AND dateFilterMatch
    return clientFilterMatch && dateFilterMatch;
  });

  // ========== RENDERIZAR COMPONENTE ==========
  return (
    // ========== CONTAINER PRINCIPAL ==========
    // max-w-6xl = largura máxima (1280px)
    // mx-auto = centraliza horizontalmente
    // px-4 py-8 = padding
    <div className="max-w-6xl mx-auto px-4 py-8">

      // ========== SEÇÃO - HEADER ==========
      // Título e descrição da página
      <div className="mb-8">
        // Título: "Pedidos"
        // text-4xl = muito grande
        // font-bold = negrito
        // text-white = branco
        <h1 className="text-4xl font-bold text-white mb-2">Pedidos</h1>

        // Descrição
        <p className="text-white">Gerencie e visualize seus pedidos</p>
      </div>

      // ========== SEÇÃO - AÇÕES ==========
      // Botões de ação (novo pedido, etc)
      <div className="flex gap-4 mb-8">

        // Botão "Novo Pedido"
        // onClick={() => setIsModalOpen(true)} = abre modal
        <button
          onClick={() => setIsModalOpen(true)}

          // Estilos:
          // bg-blue-600 = azul
          // hover:bg-blue-700 = mais escuro ao passar mouse
          // text-white = texto branco
          // px-6 py-2 = padding
          // rounded-lg = bordas arredondadas
          // font-medium = semi-negrito
          // transition-colors = cor muda liso
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          + Novo Pedido
        </button>
      </div>

      // ========== SEÇÃO - FILTROS ==========
      // Campos de entrada para filtrar pedidos
      <div className="bg-white rounded-lg shadow p-6 mb-8">

        // Título "Filtros"
        <h2 className="text-lg font-bold text-black mb-4">Filtros</h2>

        // Grid de inputs (1 coluna em mobile, 2 em desktop)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          // Filtro por cliente
          // Usuário digita nome
          // onChange atualiza clientFilter
          <Input
            label="Cliente"
            placeholder="Nome do cliente"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          />

          // Filtro por data
          // Usuário digita data
          // onChange atualiza dateFilter
          <Input
            label="Data"
            placeholder="dd/mm/yyyy"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      // ========== SEÇÃO - LISTA DE PEDIDOS ==========
      // Renderização condicional (4 casos):
      // 1. loading = mostra spinner
      // 2. error = mostra mensagem de erro
      // 3. vazio = mostra "nenhum pedido"
      // 4. sucesso = mostra grid de cards
      {loading ? (
        // ========== CASO 1: CARREGANDO ==========
        <div className="text-center py-12">
          // Spinner (ícone girando)
          // animate-spin = anima rotação
          // h-12 w-12 = 48x48 pixels
          // border-b-2 border-blue-600 = borda inferior azul
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />

          // Texto "Carregando pedidos..."
          // mt-4 = margem superior (espaço com spinner)
          <p className="text-black mt-4">Carregando pedidos...</p>
        </div>

      ) : error ? (
        // ========== CASO 2: ERRO ==========
        // bg-red-50 = fundo vermelho bem claro
        // border border-red-200 = borda vermelha clara
        // rounded-lg = bordas arredondadas
        // p-4 = padding
        // text-red-700 = texto vermelho escuro
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          // Mostra mensagem de erro
          {error}
        </div>

      ) : filteredPedidos.length === 0 ? (
        // ========== CASO 3: NENHUM PEDIDO ==========
        // Se filtros retornaram 0 resultados
        // bg-gray-100 = fundo cinza
        // p-12 = padding grande
        // text-center = centralizado
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          // Mensagem dizendo que não achou nada
          <p className="text-black">Nenhum pedido encontrado</p>
        </div>

      ) : (
        // ========== CASO 4: SUCESSO (tem pedidos) ==========
        // Grid responsivo:
        // grid-cols-1 = 1 coluna em mobile
        // md:grid-cols-2 = 2 colunas em tablet
        // lg:grid-cols-3 = 3 colunas em desktop
        // gap-6 = espaço entre cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          // Mapear cada pedido para um card
          {filteredPedidos.map((pedido) => (
            // PedidoCard = componente que mostra um pedido
            // key={pedido.codPedido} = identificador único (React precisa)
            // pedido = objeto com dados do pedido
            // clienteNome = adiciona nome do cliente ao objeto
            // onDelete = função chamada ao deletar
            // isDeleting = flag dizendo se está deletando agora
            <PedidoCard
              key={pedido.codPedido}

              // Spread operator ({...pedido}) copia todas propriedades
              // Depois adiciona clienteNome
              // Resultado: { codPedido, dataPedido, ..., clienteNome: "Empresa A" }
              pedido={{ ...pedido, clienteNome: getClientName(pedido.codCliente) }}

              // Callback para deletar
              onDelete={handleDeletePedido}

              // true se este pedido está sendo deletado agora
              // Desabilita botão enquanto processa
              isDeleting={deletingId === pedido.codPedido}
            />
          ))}
        </div>
      )}

      // ========== SEÇÃO - MODAL NOVO PEDIDO ==========
      // Janela flutuante que aparece ao clicar "Novo Pedido"
      <Modal
        // isOpen={isModalOpen} = true quando usuário clica botão
        isOpen={isModalOpen}

        // onClose = função chamada ao fechar
        // Reseta estado (fecha modal, limpa CNPJ, limpa erro)
        onClose={() => {
          setIsModalOpen(false);  // Fecha modal
          setCnpj("");            // Limpa CNPJ digitado
          setError(null);         // Limpa erro anterior
        }}

        // Título do modal
        title="Novo Pedido"
      >
        // ========== CONTEÚDO DO MODAL ==========
        <div className="space-y-4">

          // Instrução: "Informe o CNPJ..."
          <p className="text-black">
            Informe o CNPJ do cliente para criar um novo pedido
          </p>

          // Campo de entrada para CNPJ
          <Input
            label="CNPJ"
            placeholder="00000000000000"
            type="text"

            // inputMode="numeric" = teclado numérico em mobile
            inputMode="numeric"

            // value={cnpj} = valor atual digitado
            value={cnpj}

            // onChange = atualiza cnpj enquanto digita
            // e.target.value.replace(/\D/g, "") = remove tudo que não é número
            onChange={(e) => {
              // Remove caracteres não numéricos
              // /\D/g = regex para "qualquer não-dígito"
              // Exemplo: "12.345" -> "12345"
              const numbers = e.target.value.replace(/\D/g, "");

              // Atualiza estado apenas com números
              setCnpj(numbers);
            }}
          />

          // Mostra erro se houver
          // {error && <p>...} = renderiza só se error existe
          {error && <p className="text-red-500 text-sm">{error}</p>}

          // Botão "Continuar"
          <button
            // onClick={handleSearchClientByCnpj} = executar busca ao clicar
            onClick={handleSearchClientByCnpj}

            // Estilos:
            // w-full = 100% de largura (preenche container)
            // bg-blue-600 = azul
            // hover:bg-blue-700 = mais escuro ao passar mouse
            // text-white = texto branco
            // px-4 py-2 = padding
            // rounded-lg = bordas arredondadas
            // font-medium = semi-negrito
            // transition-colors = cor muda liso
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Continuar
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================
// COMPONENTE HOME (PRINCIPAL)
// ============================================================
// Wrapper que renderiza HomeContent
// Pode estar envolvido por ProtectedRoute para autenticação
export default function Home() {
  // TODO: Reativar ProtectedRoute quando login estiver pronto
  // ProtectedRoute = componente que verifica se usuário está logado
  // Se não está -> redireciona para login
  // Por enquanto está comentado (permitir visualizar sem login)
  return (
    // <ProtectedRoute>
    //   Descomentar quando quiser proteger página com autenticação
    // </ProtectedRoute>

    // Por enquanto, renderizar direto
    <HomeContent />
  );
}