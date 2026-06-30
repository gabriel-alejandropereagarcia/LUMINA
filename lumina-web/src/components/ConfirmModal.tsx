"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "warning",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      />

      {/* Modal Dialog */}
      <div className="glass-card relative max-w-md w-full p-6 rounded-2xl border border-[var(--border)] shadow-2xl backdrop-blur-md z-10 transform scale-100 transition-all duration-300">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1 rounded-lg hover:bg-[var(--teal-light)]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`p-3 rounded-full ${isDanger ? "bg-red-500/10 text-red-500" : "bg-[var(--gold-light)] text-[var(--gold)]"}`}>
            {isDanger ? (
              <Trash2 className="h-6 w-6 animate-pulse" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-serif font-bold text-[var(--foreground)]">
              {title}
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full pt-4">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--teal-light)] py-3 text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 rounded-xl py-3 text-xs font-bold text-[var(--foreground)] shadow-md transition-all active:scale-95 cursor-pointer ${
                isDanger 
                  ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700" 
                  : "bg-gradient-to-r from-amber-500 to-[var(--gold)] hover:from-amber-600 hover:to-[var(--gold)]"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
