// ============================================================
// PÁGINA DE LOGIN - FRONTEND REACT/NEXT.JS
// ============================================================
// Este arquivo é responsável pela página de login que você vê no navegador
// Coordena: pegue dados do formulário → envie ao backend → guarde tokens

// "use client" = Esta página roda no NAVEGADOR (não no servidor)
// Sem isso, não funcionaria useState, useRouter, etc
"use client";

// ============================================================
// IMPORTAÇÕES - Trazer funcionalidades de outras bibliotecas
// ============================================================

// useState = "gancho" (hook) que gerencia estado (variáveis que mudam)
// Quando estado muda, React renderiza novamente a página
import { useState } from "react";

// useRouter = navegação entre páginas
// router.push("/") = vai para home
import { useRouter } from "next/navigation";

// Função que chama a API (backend)
import { apiFetch } from "@/lib/api";

// Componente Input reutilizável (input bonitinho com label)
import Input from "@/components/Input";

// ============================================================
// TIPO DE DADOS - Define formato da resposta do backend
// ============================================================
// Quando faz login, backend retorna um JSON com esses dados:
// {
//   "accessToken": "eyJhbGc...",
//   "refreshToken": "xK7pZ9...",
//   "expiresIn": 900
// }

// interface = "contrato" que define a forma de um objeto
interface AuthResponse {
  // Token para fazer requisições à API (válido por 15 min)
  accessToken: string;

  // Token para renovar o access token (válido por 7 dias)
  refreshToken: string;

  // Tempo em segundos até o token expirar (900 = 15 minutos)
  expiresIn: number;
}

