"use client";

import { useEffect, useMemo, useState } from "react";
import { txUrl } from "@/lib/explorer";
import type { ReciboPaso, ReciboVivo } from "@/lib/empresa/recibos";
import { etiquetaVivo } from "@/lib/empresa/recibos";

export default function RecibosMovimiento({ pasos }: { pasos: ReciboPaso[] }) {
  const hashes = useMemo(
    () => pasos.map((paso) => paso.hash).filter((item): item is string => Boolean(item)),
    [pasos],
  );
  const [vivos, setVivos] = useState<Record<string, ReciboVivo>>({});

  useEffect(() => {
    if (hashes.length === 0) return;
    let cancelled = false;
    fetch(`/api/empresa/recibos?h=${hashes.join(",")}`)
      .then(async (response) => {
        const data = await response.json();
        const next: Record<string, ReciboVivo> = {};
        for (const item of (data.recibos ?? []) as ReciboVivo[]) {
          next[item.hash] = item;
        }
        if (!cancelled) setVivos(next);
      })
      .catch(() => {
        /* el enlace al recibo sigue alcanzando */
      });
    return () => {
      cancelled = true;
    };
  }, [hashes]);

  return (
    <ul className="space-y-1.5 text-xs">
      {pasos.map((paso) => {
        const vivo = paso.hash ? vivos[paso.hash.toLowerCase()] : undefined;
        const extra = etiquetaVivo(vivo);
        if (paso.hash) {
          return (
            <li key={paso.key} className="leading-relaxed">
              <a
                href={txUrl(paso.hash)}
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 underline"
              >
                {paso.label}
              </a>
              {extra ? <span className="block text-[var(--muted)]">{extra}</span> : null}
            </li>
          );
        }
        return (
          <li key={paso.key} className="leading-relaxed text-[var(--muted)]">
            {paso.label} · en trabajo
          </li>
        );
      })}
    </ul>
  );
}
