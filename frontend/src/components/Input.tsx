"use client";

import { InputHTMLAttributes, useState } from "react";
import { maskCnpj, unmaskCnpj, maskCpf, unmaskCpf, maskDate, unmaskDate, maskCurrency, unmaskCurrency } from "@/lib/masks";

type MaskType = "cnpj" | "cpf" | "date" | "currency" | null;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mask?: MaskType;
  onUnmaskedChange?: (unmaskedValue: string) => void;
}

const MASK_FUNCTIONS: Record<MaskType, { mask: (v: string) => string; unmask: (v: string) => string }> = {
  cnpj: { mask: maskCnpj, unmask: unmaskCnpj },
  cpf: { mask: maskCpf, unmask: unmaskCpf },
  date: { mask: maskDate, unmask: unmaskDate },
  currency: { mask: maskCurrency, unmask: unmaskCurrency },
  null: { mask: (v) => v, unmask: (v) => v },
};

/**
 * Input customizado com label, mensagem de erro e máscaras de formatação
 * @param mask - Tipo de máscara a aplicar (cnpj, cpf, date, currency)
 * @param onUnmaskedChange - Callback com valor desmascarado para envio ao servidor
 */
export default function Input({
  label,
  error,
  mask = null,
  onUnmaskedChange,
  onChange,
  value,
  ...props
}: InputProps) {
  const [displayValue, setDisplayValue] = useState<string>(value?.toString() || "");
  const maskFns = MASK_FUNCTIONS[mask];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const maskedValue = maskFns.mask(inputValue);
    const unmaskedValue = maskFns.unmask(inputValue);

    // Se não tem máscara, passa o valor como está
    if (!mask) {
      onChange?.(e);
    } else {
      // Se tem máscara, usa o valor mascarado
      setDisplayValue(maskedValue);
      onUnmaskedChange?.(unmaskedValue);
    }
  };

  // Para inputs sem máscara, usa value prop. Para inputs com máscara, usa displayValue
  const inputValue = mask ? displayValue : (value || "");

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-black mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        value={inputValue}
        onChange={handleChange}
        className={`w-full px-4 py-2 border-2 rounded-lg transition-colors focus:outline-none text-black ${
          error
            ? "border-red-500 focus:border-red-600 bg-red-50"
            : "border-gray-200 focus:border-blue-500 bg-white"
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
