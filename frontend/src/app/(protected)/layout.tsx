import ProtectedRoute from "@/components/ProtectedRoute";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout para rotas protegidas por autenticação
 */
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
