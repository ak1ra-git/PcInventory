import type { Metadata } from "next";
import NavbarWrapper from "@/components/NavbarWrapper";
import "./globals.css";

const APP_METADATA: Metadata = {
  title: "PC Inventory",
  description: "Sistema de gestão de inventário de computadores",
};

export const metadata = APP_METADATA;

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Componente raiz de layout da aplicação
 * Fornece estrutura comum com navegação e estilos globais
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50">
        <NavbarWrapper />
        <main className="pt-20 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
