"use client";

import { useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import RecibosMovimiento from "@/components/empresa/RecibosMovimiento";
import {
  CAMINO_SEMILLA,
  EMPRESA_ANONIMA,
  aristaEncendida,
  grafoHoy,
  grafoHorizonte,
  iluminadosDe,
  pasosDeNodo,
  reciboDeSeleccion,
  type GrafoArista,
  type GrafoCamino,
  type GrafoNodo,
} from "@/lib/empresa/camino";
import type { ReciboPaso } from "@/lib/empresa/recibos";

function fechaCorta(at?: string): string {
  if (!at) return "";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(at));
}

function hrefCamino(vista: "hoy" | "horizonte", nodo?: string | null): string {
  const next = new URLSearchParams();
  if (vista === "horizonte") next.set("vista", "horizonte");
  if (nodo) next.set("nodo", nodo);
  const qs = next.toString();
  return qs ? `/?${qs}` : "/";
}

function pasosDeRecibo(nodo: GrafoNodo, grafo: GrafoCamino): ReciboPaso[] {
  const pasos = pasosDeNodo(nodo, grafo);
  return [
    { key: "paid", label: "La empresa pagó", hash: pasos.paidHash },
    { key: "chose", label: `La empresa eligió ${pasos.appName}`, hash: pasos.choseHash },
    { key: "charged", label: `${pasos.appName} cobró el 97,5%`, hash: pasos.chargedHash },
  ];
}

function curva(from: GrafoNodo, to: GrafoNodo): string {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  return `M${from.x} ${from.y} Q ${mx} ${(from.y + my) / 2} ${to.x} ${to.y}`;
}

function fillDe(nodo: GrafoNodo): string {
  if (nodo.kind === "lumina") return "#0D5E6A";
  if (nodo.kind === "empresa") return nodo.publico ? "#12352C" : "#0B1C24";
  if (nodo.kind === "app") {
    if (nodo.rama === "educacion") return "#14532D";
    if (nodo.rama === "ambiental") return "#134E4A";
    if (nodo.rama === "deporte") return "#1E3A2F";
    return "#12352C";
  }
  if (nodo.rama === "educacion") return "#86EFAC";
  if (nodo.rama === "ambiental") return "#99F6E4";
  if (nodo.rama === "deporte") return "#BBF7D0";
  return "#5EEAD4";
}

function strokeDe(nodo: GrafoNodo, seleccionado: boolean): string {
  if (seleccionado) return "#ECFEFF";
  if (nodo.kind === "lumina") return "#5EEAD4";
  if (nodo.kind === "app") {
    if (nodo.rama === "educacion") return "#86EFAC";
    if (nodo.rama === "ambiental") return "#5EEAD4";
    if (nodo.rama === "deporte") return "#4ADE80";
    return "#2B9C76";
  }
  if (nodo.kind === "empresa") return nodo.publico ? "#5EEAD4" : "#3D5A66";
  return "#ECFEFF";
}

