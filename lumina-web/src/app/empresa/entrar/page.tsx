"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEmpresaSession } from "@/hooks/useEmpresaSession";

function EntrarInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useEmpresaSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token")?.trim() ?? "";
    if (!token) {
      setError("Pegá el link que te mandó Lumina.");
      return;
    }
    let cancelled = false;
    fetch("/api/empresa/session/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Ese link ya no sirve.");
        if (cancelled) return;
        await refresh();
        router.replace("/empresa/portal");
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Ese link ya no sirve.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [params, router, refresh]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-sm text-[var(--muted)]">{error}</p>
        <Link href="/empresa" className="text-teal-600 text-sm underline">
          Pedir un link nuevo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-sm text-[var(--muted)]">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      Abriendo tu tablero…
    </div>
  );
}

export default function EmpresaEntrarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-sm text-[var(--muted)]">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Abriendo tu tablero…
        </div>
      }
    >
      <EntrarInner />
    </Suspense>
  );
}
