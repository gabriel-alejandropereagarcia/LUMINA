"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, Printer } from "lucide-react";
import CertificadoDoc from "@/components/empresa/CertificadoDoc";
import type { Certificado } from "@/lib/empresa/types";

export default function CertificadoPublicPage() {
  const params = useParams<{ id: string }>();
  const [certificado, setCertificado] = useState<Certificado | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;
    fetch(`/api/empresa/certificados/${params.id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No encontrado.");
        if (!cancelled) setCertificado(data.certificado);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error.");
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-sm text-[var(--muted)]">{error}</p>
        <Link href="/empresa" className="text-teal-600 text-sm underline">
          Volver al portal Empresa
        </Link>
      </div>
    );
  }

  if (!certificado) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-sm text-[var(--muted)]">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Cargando certificado…
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-10 sm:px-6 space-y-6 print:p-0 print:min-h-0">
      <div className="max-w-[800px] mx-auto flex items-center justify-between gap-3 print:hidden">
        <Link href="/empresa/portal" className="text-xs text-teal-600 underline">
          Volver al portal
        </Link>
        <button
          id="btn-certificado-imprimir"
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5" />
          Imprimir / Guardar PDF
        </button>
      </div>
      <CertificadoDoc certificado={certificado} />
    </div>
  );
}
