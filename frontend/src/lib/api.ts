const API_URL = "https://localhost:5001/api";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const RETRYABLE_STATUS = [408, 429, 500, 502, 503, 504];

interface ApiErrorResponse {
  mensagem?: string;
  message?: string;
  error?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Obtém access token do sessionStorage
 */
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("accessToken");
}

/**
 * Obtém refresh token do sessionStorage
 */
function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("refreshToken");
}

/**
 * Obtém email do usuário armazenado
 */
function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("userEmail");
}

/**
 * Limpa tokens e redireciona para login
 */
function clearAuthAndRedirect(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("userEmail");
  window.location.href = "/login";
}

/**
 * Extrai mensagem de erro da resposta do servidor
 */
function extractErrorMessage(errorResponse: ApiErrorResponse): string {
  return (
    errorResponse?.mensagem ||
    errorResponse?.message ||
    errorResponse?.error ||
    "Erro ao comunicar com o servidor."
  );
}

/**
 * Aguarda antes de tentar novamente com backoff exponencial
 */
function delayRetry(attempt: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt - 1))
  );
}

/**
 * Tenta renovar access token usando refresh token
 */
async function tryRefreshToken(): Promise<boolean> {
  const email = getUserEmail();
  const refreshToken = getRefreshToken();

  if (!email || !refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(email),
    });

    if (!response.ok) return false;

    const data = (await response.json()) as AuthResponse;
    sessionStorage.setItem("accessToken", data.accessToken);
    return true;
  } catch {
    return false;
  }
}

/**
 * Faz requisição HTTP genérica com JWT, retry automático e refresh de token
 * @template T - Tipo de dado esperado na resposta
 * @param endpoint - Caminho do endpoint (ex: /pedidos)
 * @param options - Opções da requisição (method, body, headers)
 * @throws Error com mensagem do servidor ou genérica
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const token = getAccessToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(typeof options?.headers === "object" ? (options.headers as Record<string, string>) : {}),
      };

      // Adiciona token se disponível (não adiciona em /auth/login)
      if (token && !endpoint.includes("/auth/login")) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: headers as HeadersInit,
        ...options,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({})) as ApiErrorResponse;

        // Token expirado - tenta renovar
        if (response.status === 401 && !endpoint.includes("/auth")) {
          const refreshed = await tryRefreshToken();
          if (refreshed && attempt < MAX_RETRIES) {
            await delayRetry(1);
            continue;
          }
          clearAuthAndRedirect();
          throw new Error("Sessão expirada. Faça login novamente.");
        }

        // Não retry em erros 4xx (exceto 408 e 429)
        if (response.status >= 400 && response.status < 500 && !RETRYABLE_STATUS.includes(response.status)) {
          throw new Error(extractErrorMessage(errorData));
        }

        // Retry em erros 5xx ou rate limit
        if (RETRYABLE_STATUS.includes(response.status)) {
          lastError = new Error(extractErrorMessage(errorData));
          if (attempt < MAX_RETRIES) {
            await delayRetry(attempt);
            continue;
          }
          throw lastError;
        }

        throw new Error(extractErrorMessage(errorData));
      }

      if (response.status === 204) {
        return null as T;
      }

      const data = await response.json();

      // Normaliza resposta de array simples
      if (Array.isArray(data)) {
        return { data } as T;
      }

      return data;
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error("Erro desconhecido ao comunicar com o servidor.");

      // Não retry em erros de client
      if (!(error instanceof Error) || error.message.includes("Failed to fetch")) {
        if (attempt < MAX_RETRIES) {
          await delayRetry(attempt);
          continue;
        }
      }

      if (attempt === MAX_RETRIES) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error("Falha ao comunicar com o servidor.");
}
