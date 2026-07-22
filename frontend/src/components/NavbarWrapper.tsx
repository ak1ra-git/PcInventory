// ============================================================
// NAVBAR WRAPPER - WRAPPER PARA CARREGAR NAVBAR APENAS NO CLIENTE
// ============================================================
// Componente intermediário que carrega Navbar sem renderizar no servidor
// Evita erro de "hydration mismatch" porque Navbar usa sessionStorage
//
// Por quê?
// - Navbar acessa sessionStorage (apenas cliente tem acesso)
// - Se renderizar no servidor, causaria erro
// - Este wrapper usa dynamic import com ssr: false
// - Resultado: Navbar renderiza SÓ no navegador do usuário
//
// Fluxo:
// 1. layout.tsx importa <NavbarWrapper />
// 2. NavbarWrapper usa dynamic para carregar <Navbar />
// 3. Navbar renderiza só no cliente (não no servidor)
// 4. Não há mais erros de sessionStorage no servidor
"use client";

// ============================================================
// IMPORTAÇÕES
// ============================================================
// dynamic = função do Next.js para lazy loading de componentes
// Permite carregar componente só quando necessário
import dynamic from "next/dynamic";

// ============================================================
// DYNAMIC IMPORT - Carregar Navbar apenas no cliente
// ============================================================
// const Navbar = dynamic(..., { ssr: false });
// - dynamic(...) = importa componente de forma preguiçosa
// - () => import(...) = função que importa (executada depois)
// - { ssr: false } = não renderizar no servidor, só no cliente
//
// Sem ssr: false:
// - Navbar renderiza no servidor Next.js
// - sessionStorage.getItem() falha (não existe no servidor)
// - Erro: "sessionStorage is not defined"
//
// Com ssr: false:
// - Navbar não renderiza no servidor
// - Renderiza só no navegador do usuário
// - sessionStorage funciona normalmente
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });

// ============================================================
// COMPONENTE NAVBAR WRAPPER
// ============================================================
// Simples wrapper que renderiza o Navbar
// Este arquivo está aqui APENAS para evitar problemas de hydration
export default function NavbarWrapper() {
  return <Navbar />;
}
