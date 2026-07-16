"use client";

import { InputHTMLAttributes} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Input customizado com label e mensagem de erro
 */
export default function Input({
  label,
  error,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-black mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
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
