import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware simples que permite todas as rotas
 * Proteção real é feita no cliente via ProtectedRoute
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplica middleware apenas a rotas de API
    "/api/:path*",
  ],
};
