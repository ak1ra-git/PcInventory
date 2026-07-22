// ============================================================
// NAVBAR - BARRA DE NAVEGAÇÃO RESPONSIVA
// ============================================================
// Componente superior que mostra:
// - Logo "PC Inventory"
// - Links de navegação (Início, Novo Pedido, Produtos, Clientes)
// - Botão "Sair" (logout)
// - Menu mobile em telas pequenas (ícone de hambúrguer)
//
// Adaptável: desktop mostra menu completo, mobile mostra ícone
"use client";

// ============================================================
// IMPORTAÇÕES
// ============================================================
// Link = componente para navegação sem recarregar página
import Link from "next/link";

// usePathname = hook para saber qual rota atual (URL)
// Usado para destacar link ativo
import { usePathname } from "next/navigation";

// useState = gerencia estado (isOpen para menu mobile)
// useEffect = executa verificação de autenticação ao carregar
import { useState, useEffect } from "react";

// logout = função que faz logout do usuário
import { logout } from "@/lib/auth";

// ============================================================
// INTERFACE - Estrutura de cada item do menu
// ============================================================
interface NavItem {
  // label: string;
  // Texto exibido no link (ex: "Produtos")
  label: string;

  // href: string;
  // URL de destino (ex: "/produtos")
  href: string;

  // icon: string;
  // Emoji do ícone (ex: "📦")
  icon: string;
}

// ============================================================
// CONSTANTE - Lista de itens do menu
// ============================================================
// const NAV_ITEMS: NavItem[] = [...]
// Todos os links de navegação
// Centralizado aqui para fácil manutenção
const NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/", icon: "🏠" },  // Home
  { label: "Novo Pedido", href: "/pedidos/novo", icon: "➕" },  // Create order
  { label: "Produtos", href: "/produtos", icon: "📦" },  // Products list
  { label: "Clientes", href: "/clientes", icon: "👥" },  // Clients list
];

// ============================================================
// SUB-COMPONENTE - NavLink (Link individual do menu)
// ============================================================
// Renderiza um <Link> que muda cor se for a página atual
// Exemplo: Página "/produtos" mostra link "Produtos" destacado
function NavLink({
  item,
  isActive,
  isMobile = false,
}: {
  // item = { label, href, icon }
  // NavItem com informações do link
  item: NavItem;

  // isActive = boolean
  // true se a página atual é este link
  isActive: boolean;

  // isMobile = boolean (default false)
  // true = estilos para tela pequena
  // false = estilos para desktop
  isMobile?: boolean;
}) {
  // ========== ESTILOS BASE ==========
  // Aplicados sempre:
  // - flex items-center gap-1.5 = alinha ícone + texto horizontalmente
  // - transition-all duration-300 = cores e espaçamento mudam liso
  // - whitespace-nowrap = texto não quebra em múltiplas linhas
  const baseClasses = "flex items-center gap-1.5 transition-all duration-300 whitespace-nowrap";

  // ========== ESTILOS DESKTOP ==========
  // Aplicados quando isMobile = false
  const desktopClasses = isActive
    // SE É PÁGINA ATUAL:
    ? "px-3 py-2 rounded-lg bg-blue-100 text-blue-600 text-sm font-medium"
    //   bg-blue-100 = fundo azul claro
    //   text-blue-600 = texto azul
    //   font-medium = semi-negrito

    // SE NÃO É PÁGINA ATUAL:
    : "px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg";
    //   text-gray-600 = texto cinza
    //   hover:bg-gray-100 = fundo cinza ao passar mouse

  // ========== ESTILOS MOBILE ==========
  // Aplicados quando isMobile = true (maior padding)
  const mobileClasses = isActive
    // SE É PÁGINA ATUAL:
    ? "px-3 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-medium"
    //   py-2.5 = padding vertical maior (10px vs 8px desktop)

    // SE NÃO É PÁGINA ATUAL:
    : "px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg";

  return (
    // <Link> do Next.js (melhor que <a>, sem recarregar)
    // href={item.href} = para qual URL navegar
    // className = combina base + (mobile ou desktop)
    <Link href={item.href} className={`${baseClasses} ${isMobile ? mobileClasses : desktopClasses}`}>

      // ========== ÍCONE ==========
      // Emoji do link (ex: 📦 para Produtos)
      <span className="text-sm">{item.icon}</span>

      // ========== LABEL ==========
      // Texto do link (ex: "Produtos")
      {item.label}
    </Link>
  );
}

