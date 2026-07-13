"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/auth";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/", icon: "🏠" },
  { label: "Novo Pedido", href: "/pedidos/novo", icon: "➕" },
  { label: "Produtos", href: "/produtos", icon: "📦" },
  { label: "Clientes", href: "/clientes", icon: "👥" },
];

/**
 * Renderiza um link de navegação com estado ativo
 */
/**
 * Link de navegação com estado ativo
 */
function NavLink({
  item,
  isActive,
  isMobile = false,
}: {
  item: NavItem;
  isActive: boolean;
  isMobile?: boolean;
}) {
  const baseClasses = "flex items-center gap-1.5 transition-all duration-300 whitespace-nowrap";
  const desktopClasses = isActive
    ? "px-3 py-2 rounded-lg bg-blue-100 text-blue-600 text-sm font-medium"
    : "px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg";
  const mobileClasses = isActive
    ? "px-3 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-medium"
    : "px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg";

  return (
    <Link href={item.href} className={`${baseClasses} ${isMobile ? mobileClasses : desktopClasses}`}>
      <span className="text-sm">{item.icon}</span>
      {item.label}
    </Link>
  );
}

/**
 * Barra de navegação compacta e responsiva
 */
export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-md px-4 py-3 border border-gray-200 max-w-3xl">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
            PC
          </div>
          <span className="font-semibold text-gray-900 text-sm hidden sm:inline">Inventory</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-0.5 items-center flex-1 justify-center">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          suppressHydrationWarning
          className="hidden md:block px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          Sair
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-600 p-0.5 hover:bg-gray-100 rounded transition-colors"
          aria-label="Menu"
          aria-expanded={isOpen}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-1 pt-1 border-t border-gray-200 space-y-0">
          {NAV_ITEMS.map((item) => (
            <div key={item.href} onClick={() => setIsOpen(false)}>
              <NavLink item={item} isActive={isActive(item.href)} isMobile />
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        :global(.md\:hidden + div) {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}
