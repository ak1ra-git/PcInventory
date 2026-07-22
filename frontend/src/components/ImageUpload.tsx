"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  currentImage?: string;
  label?: string;
}

export default function ImageUpload({
  onImageSelect,
  currentImage,
  label = "Selecione uma imagem",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Valida tipo de arquivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida");
      return;
    }

    // Valida tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Imagem muito grande (máximo 5MB)");
      return;
    }

    setLoading(true);

    // Converte para Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onImageSelect(base64);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
      >
        {preview ? (
          <div className="flex flex-col items-center gap-2">
            <Image
              src={preview}
              alt="Preview"
              width={128}
              height={128}
              unoptimized
              className="h-32 w-32 object-cover rounded"
            />
            <p className="text-sm text-gray-600">Clique para alterar imagem</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">📷</span>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-xs text-gray-500">ou arraste uma imagem</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
        className="hidden"
      />

      {loading && <p className="text-sm text-gray-600">Processando...</p>}
    </div>
  );
}