// ============================================================
// COMPONENTE NAVBAR (PRINCIPAL)
// ============================================================
export default function Navbar() {
  // ========== usePathname - DETECTAR ROTA ATUAL ==========
  // const pathname = usePathname();
  // Retorna a URL atual (ex: "/produtos", "/clientes")
  // Usado para saber qual link destacar
  const pathname = usePathname();

  // ========== useState - MENU MOBILE ABERTO/FECHADO ==========
  // const [isOpen, setIsOpen] = useState(false);
  // false = menu fechado (ícone hambúrguer)
  // true = menu aberto (mostra lista de links)
  const [isOpen, setIsOpen] = useState(false);

  // ========== useState - USUÁRIO AUTENTICADO ==========
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // false = usuário não logado
  // true = usuário logado (tem token)
  // Navbar só aparece se autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ========== useState - VERIFICANDO AUTENTICAÇÃO ==========
  // const [isLoading, setIsLoading] = useState(true);
  // true = ainda verificando se tem token
  // false = verificação concluída
  const [isLoading, setIsLoading] = useState(true);

  // ========== useEffect - VERIFICAR TOKEN AO CARREGAR ==========
  // Executado UMA VEZ quando componente monta
  useEffect(() => {
    // ========== VERIFICAR TOKEN ==========
    // const token = sessionStorage.getItem("accessToken");
    // Procura token JWT no sessionStorage (onde login/page.tsx armazenou)
    // Retorna null se não tiver
    const token = sessionStorage.getItem("accessToken");

    // ========== ATUALIZAR ESTADO ==========
    // setIsAuthenticated(!!token);
    // !! = converte para boolean
    // Se token existe -> !!token = true
    // Se token não existe (null) -> !!token = false
    setIsAuthenticated(!!token);

    // ========== TERMINAR VERIFICAÇÃO ==========
    // setIsLoading(false);
    // Diz ao componente que terminou de verificar
    setIsLoading(false);
  }, []);  // [] = executar só uma vez

  // ========== RENDERIZAÇÃO CONDICIONAL ==========
  // if (isLoading || !isAuthenticated) return null;
  // Se ainda está carregando, não renderiza
  // Se não está autenticado, não renderiza
  // Navbar só aparece se usuário está logado
  if (isLoading || !isAuthenticated) {
    return null;
  }

  // ========== FUNÇÃO - isActive ==========
  // Verifica se href é a página atual
  // Exemplo:
  // - Na página "/produtos", isActive("/produtos") = true
  // - Na página "/produtos", isActive("/clientes") = false
  const isActive = (href: string) => {
    // Caso especial: "/" só ativa se pathname for exatamente "/"
    if (href === "/") return pathname === "/";
    // Outros: "/produtos" ativa em "/produtos" e "/produtos/123"
    return pathname.startsWith(href);
  };

  return (
    // ========== NAV (CONTAINER PRINCIPAL) ==========
    // fixed top-2 left-1/2 -translate-x-1/2
    //   = posição fixa no topo, centralizado
    //   = top-2 (8px do topo)
    //   = left-1/2 -translate-x-1/2 (centralizado horizontalmente)
    // z-50 = fica acima de tudo
    // bg-white = fundo branco
    // rounded-lg = bordas arredondadas
    // shadow-md = sombra média
    // px-4 py-3 = padding
    // border border-gray-200 = borda cinza clara
    // max-w-3xl = largura máxima
    <nav className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-md px-4 py-3 border border-gray-200 max-w-3xl">

      // ========== DIV INTERNA ==========
      // flex justify-between items-center
      //   = layout horizontal
      //   = logo esquerda, botões direita
      //   = tudo no meio verticalmente
      <div className="flex justify-between items-center">

        // ========== LOGO ==========
        // <Link> que volta para home
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">

          // ========== CAIXA COM "PC" ==========
          // Quadrado azul com letras brancas
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
            PC
          </div>

          // ========== TEXTO "Inventory" ==========
          // hidden sm:inline = invisível em mobile, visível a partir de 640px
          <span className="font-semibold text-gray-900 text-sm hidden sm:inline">Inventory</span>
        </Link>

        // ========== MENU DESKTOP ==========
        // hidden md:flex = invisível em mobile, flexbox a partir de 768px
        // gap-0.5 = espaço pequeno entre links
        // flex-1 justify-center = ocupa espaço, centraliza links
        <div className="hidden md:flex gap-0.5 items-center flex-1 justify-center">

          // ========== MAPEAR ITEMS ==========
          // NAV_ITEMS.map() = cria um NavLink para cada item
          {NAV_ITEMS.map((item) => (
            // key={item.href} = identificador único (React precisa)
            // isActive(item.href) = verifica se é página atual
            <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
          ))}
        </div>

        // ========== BOTÃO SAIR (LOGOUT) ==========
        // hidden md:block = invisível em mobile, visível em desktop
        // onClick={logout} = função de logout
        // suppressHydrationWarning = avisa React: dados do servidor/cliente diferem (ok)
        //   (Usado porque sessionStorage só funciona no cliente)
        <button
          onClick={logout}
          suppressHydrationWarning

          // Estilos:
          // - px-3 py-2 = padding
          // - text-sm = font pequena
          // - text-red-600 = texto vermelho (ação destrutiva)
          // - hover:bg-red-50 = fundo vermelho muito claro ao passar mouse
          // - rounded-lg = bordas arredondadas
          // - transition-colors = cor muda liso
          // - font-medium = semi-negrito
          className="hidden md:block px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          Sair
        </button>

        // ========== BOTÃO MENU MOBILE ==========
        // md:hidden = só aparece em mobile (< 768px)
        // onClick={() => setIsOpen(!isOpen)} = abre/fecha menu
        // aria-label, aria-expanded = acessibilidade (leitores de tela)
        <button
          onClick={() => setIsOpen(!isOpen)}

          // Estilos:
          // - text-gray-600 = texto cinza
          // - p-0.5 = padding pequeno
          // - hover:bg-gray-100 = fundo cinza ao passar mouse
          // - rounded transition-colors = borda arredondada, cor muda liso
          className="md:hidden text-gray-600 p-0.5 hover:bg-gray-100 rounded transition-colors"

          // Acessibilidade:
          // aria-label = descrição do botão para leitores de tela
          // aria-expanded = indica se menu está aberto/fechado
          aria-label="Menu"
          aria-expanded={isOpen}
        >
          // ========== ÍCONE HAMBÚRGUER / X ==========
          // SVG que muda conforme menu aberto/fechado
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              // Se menu está aberto: mostra X (M6 18L18 6M6 6l12 12)
              // Se menu está fechado: mostra hambúrguer (3 linhas)
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      // ========== MENU MOBILE DROPDOWN ==========
      // {isOpen && (...)} = renderiza só se menu aberto
      // Aparece embaixo do logo quando tela pequena
      {isOpen && (
        <div className="md:hidden mt-1 pt-1 border-t border-gray-200 space-y-0">

          // ========== MAPEAR ITEMS MOBILE ==========
          // NAV_ITEMS.map() = um NavLink para cada item
          {NAV_ITEMS.map((item) => (
            // <div key=...> = container para fechar menu ao clicar
            <div key={item.href} onClick={() => setIsOpen(false)}>

              // NavLink com isMobile=true (estilos mobile)
              <NavLink item={item} isActive={isActive(item.href)} isMobile />
            </div>
          ))}
        </div>
      )}

      // ========== ESTILOS CSS ==========
      // <style jsx> = scoped styles (só afeta este componente)
      <style jsx>{`
        // ========== ANIMAÇÃO slideDown ==========
        // Menu mobile desliza para baixo ao abrir
        @keyframes slideDown {
          from {
            opacity: 0;              // Invisível
            transform: translateY(-8px);  // 8px acima
          }
          to {
            opacity: 1;              // Visível
            transform: translateY(0);    // Posição correta
          }
        }

        // ========== APLICAR ANIMAÇÃO ==========
        // Quando menu mobile renderiza, anima deslizando
        :global(.md\:hidden + div) {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}
