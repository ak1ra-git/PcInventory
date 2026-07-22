// ============================================================
// "use client" - DECLARA QUE ESTE COMPONENTE RODA NO NAVEGADOR
// ============================================================
// Sem isso, React tentaria renderizar no servidor (não funcionaria)
// Necessário para: useState, hooks, eventos como onClick, etc
"use client";

// ============================================================
// IMPORTAÇÕES
// ============================================================
// InputHTMLAttributes = tipo TypeScript com TODAS as props de <input>
// Inclui: type, placeholder, disabled, value, onChange, id, name, etc
import { InputHTMLAttributes } from "react";

// ============================================================
// INTERFACE TYPESCRIPT - Define quais props o componente aceita
// ============================================================
// interface InputProps = contrato de props do componente
// extends InputHTMLAttributes = herda TODAS as propriedades de <input>
// Isso deixa reutilizável, aceitando qualquer prop de input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // label?: string;
  // ? = opcional
  // Texto que aparece acima do input (ex: "Usuário", "Senha", "Email")
  label?: string;

  // error?: string;
  // Mensagem de erro para mostrar abaixo
  // undefined/null = sem erro (input normal)
  // string = tem erro (input fica vermelho)
  error?: string;
}

// ============================================================
// COMPONENTE REACT - Função que retorna HTML/JSX
// ============================================================
// export default = exporte este como componente principal
// function Input = nome do componente (sempre PascalCase)
// {label, error, ...props} = desestruturação das props
//   - label, error = props específicas do Input
//   - ...props = TODAS as outras props (type, placeholder, disabled, etc)
export default function Input({
  label,
  error,
  ...props
}: InputProps) {
  // ========== RENDERIZAR COMPONENTE ==========
  // Retorna JSX (HTML + JavaScript misturados)
  return (
    // Container: w-full = 100% de largura
    <div className="w-full">

      // ========== LABEL (TEXTO ACIMA DO INPUT) ==========
      // {label && (...)} = renderiza APENAS se label existe
      // Se label é undefined/null/vazio, não renderiza nada
      {label && (
        // <label> = elemento HTML que associa texto com input
        // className = estilos Tailwind CSS
        //   - block = display: block (preenche linha)
        //   - text-sm = fonte pequena
        //   - font-medium = peso semi-negrito
        //   - text-black = cor preta
        //   - mb-2 = margem inferior (espaço entre label e input)
        <label className="block text-sm font-medium text-black mb-2">
          // {label}
          // Renderiza o texto do label (ex: "Usuário", "Senha")
          {label}
        </label>
      )}

      // ========== INPUT (CAMPO DE ENTRADA) ==========
      // {...props} = expande TODAS as outras props
      // Exemplo: type="text", placeholder="Digite", disabled={true}, etc
      // Qualquer coisa que passar no componente (exceto label/error) vai aqui
      <input
        {...props}

        // className = estilos Tailwind CSS
        // Usa template string (backtick) para CSS dinâmico
        className={`
          // Estilos normais (sempre aplicados):
          // w-full = 100% de largura
          // px-4 py-2 = padding (espaço interno)
          // border-2 = borda de 2px
          // rounded-lg = bordas arredondadas
          // transition-colors = anima cor suavemente
          // focus:outline-none = sem outline ao focar
          // text-black = texto preto
          w-full px-4 py-2 border-2 rounded-lg transition-colors focus:outline-none text-black ${
            // CONDICIONAL: cores dependem se tem erro
            error
              // SE TEM ERRO (error é string):
              ? "border-red-500 focus:border-red-600 bg-red-50"
              //   border-red-500 = borda vermelha
              //   focus:border-red-600 = borda mais vermelha ao focar
              //   bg-red-50 = fundo levemente vermelho

              // SE NÃO TEM ERRO (error é undefined/null):
              : "border-gray-200 focus:border-blue-500 bg-white"
              //   border-gray-200 = borda cinza clara
              //   focus:border-blue-500 = borda azul ao focar
              //   bg-white = fundo branco
          }`}
      />

      // ========== MENSAGEM DE ERRO ==========
      // {error && <p>...} = renderiza APENAS se error existe
      // Se error é undefined/null, não renderiza
      {error && (
        // <p> = parágrafo (texto)
        // className = estilos de erro
        //   - text-red-500 = texto vermelho
        //   - text-sm = fonte pequena
        //   - mt-1 = margem superior (espaço com input)
        <p className="text-red-500 text-sm mt-1">
          // {error}
          // Mostra mensagem de erro
          // Exemplo: "Email inválido", "Senha obrigatória"
          {error}
        </p>
      )}
    </div>
  );
}
