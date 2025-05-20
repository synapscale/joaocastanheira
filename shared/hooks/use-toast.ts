import { useCallback, useState } from "react";

// Hook compartilhado para todo o ecossistema
// Implemente aqui hooks reutilizáveis e use nos apps

export type Toast = {
  id: string;
  title: string;
  description?: string;
  action?: () => void;
  variant?: "success" | "warning" | "destructive";
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toast: Omit<Toast, "id">) => {
    setToasts((prev) => [
      ...prev,
      { ...toast, id: Math.random().toString(36).substr(2, 9) },
    ]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, removeToast };
}
