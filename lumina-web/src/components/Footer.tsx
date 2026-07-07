"use client";

import React from "react";
import { getExplorerUrls } from "@/lib/explorer";
import { useChain } from "@/context/ChainContext";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { selectedNetwork } = useChain();
  const urls = getExplorerUrls(selectedNetwork);

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card-bg)] backdrop-blur-md mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: Brand & Desc */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-[var(--foreground)]">Lumina</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed max-w-sm">
              Infraestructura de confianza para presupuestos de RSE (Responsabilidad Social Empresaria) en Stellar y Soroban.
            </p>
          </div>

          {/* Col 2: Smart Contracts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Contratos Inteligentes</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={urls.contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--teal)] hover:text-[var(--green)] hover:underline flex items-center gap-1 font-mono break-all"
                >
                  {urls.contractLabel}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href={urls.usdcUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--teal)] hover:text-[var(--green)] hover:underline flex items-center gap-1 font-mono break-all"
                >
                  {urls.usdcLabel}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Recursos</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/gabriel-alejandropereagarcia/LUMINA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 transition-colors"
                >
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  GitHub (Open Source)
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>

              <li>
                <span className="text-xs text-[var(--muted)]">
                  Red Activa: {urls.name}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--muted)]">
            Lumina Protocol © {currentYear} — Desarrollado en Stellar para PULSO Hackathon
          </p>
          <div className="flex gap-4 text-xs text-[var(--muted)]">
            <span>Transparencia ESG</span>
            <span>•</span>
            <span>Trazabilidad On-Chain</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
