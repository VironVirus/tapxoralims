"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string | null;
  durationMs?: number;
  variant?: ToastVariant;
};

type ToastRecord = ToastInput & {
  id: string;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function getTone(variant: ToastVariant) {
  if (variant === "success") {
    return {
      card: "border-emerald-200 bg-emerald-50 text-emerald-950",
      icon: <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" />
    };
  }

  if (variant === "error") {
    return {
      card: "border-red-200 bg-red-50 text-red-950",
      icon: <AlertTriangle className="mt-0.5 h-4 w-4 text-red-700" />
    };
  }

  return {
    card: "border-blue-200 bg-white/95 text-slate-950",
    icon: <Info className="mt-0.5 h-4 w-4 text-blue-700" />
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ durationMs = 4000, variant = "info", ...input }: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setToasts((current) => [...current, { ...input, durationMs, id, variant }]);

      window.setTimeout(() => {
        dismiss(id);
      }, durationMs);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((item) => {
          const tone = getTone(item.variant ?? "info");

          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto rounded-2xl border p-4 shadow-lg backdrop-blur",
                tone.card
              )}
              role="status"
            >
              <div className="flex items-start gap-3">
                {tone.icon}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => dismiss(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
