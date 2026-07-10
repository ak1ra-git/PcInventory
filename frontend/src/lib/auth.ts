/**
 * Verifica se usuário está autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!sessionStorage.getItem("accessToken");
}

/**
 * Obtém email do usuário autenticado
 */
export function getCurrentUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("userEmail");
}

/**
 * Realiza logout removendo tokens
 */
export function logout(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("userEmail");
  window.location.href = "/login";
}
