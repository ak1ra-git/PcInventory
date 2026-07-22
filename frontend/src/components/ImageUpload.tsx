// ============================================================
// IMAGE UPLOAD - COMPONENTE DE UPLOAD DE IMAGENS
// ============================================================
// Permite usuário selecionar imagem, converte para Base64
// Mostra preview da imagem selecionada
// Valida tamanho (máx 5MB) e tipo (image/*)
//
// Exemplo de uso:
// <ImageUpload
//   onImageSelect={(base64) => setProductImage(base64)}
//   currentImage={existingImage}
//   label="Escolha foto do produto"
// />
"use client";

// ============================================================
// IMPORTAÇÕES
// ============================================================
// useState = hook para gerenciar estado (preview, loading)
// useRef = hook para referenciar elemento DOM (input file)
import { useState, useRef } from "react";

// Image = componente otimizado do Next.js
// Melhor que <img> (lazy loading, responsive, etc)
import Image from "next/image";

// ============================================================
// INTERFACE - Define props do componente
// ============================================================
interface ImageUploadProps {
  // onImageSelect: (base64: string) => void;
  // Função chamada quando imagem é selecionada
  // Recebe a string Base64 da imagem
  // Exemplo:
  // onImageSelect={(base64) => {
  //   console.log("Imagem selecionada:", base64.substring(0, 50) + "...")
  //   setProductImage(base64)
  // }}
  onImageSelect: (base64: string) => void;

  // currentImage?: string;
  // ? = opcional
  // String Base64 de imagem existente (para editar)
  // Se não passar, começa vazio
  currentImage?: string;

  // label?: string;
  // Texto que aparece quando não tem imagem
  // Default = "Selecione uma imagem"
  label?: string;
}