function GrafoView({
  grafo,
  vista,
  seleccionado,
  onSelect,
}: {
  grafo: GrafoCamino;
  vista: "hoy" | "horizonte";
  seleccionado: string | null;
  onSelect: (id: string | null) => void;
}) {
  const lumina = grafo.nodos.find((item) => item.kind === "lumina");
  const lit = useMemo(
    () => (seleccionado ? iluminadosDe(seleccionado, grafo) : null),
    [seleccionado, grafo],
  );
  const visible = (id: string) => !lit || lit.has(id);
  const edgeOn = (edge: GrafoArista) => !lit || aristaEncendida(edge, lit);

  const tronco = grafo.aristas.filter((edge) => {
    const from = grafo.nodos.find((item) => item.id === edge.from);
    const to = grafo.nodos.find((item) => item.id === edge.to);
    if (!from || !to) return false;
    if (from.kind === "empresa" && to.kind === "trabajo") return Boolean(lit && edgeOn(edge));
    if (to.kind === "empresa" && from.kind === "trabajo") return Boolean(lit && edgeOn(edge));
    return true;
  });

  const viewBox = vista === "hoy" ? "0 0 880 420" : "0 0 1280 820";
  const aria =
    vista === "hoy"
      ? "Hoy: una empresa anónima paga a Lumina. MIRA cobra. Una luz: un cribado el 19 de septiembre. Elegí un nodo para seguir el camino."
      : "Horizonte: muchas empresas y muchas apps pagan y cobran en Lumina. Elegí un nodo: se ilumina lo que se conecta.";

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-auto"
      role="img"
      aria-label={aria}
      onClick={(event) => {
        if (event.target === event.currentTarget) onSelect(null);
      }}
    >
      <defs>
        <filter id={`camino-glow-${vista}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={vista === "hoy" ? 6 : 7} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {tronco.map((edge) => {
        const from = grafo.nodos.find((item) => item.id === edge.from);
        const to = grafo.nodos.find((item) => item.id === edge.to);
        if (!from || !to) return null;
        const on = edgeOn(edge);
        const trabajo = from.kind === "trabajo" || to.kind === "trabajo";
        const publicEmp =
          (from.kind === "empresa" && from.publico) || (to.kind === "empresa" && to.publico);
        return (
          <path
            key={`${edge.from}-${edge.to}`}
            d={curva(from, to)}
            fill="none"
            stroke={on ? (publicEmp || !trabajo ? "#5EEAD4" : "#2B9C76") : "#123040"}
            strokeWidth={on ? (trabajo ? 1.1 : 2) : 0.6}
            opacity={on ? (lit ? 0.95 : trabajo ? 0.45 : 0.7) : 0.08}
            filter={on && !trabajo ? `url(#camino-glow-${vista})` : undefined}
            pointerEvents="none"
          />
        );
      })}
      {grafo.nodos.map((nodo) => {
        const on = visible(nodo.id);
        const isSel = seleccionado === nodo.id;
        const showLabel =
          nodo.kind === "lumina" ||
          nodo.kind === "app" ||
          isSel ||
          (vista === "hoy" && nodo.kind === "empresa") ||
          (vista === "hoy" && nodo.kind === "trabajo");
        const label =
          nodo.kind === "lumina"
            ? "Lumina"
            : nodo.kind === "trabajo" && vista === "hoy"
              ? `1 cribado · ${fechaCorta(CAMINO_SEMILLA.at)}`
              : nodo.label;
        return (
          <a
            key={nodo.id}
            href={hrefCamino(vista, isSel ? null : nodo.id)}
            className="cursor-pointer"
            opacity={on ? 1 : 0.08}
            aria-label={nodo.label}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSelect(isSel ? null : nodo.id);
            }}
          >
            {nodo.kind === "lumina" ? (
              <circle
                cx={nodo.x}
                cy={nodo.y}
                r={nodo.r + 18}
                fill="#0D5E6A"
                opacity="0.2"
                filter={`url(#camino-glow-${vista})`}
                pointerEvents="none"
              />
            ) : null}
            <circle
              cx={nodo.x}
              cy={nodo.y}
              r={isSel ? nodo.r + 4 : nodo.r}
              fill={fillDe(nodo)}
              stroke={strokeDe(nodo, isSel)}
              strokeWidth={isSel ? 2.5 : nodo.kind === "trabajo" ? 0.6 : 2}
              filter={on && nodo.kind !== "empresa" ? `url(#camino-glow-${vista})` : undefined}
            >
              {nodo.kind === "trabajo" && on && !lit ? (
                <animate
                  attributeName="opacity"
                  values="0.45;0.95;0.45"
                  dur={`${2.1 + (nodo.x % 5) * 0.25}s`}
                  repeatCount="indefinite"
                />
              ) : null}
            </circle>
            {showLabel ? (
              <text
                x={nodo.x}
                y={nodo.kind === "lumina" ? nodo.y + 5 : nodo.y + nodo.r + 16}
                textAnchor="middle"
                fill={nodo.kind === "lumina" ? "#ECFEFF" : "#99F6E4"}
                fontSize={nodo.kind === "lumina" ? 13 : 11}
                fontWeight={nodo.kind === "lumina" ? 700 : 500}
                pointerEvents="none"
              >
                {label}
              </text>
            ) : null}
          </a>
        );
      })}
      {vista === "horizonte" && lumina ? (
        <text x="170" y="802" textAnchor="middle" fill="#8BA3B0" fontSize="11">
          {EMPRESA_ANONIMA} · {grafo.nodos.filter((item) => item.kind === "app").length} apps ·{" "}
          {grafo.nodos.filter((item) => item.publico).length} luces públicas
        </text>
      ) : null}
    </svg>
  );
}