// ============================================================
// COMPONENTE REACT - Página de Login
// ============================================================
// export default = "este é o componente principal desta página"
// function LoginPage() = Uma função que retorna HTML (JSX)
export default function LoginPage() {
  // ========== ROUTER ==========
  // useRouter() = função que retorna objeto para navegar entre páginas
  const router = useRouter();
  // router.push("/") = ir para home
  // router.replace("/") = ir para home E remover página anterior do histórico

  // ========== ESTADO - Variáveis que podem mudar ==========
  // useState(valor_inicial) retorna [valor_atual, função_para_mudar]

  // Estado: login digitado pelo usuário
  // usuario = valor atual (inicialmente "")
  // setUsuario = função para mudar o valor
  const [usuario, setUsuario] = useState("");

  // Estado: senha digitada
  const [senha, setSenha] = useState("");

  // Estado: mensagem de erro (null = sem erro, string = com erro)
  // Útil para mostrar "Usuário/senha incorretos"
  const [error, setError] = useState<string | null>(null);

  // Estado: indicador se está fazendo requisição (loading)
  // true = está esperando resposta do backend
  // false = já recebeu resposta
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================
  // FUNÇÃO: Fazer Login
  // ============================================================
  // async = função assíncrona (pode esperar requisição HTTP sem travar)
  // const handleLogin = (e: React.FormEvent) => {...}
  // e = evento do formulário
  const handleLogin = async (e: React.FormEvent) => {
    // Quando formula é submetido (clica "Entrar"), isso é chamado

    // e.preventDefault() = "não recarregue a página"
    // Sem isso, formulário recarregaria tudo (comportamento padrão)
    e.preventDefault();

    // Limpa erro anterior (se houver)
    setError(null);

    // ========== VALIDAÇÃO ==========
    // Verifica se usuario e senha não estão vazios

    // usuario.trim() = remove espaços em branco
    // "  " → "" (string vazia)
    if (!usuario.trim() || !senha.trim()) {
      // Se faltou algo, mostra erro E para execução
      setError("Usuário e senha são obrigatórios");
      return; // ← SAIR DA FUNÇÃO
    }

    // ========== FAZER REQUISIÇÃO ==========
    try {
      // try = "tente executar isso"
      // Se der erro, vai pro catch

      // Ativa loading (mostra spinner de carregamento)
      setIsLoading(true);

      // CHAMADA À API
      // apiFetch<AuthResponse> = faz requisição HTTP e espera AuthResponse
      // "/auth/login" = endpoint do backend
      // { method: "POST", ... } = configurações da requisição
      const response = await apiFetch<AuthResponse>("/auth/login", {
        // POST = enviar dados (não GET que pede)
        method: "POST",

        // body = corpo da requisição (JSON)
        // JSON.stringify = converte objeto JavaScript para texto JSON
        // { usuario: "MateusNascimento", senha: "mateus123" }
        body: JSON.stringify({ usuario, senha }),

        // Nota: headers (Authorization) são adicionados automaticamente por apiFetch
        // Se tiver token no sessionStorage, adiciona automaticamente
      });

      // ========== GUARDAR TOKENS ==========
      // sessionStorage = armazenamento do navegador (desaparece ao fechar aba)
      // sessionStorage.setItem("chave", "valor") = guarda dados
      // sessionStorage.getItem("chave") = recupera dados

      // Guarda access token (para fazer requisições à API)
      sessionStorage.setItem("accessToken", response.accessToken);

      // Guarda refresh token (para renovar access quando expirar)
      sessionStorage.setItem("refreshToken", response.refreshToken);

      // Guarda nome do usuário (para mostrar "Bem-vindo, Mateus")
      sessionStorage.setItem("userUsuario", usuario);

      // ========== REDIRECIONAR ==========
      // router.replace("/") = vai para página home
      // replace = não deixa volta no histórico (clean)
      router.replace("/");
      // Usuário é redirecionado para home automaticamente

    } catch (err) {
      // Se der erro em qualquer lugar do try, entra aqui

      // Extrai mensagem de erro
      // err instanceof Error = verifica se é um Error
      // Se for, use err.message
      // Se não, use mensagem genérica
      setError(
        err instanceof Error ? err.message : "Erro ao fazer login"
      );

    } finally {
      // finally = sempre executa, erro ou não

      // Desativa loading (tira spinner)
      setIsLoading(false);
    }
  };

  // ============================================================
  // RENDERIZAR - Retorna HTML (JSX)
  // ============================================================
  // JSX = mistura de HTML com JavaScript
  // <div> é HTML, {usuario} é JavaScript (variável)

  return (
    // Container principal: min-h-screen = altura mínima da tela
    // bg-... = gradiente de cores de fundo bonito
    // flex items-center justify-center = centraliza conteúdo
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-blue-950 to-blue-700 flex items-center justify-center px-4 py-8">
      {/* Contenedor do formulário: max-w-md = largura máxima */}
      <div className="w-full max-w-md">

        {/* ========== SEÇÃO: LOGO ========== */}
        <div className="text-center mb-8">
          {/* Quadrado branco com "PC" */}
          <div className="w-16 h-16 rounded-2xl bg-white/95 flex items-center justify-center mx-auto mb-4 shadow-2xl ring-1 ring-white/30">
            <span className="text-3xl font-bold text-blue-700">PC</span>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-white tracking-tight">PC Inventory</h1>

          {/* Subtítulo */}
          <p className="text-blue-100 mt-2">Gestão de pedidos, produtos e clientes</p>
        </div>

        {/* ========== SEÇÃO: FORMULÁRIO ========== */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Título "Login" */}
          <h2 className="text-2xl font-bold text-black mb-6">Login</h2>

          {/* ========== MOSTRAR ERRO (se houver) ========== */}
          {error && (
            // && = "e" lógico: só renderiza se error é truthy (não null/undefined/false)
            // Se error é null → não renderiza nada
            // Se error é string → renderiza o div

            <div
              // Caixa vermelha de erro
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6"
              // role="alert" = diz para leitores de tela que é um alerta
              role="alert"
              // aria-live="polite" = atualiza leitores de tela quando muda
              aria-live="polite"
            >
              {/* Conteúdo: a mensagem de erro */}
              {error}
            </div>
          )}

          {/* ========== FORMULÁRIO ========== */}
          <form
            // onSubmit = quando clica "Entrar" ou pressiona Enter
            onSubmit={handleLogin}
            className="space-y-4" // space-y-4 = espaço entre elementos
          >

            {/* ========== INPUT: USUÁRIO ========== */}
            <Input
              label="Usuario" // Label (texto acima)
              type="text" // Tipo de input (texto)
              placeholder="seu.usuario" // Texto de ajuda
              autoComplete="username" // Navegador pode autocompletar
              // value = conteúdo do input (usuario = "")
              // Quando digita, onChange muda usuario
              value={usuario}
              // onChange = função chamada quando digita
              // e.target.value = o que digitou
              // setUsuario(novo_valor) = muda estado
              onChange={(e) => setUsuario(e.target.value)}
              // disabled = desabilita (fica cinza) enquanto carrega
              disabled={isLoading}
            />

            {/* ========== INPUT: SENHA ========== */}
            <Input
              label="Senha"
              type="password" // password = mascara os caracteres (●●●●)
              placeholder="••••••••"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={isLoading}
            />

            {/* ========== BOTÃO: ENTRAR ========== */}
            <button
              type="submit" // submit = ativa onSubmit do form
              disabled={isLoading} // Desabilita enquanto carrega
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors mt-6 flex items-center justify-center gap-2"
            >
              {/* ========== SPINNER (carregamento) ========== */}
              {isLoading && (
                // && = só mostra se isLoading for true

                // Ícone giratório (spinner) enquanto aguarda backend
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true" // Não fala "spinner" para leitores de tela
                />
              )}

              {/* ========== TEXTO DO BOTÃO ========== */}
              <span>
                {/* Se isLoading = true, mostra "Entrando..."
                    Se isLoading = false, mostra "Entrar" */}
                {isLoading ? "Entrando..." : "Entrar"}
              </span>
            </button>
          </form>

          {/* ========== SEÇÃO: CREDENCIAIS DE TESTE ========== */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm font-semibold text-black mb-2">Usuários de teste:</p>

            <div className="text-xs text-gray-700 space-y-1">
              {/* Usuário de teste 1 */}
              <p>👤 MateusNascimento / mateus123</p>

              {/* Usuário de teste 2 */}
              <p>👤 AkiraOliveira / akira123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
