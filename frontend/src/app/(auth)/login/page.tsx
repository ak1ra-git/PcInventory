"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Input from "@/components/Input";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Página de login com autenticação JWT
 */
export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Realiza login e armazena tokens
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!usuario.trim() || !senha.trim()) {
      setError("Usuário e senha são obrigatórios");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ usuario, senha }),
      });

      sessionStorage.setItem("accessToken", response.accessToken);
      sessionStorage.setItem("refreshToken", response.refreshToken);
      sessionStorage.setItem("userUsuario", usuario);

      router.replace("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao fazer login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-blue-950 to-blue-700 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/95 flex items-center justify-center mx-auto mb-4 shadow-2xl ring-1 ring-white/30">
            <span className="text-3xl font-bold text-blue-700">PC</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">PC Inventory</h1>
          <p className="text-blue-100 mt-2">Gestão de pedidos, produtos e clientes</p>
        </div>

        {/* Formulário */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-black mb-6">Login</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Usuario"
              type="text"
              placeholder="seu.usuario"
              autoComplete="username"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              disabled={isLoading}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors mt-6 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
              )}
              <span>{isLoading ? "Entrando..." : "Entrar"}</span>
            </button>
          </form>

          {/* Dados de teste */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm font-semibold text-black mb-2">Usuários de teste:</p>
            <div className="text-xs text-gray-700 space-y-1">
              <p>👤 MateusNascimento / mateus123</p>
              <p>👤 AkiraOliveira / akira123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