function PanelCamino({
  grafo,
  vista,
  seleccionado,
  onHoy,
}: {
  grafo: GrafoCamino;
  vista: "hoy" | "horizonte";
  seleccionado: string | null;
  onHoy: () => void;
}) {
  const nodo = grafo.nodos.find((item) => item.id === seleccionado) ?? null;
  const recibo = seleccionado ? reciboDeSeleccion(seleccionado, grafo) : null;
  const pasos = recibo ? pasosDeRecibo(recibo, grafo) : null;
  const lucesNodo = seleccionado
    ? grafo.nodos.filter(
        (item) => item.kind === "trabajo" && iluminadosDe(seleccionado, grafo).has(item.id),
      ).length
    : 0;

  if (!nodo) {
    return (
      <p className="px-5 pb-5 text-xs text-teal-100/80 leading-relaxed min-h-[2.5rem]">
        {vista === "hoy" ? (
          <>
            Elegí un nodo. Se ilumina el camino. El recibo es lo que se puede abrir. Una luz real: un
            cribado el 19/9.
          </>
        ) : (
          <>
            Elegí un nodo. Se ilumina lo que se conecta: empresa, Lumina, app, trabajo. Horizonte:
            ilustración. Muchas apps, el mismo riel. No son cobros ocurridos.{" "}
            <button type="button" className="underline text-teal-300 cursor-pointer" onClick={onHoy}>
              Volver a la luz de hoy
            </button>
            .
          </>
        )}
      </p>
    );
  }

  if (pasos) {
    const humano = pasosDeNodo(recibo as GrafoNodo, grafo);
    return (
      <div className="px-5 pb-5 space-y-2">
        <p className="text-xs text-teal-100 leading-relaxed">
          {nodo.kind === "trabajo"
            ? `1 ${humano.unitLabel} · ${humano.empresa}. Este sí ocurrió.`
            : `${nodo.label}. El recibo del camino.`}
        </p>
        <RecibosMovimiento pasos={pasos} tone="dark" />
        <Link href="/jury" className="text-xs text-teal-300 underline">
          Ver el recibo
        </Link>
      </div>
    );
  }

  if (vista === "horizonte") {
    const humano = pasosDeNodo(nodo, grafo);
    const caption =
      nodo.kind === "empresa"
        ? `${nodo.label}. ${lucesNodo} luces en su camino. Si elige aparecer, se ve su nombre.`
        : nodo.kind === "lumina"
          ? "Lumina ilumina el camino. Recibo público. La familia no está en el dibujo."
          : nodo.kind === "app"
            ? `${humano.appName} cobra cuando el trabajo se hizo. El 97,5% llega a la app.`
            : `1 ${humano.unitLabel} · ${humano.empresa}. En el horizonte. Cuando el cobro ocurre, acá se abre el recibo.`;
    return (
      <div className="px-5 pb-5 space-y-2">
        <p className="text-xs text-teal-100 leading-relaxed">{caption}</p>
        <p className="text-xs text-teal-100/70">
          La empresa pagó · La empresa eligió {humano.appName} · {humano.appName} cobró el 97,5%
        </p>
      </div>
    );
  }

  return (
    <p className="px-5 pb-5 text-xs text-teal-100/80 leading-relaxed">
      {nodo.id === "puente"
        ? "PuenteMAE: en trabajo. Sin cobro no hay luz."
        : `${nodo.label}. Lumina ilumina el camino.`}
    </p>
  );
}

function CaminoBody() {
  const router = useRouter();
  const params = useSearchParams();
  const vista = params.get("vista") === "horizonte" ? "horizonte" : "hoy";
  const grafo = useMemo(() => (vista === "horizonte" ? grafoHorizonte() : grafoHoy()), [vista]);
  const nodoParam = params.get("nodo");
  const seleccionado = grafo.nodos.some((item) => item.id === nodoParam) ? nodoParam : null;

  const ir = (nextVista: "hoy" | "horizonte", nodo?: string | null) => {
    router.replace(hrefCamino(nextVista, nodo), { scroll: false });
  };

  return (
    <div className="w-full z-10 space-y-4">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block">
          El camino
        </span>
        <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">
          {vista === "hoy" ? "Una factura entra. Una luz se enciende." : "El mismo camino, lleno."}
        </h2>
        <p className="text-xs text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
          {vista === "hoy"
            ? "Hoy hay una luz real: un cribado el 19/9. Empresa anónima. Sin nombres de niños. Elegí un nodo: se ilumina el camino."
            : "A dónde apunta Lumina. Muchas empresas. Muchas apps. Un campo de luces. Elegí un nodo: se ilumina lo que se conecta. Las luces no son personas."}
        </p>
        <div className="inline-flex rounded-full border border-[var(--border)] p-1">
          <button
            type="button"
            id="btn-camino-hoy"
            onClick={() => ir("hoy")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer ${
              vista === "hoy"
                ? "bg-teal-600 text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => ir("horizonte")}
            id="btn-camino-horizonte"
            className={`rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer ${
              vista === "horizonte"
                ? "bg-teal-600 text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Horizonte
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-teal-500/20 bg-[#071018]">
        <GrafoView
          grafo={grafo}
          vista={vista}
          seleccionado={seleccionado}
          onSelect={(id) => ir(vista, id)}
        />
        <PanelCamino grafo={grafo} vista={vista} seleccionado={seleccionado} onHoy={() => ir("hoy")} />
      </div>
    </div>
  );
}

export default function CaminoLumina() {
  return (
    <Suspense
      fallback={
        <div className="w-full z-10 min-h-[24rem] rounded-3xl border border-teal-500/20 bg-[#071018]" />
      }
    >
      <CaminoBody />
    </Suspense>
  );
}