// ============================================================
// COMPONENTE IMAGE UPLOAD
// ============================================================
export default function ImageUpload({
  onImageSelect,
  currentImage,
  label = "Selecione uma imagem",  // Valor padrão se não passar label
}: ImageUploadProps) {

  // ============================================================
  // useRef - REFERÊNCIA AO INPUT FILE
  // ============================================================
  // const fileInputRef = useRef<HTMLInputElement>(null);
  // Cria referência ao elemento <input type="file">
  // Permite chamar fileInputRef.current?.click() para abrir seletor
  //
  // Por que useRef?
  // - Não precisa recriar a cada render
  // - Não causa re-render quando muda
  // - Permite acessar elemento DOM direto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // useState - PREVIEW DA IMAGEM
  // ============================================================
  // const [preview, setPreview] = useState<string | undefined>(currentImage);
  // preview = string Base64 ou undefined
  // Inicializa com currentImage (ou undefined se não tiver)
  // Armazena a imagem que será exibida no preview
  //
  // Exemplo:
  // preview = undefined (não tem imagem selecionada)
  // preview = "data:image/png;base64,iVBORw0KG..." (tem imagem)
  const [preview, setPreview] = useState<string | undefined>(currentImage);

  // ============================================================
  // useState - ESTADO DE CARREGAMENTO
  // ============================================================
  // const [loading, setLoading] = useState(false);
  // loading = true quando processando imagem
  // loading = false quando completo
  // Desabilita input enquanto carrega
  const [loading, setLoading] = useState(false);

  // ============================================================
  // FUNÇÃO - handleFileChange
  // ============================================================
  // Executada quando usuário seleciona arquivo
  // - Valida tipo (deve ser imagem)
  // - Valida tamanho (máximo 5MB)
  // - Converte para Base64
  // - Chama onImageSelect com a imagem
  const handleFileChange = async (
    // event = evento do <input> (contém arquivo selecionado)
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // ========== EXTRAIR ARQUIVO ==========
    // const file = event.target.files?.[0];
    // event.target = elemento <input>
    // event.target.files = lista de arquivos selecionados
    // ?.[0] = primeiro arquivo (ou undefined se nenhum)
    const file = event.target.files?.[0];

    // ========== VALIDAÇÃO: ARQUIVO EXISTE ==========
    // if (!file) return;
    // Se usuário cancelou (clicou X), file é undefined
    // Retorna para não fazer nada
    if (!file) return;

    // ========== VALIDAÇÃO: TIPO DE ARQUIVO ==========
    // if (!file.type.startsWith("image/")) { ... }
    // file.type = "image/png", "image/jpeg", "image/gif", etc
    // startsWith("image/") = verifica se começa com "image/"
    // Se for PDF, documento, etc = mostra erro
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida");
      return;
    }

    // ========== VALIDAÇÃO: TAMANHO DO ARQUIVO ==========
    // if (file.size > 5 * 1024 * 1024) { ... }
    // file.size = tamanho em bytes
    // 5 * 1024 * 1024 = 5MB em bytes
    // Exemplo: arquivo 6MB será rejeitado
    if (file.size > 5 * 1024 * 1024) {
      alert("Imagem muito grande (máximo 5MB)");
      return;
    }

    // ========== ATIVAR LOADING ==========
    // setLoading(true) = mostra "Processando..." para usuário
    setLoading(true);

    // ========== CONVERTER PARA BASE64 ==========
    // const reader = new FileReader();
    // FileReader = objeto que lê arquivo do computador
    // Converte arquivo binário em Base64 (texto)
    const reader = new FileReader();

    // reader.onload = (e) => { ... }
    // Chamada quando FileReader termina leitura
    // e.target?.result = string Base64 da imagem
    reader.onload = (e) => {
      // ========== EXTRAIR BASE64 ==========
      // const base64 = e.target?.result as string;
      // ?. = optional chaining (seguro se e.target for null)
      // as string = conversão de tipo (TypeScript)
      // Resultado: "data:image/png;base64,iVBORw0KG..."
      const base64 = e.target?.result as string;

      // ========== ATUALIZAR PREVIEW ==========
      // setPreview(base64) = exibe imagem no componente
      setPreview(base64);

      // ========== CHAMAR CALLBACK ==========
      // onImageSelect(base64) = avisa componente pai sobre a imagem
      // Componente pai pode salvar no estado, enviar servidor, etc
      onImageSelect(base64);

      // ========== DESATIVAR LOADING ==========
      // Terminou processamento, mostra resultado
      setLoading(false);
    };

    // ========== INICIAR LEITURA ==========
    // reader.readAsDataURL(file);
    // Começa leitura do arquivo como Data URL
    // Formato: "data:image/png;base64,..."
    reader.readAsDataURL(file);
  };

  return (
    // ========== CONTAINER PRINCIPAL ==========
    // flex flex-col = layout vertical
    // gap-4 = espaço entre elementos
    <div className="flex flex-col gap-4">

      // ========== ÁREA DE UPLOAD (clicável) ==========
      // onClick={() => fileInputRef.current?.click()}
      // Clique abre seletor de arquivo (simula clique no input)
      <div
        onClick={() => fileInputRef.current?.click()}

        // Estilos:
        // - border-2 border-dashed = borda tracejada
        // - border-gray-300 = cor cinza
        // - rounded-lg = bordas arredondadas
        // - p-8 = padding grande
        // - text-center = centraliza texto
        // - cursor-pointer = cursor de mão (clickable)
        // - hover:border-blue-500 = borda fica azul ao passar mouse
        // - transition-colors = cor muda suavemente
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
      >

        // ========== RENDERIZAÇÃO CONDICIONAL ==========
        // {preview ? (...) : (...)}
        // Se preview existe = mostra imagem
        // Se preview vazio = mostra emoji + texto
        {preview ? (

          // ========== JÁ TEM IMAGEM SELECIONADA ==========
          <div className="flex flex-col items-center gap-2">

            // ========== PREVIEW DA IMAGEM ==========
            // <Image src={preview} ... />
            // Componente otimizado do Next.js
            // unoptimized = não tenta otimizar (é Base64, já otimizada)
            <Image
              src={preview}
              alt="Preview"
              width={128}
              height={128}
              unoptimized

              // Estilos:
              // - h-32 w-32 = 128x128 pixels (quadrado)
              // - object-cover = mantém proporção, preenche espaço
              // - rounded = bordas levemente arredondadas
              className="h-32 w-32 object-cover rounded"
            />

            // ========== TEXTO DE INSTRUÇÃO ==========
            // Diz ao usuário que pode clicar para mudar imagem
            <p className="text-sm text-gray-600">Clique para alterar imagem</p>
          </div>

        ) : (

          // ========== NÃO TEM IMAGEM SELECIONADA ==========
          <div className="flex flex-col items-center gap-2">

            // ========== EMOJI CÂMERA ==========
            // Ícone visual indicando upload
            <span className="text-4xl">📷</span>

            // ========== TEXTO PRINCIPAL ==========
            // {label} = "Selecione uma imagem" ou custom
            <p className="text-sm text-gray-600">{label}</p>

            // ========== TEXTO SECUNDÁRIO ==========
            // Instrução adicional (opcional)
            <p className="text-xs text-gray-500">ou arraste uma imagem</p>
          </div>
        )}
      </div>

      // ========== INPUT FILE OCULTO ==========
      // type="file" = seletor de arquivo
      // ref={fileInputRef} = referência para abrir programaticamente
      // accept="image/*" = só aceita arquivos de imagem
      // onChange={handleFileChange} = executado ao selecionar
      // disabled={loading} = desabilita enquanto processa
      // className="hidden" = oculto (não aparece visualmente)
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
        className="hidden"
      />

      // ========== MENSAGEM DE CARREGAMENTO ==========
      // {loading && <p>...}
      // Mostra "Processando..." só enquanto loading é true
      // Desaparece assim que termina
      {loading && <p className="text-sm text-gray-600">Processando...</p>}
    </div>
  );
}
