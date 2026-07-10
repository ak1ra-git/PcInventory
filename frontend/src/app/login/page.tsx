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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Realiza login e armazena tokens
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email e senha são obrigatórios");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      sessionStorage.setItem("accessToken", response.accessToken);
      sessionStorage.setItem("refreshToken", response.refreshToken);
      sessionStorage.setItem("userEmail", email);

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao fazer login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl font-bold text-blue-600">PC</span>
          </div>
          <h1 className="text-3xl font-bold text-white">PC Inventory</h1>
          <p className="text-blue-100 mt-2">Gestão de Pedidos e Produtos</p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-black mb-6">Login</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors mt-6"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Dados de teste */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm font-semibold text-black mb-2">Usuários de teste:</p>
            <div className="text-xs text-gray-700 space-y-1">
              <p>📧 admin@pcinventory.com / admin123</p>
              <p>📧 user@pcinventory.com / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
