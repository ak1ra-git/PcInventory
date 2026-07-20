"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop com animação */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 animate-fadeIn"
        onClick={onCancel}
      />

      {/* Modal com animação */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-slideUp p-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-600 text-2xl">⚠️</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? "Deletando..." : "Deletar"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        :global(.animate-fadeIn) {
          animation: fadeIn 0.3s ease-out;
        }
        :global(.animate-slideUp) {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
