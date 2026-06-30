"use client";

import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X, ExternalLink } from "lucide-react";
import { useToast, Toast as ToastType } from "@/context/ToastContext";
import { txUrl } from "@/lib/explorer";

const iconMap = {
  success: <CheckCircle className="h-5 w-5 text-[var(--green)] shrink-0" />,
  error: <XCircle className="h-5 w-5 text-[var(--danger)] shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-[var(--warn)] shrink-0" />,
  info: <Info className="h-5 w-5 text-[var(--teal)] shrink-0" />,
};

const borderMap = {
  success: "border-l-4 border-l-[var(--green)]",
  error: "border-l-4 border-l-[var(--danger)]",
  warning: "border-l-4 border-l-[var(--warn)]",
  info: "border-l-4 border-l-[var(--teal)]",
};

const ToastItem: React.FC<{ toast: ToastType; onClose: () => void }> = ({ toast, onClose }) => {
  const { id, type, title, message, txHash, duration = type === "error" ? 8000 : 5000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)] shadow-xl backdrop-blur-md transition-all duration-300 transform translate-x-0 ${borderMap[type]}`}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{iconMap[type]}</div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-semibold text-[var(--foreground)] font-sans">{title}</h4>
            {message && <p className="text-xs text-[var(--muted)] leading-relaxed font-sans">{message}</p>}
            {txHash && (
              <a
                href={txUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--teal)] hover:text-[var(--green)] hover:underline transition-colors font-mono"
              >
                Ver en Stellar Expert
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-0.5 rounded-lg hover:bg-[var(--teal-light)] shrink-0"
            aria-label="Cerrar notificación"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="h-1 bg-[var(--border)] w-full">
        <div
          className={`h-full transition-all linear`}
          style={{
            backgroundColor: `var(--${type === "success" ? "green" : type === "error" ? "danger" : type === "warning" ? "warn" : "teal"})`,
            animation: `shrinkWidth ${duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      style={{ isolation: "isolate" }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};
