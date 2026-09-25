"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  type LuzCamino,
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
  return `${qs ? `/?${qs}` : "/"}#camino`;
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
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const bend = Math.min(42, len * 0.16);
  const mx = (from.x + to.x) / 2 - (dy / len) * bend;
  const my = (from.y + to.y) / 2 + (dx / len) * bend;
  return `M${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
}

const POLVO = Array.from({ length: 36 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233 + 1.7) * 24634.6345;
  return {
    x: Math.round((a - Math.floor(a)) * 1000) / 1000,
    y: Math.round((b - Math.floor(b)) * 1000) / 1000,
    r: Math.round((0.6 + (i % 3) * 0.35) * 100) / 100,
    o: Math.round((0.12 + (i % 4) * 0.05) * 100) / 100,
  };
});

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

function metaDe(
  nodo: GrafoNodo,
  foco: string | null,
  lit: Set<string> | null,
  ahora: number,
  origen: { x: number; y: number },
): { x: number; y: number } {
  if (foco && lit && !lit.has(nodo.id)) return { x: nodo.x, y: nodo.y };
  if (!foco) {
    const w = ahora / 1000;
    return {
      x: nodo.x + Math.sin(w * 0.55 + nodo.x * 0.015) * 5,
      y: nodo.y + Math.cos(w * 0.4 + nodo.y * 0.015) * 5,
    };
  }
  if (nodo.id === "lumina") return { x: nodo.x, y: nodo.y };
  const dx = nodo.x - origen.x;
  const dy = nodo.y - origen.y;
  const len = Math.hypot(dx, dy) || 1;
  const abre = nodo.kind === "trabajo" ? 34 : nodo.kind === "app" ? 16 : 8;
  return { x: nodo.x + (dx / len) * abre, y: nodo.y + (dy / len) * abre };
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
  const [motionOk, setMotionOk] = useState(true);
  const [hover, setHover] = useState<string | null>(null);
  const [cuadro, setCuadro] = useState(0);
  const lugares = useRef<Map<string, { x: number; y: number }>>(new Map());
  const focoRef = useRef<string | null>(null);
  const litRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotionOk(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  const foco = hover ?? seleccionado;
  const lit = useMemo(
    () => (foco ? iluminadosDe(foco, grafo) : null),
    [foco, grafo],
  );
  focoRef.current = foco;
  litRef.current = lit;
  const origen = lumina ? { x: lumina.x, y: lumina.y } : { x: 0, y: 0 };

  useEffect(() => {
    const siguiente = new Map<string, { x: number; y: number }>();
    for (const nodo of grafo.nodos) siguiente.set(nodo.id, { x: nodo.x, y: nodo.y });
    lugares.current = siguiente;
  }, [grafo]);

  useEffect(() => {
    if (vista !== "horizonte" || !motionOk) return;
    let pasos = 0;
    let ultimo = 0;
    let frame = 0;
    const loop = (ahora: number) => {
      const dt = Math.min(0.05, ultimo ? (ahora - ultimo) / 1000 : 0.016);
      ultimo = ahora;
      const focoAhora = focoRef.current;
      const litAhora = litRef.current;
      for (const nodo of grafo.nodos) {
        const lugar = lugares.current.get(nodo.id);
        if (!lugar) continue;
        const meta = metaDe(nodo, focoAhora, litAhora, ahora, origen);
        const paso = Math.min(1, dt * 3.2);
        lugar.x += (meta.x - lugar.x) * paso;
        lugar.y += (meta.y - lugar.y) * paso;
      }
      pasos += 1;
      if (pasos % 2 === 0) setCuadro((valor) => valor + 1);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [vista, motionOk, grafo, origen.x, origen.y]);

  const puesto = (nodo: GrafoNodo) =>
    vista === "horizonte" ? (lugares.current.get(nodo.id) ?? nodo) : nodo;
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

  const maxX = Math.max(880, ...grafo.nodos.map((item) => item.x + item.r + 36));
  const maxY = Math.max(420, ...grafo.nodos.map((item) => item.y + item.r + 36));
  const viewBox = vista === "hoy" ? `0 0 ${maxX} ${maxY}` : "0 0 1280 820";
  const aria =
    vista === "hoy"
      ? "Hoy: una luz real. El informe del cribado del 19 de septiembre. Elegí un nodo para seguir el camino."
      : "Horizonte: el camino lleno de luz. Muchas empresas y muchas apps. Elegí un nodo: se ilumina lo que se conecta.";

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-auto"
      role="img"
      aria-label={aria}
      data-frame={cuadro}
      onMouseLeave={() => setHover(null)}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setHover(null);
          onSelect(null);
        }
      }}
    >
      <defs>
        <radialGradient id={`camino-cielo-${vista}`} cx="50%" cy="42%" r="68%">
          <stop offset="0%" stopColor="#12384A" stopOpacity={vista === "hoy" ? 0.55 : 0.7} />
          <stop offset="55%" stopColor="#071018" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#071018" stopOpacity="0" />
        </radialGradient>
        <filter id={`camino-glow-${vista}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={vista === "hoy" ? 5 : 6} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`camino-soft-${vista}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={vista === "hoy" ? 8 : 10} />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill={`url(#camino-cielo-${vista})`} pointerEvents="none" />
      {POLVO.map((mota, i) => (
        <circle
          key={`polvo-${i}`}
          cx={mota.x * (vista === "hoy" ? maxX : 1280)}
          cy={mota.y * (vista === "hoy" ? maxY : 820)}
          r={mota.r}
          fill="#E7FFFB"
          opacity={vista === "hoy" ? mota.o * 0.45 : mota.o}
          pointerEvents="none"
        />
      ))}
      {tronco.map((edge) => {
        const from = grafo.nodos.find((item) => item.id === edge.from);
        const to = grafo.nodos.find((item) => item.id === edge.to);
        if (!from || !to) return null;
        const on = edgeOn(edge);
        const trabajo = from.kind === "trabajo" || to.kind === "trabajo";
        const publicEmp =
          (from.kind === "empresa" && from.publico) || (to.kind === "empresa" && to.publico);
        const d = curva({ ...from, ...puesto(from) }, { ...to, ...puesto(to) });
        const vivo = on && Boolean(lit);
        const color = on ? (publicEmp || !trabajo ? "#5EEAD4" : "#2B9C76") : "#123040";
        return (
          <g key={`${edge.from}-${edge.to}`} pointerEvents="none">
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={vivo ? 8 : on ? (trabajo ? 2.2 : 4) : 0.8}
              opacity={vivo ? 0.28 : on ? (trabajo ? 0.18 : 0.22) : 0.05}
              filter={on ? `url(#camino-soft-${vista})` : undefined}
            />
            <path
              d={d}
              fill="none"
              stroke={vivo ? "#F0FFFC" : color}
              strokeWidth={vivo ? 1.7 : on ? (trabajo ? 1 : 1.35) : 0.45}
              opacity={vivo ? 0.95 : on ? (lit ? 0.9 : trabajo ? 0.28 : 0.62) : 0.08}
              strokeLinecap="round"
            />
            {vivo && motionOk ? (
              <path
                d={d}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="0.14 0.86"
                opacity="0.9"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="1"
                  to="0"
                  dur="2.6s"
                  repeatCount="indefinite"
                />
              </path>
            ) : null}
          </g>
        );
      })}
      {grafo.nodos.map((nodo) => {
        const on = visible(nodo.id);
        const isSel = seleccionado === nodo.id;
        const lugar = puesto(nodo);
        const showLabel =
          nodo.kind === "lumina" ||
          nodo.kind === "app" ||
          isSel ||
          hover === nodo.id ||
          (vista === "hoy" && nodo.kind === "empresa") ||
          (vista === "hoy" && nodo.kind === "trabajo");
        const label =
          nodo.kind === "lumina"
            ? "Lumina"
            : nodo.kind === "trabajo" && vista === "hoy"
              ? `1 cribado · ${fechaCorta(CAMINO_SEMILLA.at)}`
              : nodo.label;
        const reposo =
          vista === "hoy" && !lit && nodo.id === "puente"
            ? 0.38
            : on
              ? 1
              : vista === "horizonte"
                ? 0.05
                : 0.08;
        const esLuz = nodo.kind === "trabajo" && nodo.real && vista === "hoy";
        return (
          <a
            key={nodo.id}
            href={hrefCamino(vista, isSel ? null : nodo.id)}
            className="cursor-pointer"
            aria-label={nodo.label}
            onMouseEnter={() => {
              if (vista === "horizonte") setHover(nodo.id);
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSelect(isSel ? null : nodo.id);
            }}
          >
            <g opacity={reposo}>
            {nodo.kind === "lumina" ? (
              <circle
                cx={lugar.x}
                cy={lugar.y}
                r={nodo.r + 22}
                fill="#5EEAD4"
                opacity="0.14"
                filter={`url(#camino-soft-${vista})`}
                pointerEvents="none"
              />
            ) : null}
            {esLuz ? (
              <circle
                cx={lugar.x}
                cy={lugar.y}
                r={nodo.r + 16}
                fill="#E7FFFB"
                opacity="0.22"
                filter={`url(#camino-soft-${vista})`}
                pointerEvents="none"
              >
                {motionOk && !lit ? (
                  <animate
                    attributeName="opacity"
                    values="0.12;0.34;0.12"
                    dur="3.2s"
                    repeatCount="indefinite"
                  />
                ) : null}
              </circle>
            ) : null}
            <circle
              cx={lugar.x}
              cy={lugar.y}
              r={isSel || hover === nodo.id ? nodo.r + 4 : nodo.r}
              fill={esLuz ? "#F7FFFD" : fillDe(nodo)}
              stroke={strokeDe(nodo, isSel || hover === nodo.id)}
              strokeWidth={isSel || hover === nodo.id ? 2.5 : esLuz ? 1.4 : nodo.kind === "trabajo" ? 0.6 : 2}
              filter={on && nodo.kind !== "empresa" ? `url(#camino-glow-${vista})` : undefined}
            />
            {showLabel ? (
              <text
                x={lugar.x}
                y={nodo.kind === "lumina" ? lugar.y + 5 : lugar.y + nodo.r + 18}
                textAnchor="middle"
                fill={esLuz ? "#F7FFFD" : nodo.kind === "lumina" ? "#ECFEFF" : "#99F6E4"}
                fontSize={nodo.kind === "lumina" ? 15 : esLuz ? 12 : 11}
                fontWeight={nodo.kind === "lumina" || esLuz ? 700 : 500}
                fontFamily={nodo.kind === "lumina" ? "var(--font-serif), Georgia, serif" : "var(--font-inter), ui-sans-serif, sans-serif"}
                pointerEvents="none"
              >
                {label}
              </text>
            ) : null}
            </g>
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

  const reales = grafo.nodos.filter((item) => item.kind === "trabajo" && item.real).length;

  if (!nodo) {
    return (
      <p className="px-5 pb-5 text-xs text-teal-100/80 leading-relaxed min-h-[2.5rem]">
        {vista === "hoy" ? (
          <>
            Elegí un nodo. Se ilumina el camino. El recibo es lo que se puede abrir.{" "}
            {reales > 1
              ? `${reales} luces reales, incluida la del 19/9.`
              : "Una luz real: un cribado el 19/9."}
          </>
        ) : (
          <>
            Elegí un nodo. Se ilumina lo que se conecta: empresa, Lumina, app, informe. El horizonte
            es la visión del camino lleno. Hoy la luz real es la del 19/9.{" "}
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
        <Link
          href={recibo?.id.startsWith("cer-") ? `/c/${recibo.id}` : "/jury"}
          className="text-xs text-teal-300 underline"
        >
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
            ? `${humano.appName} cobra cuando emite el informe. El 97,5% llega a la app.`
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
  const params = useSearchParams();
  const [vista, setVista] = useState<"hoy" | "horizonte">(
    params.get("vista") === "horizonte" ? "horizonte" : "hoy",
  );
  const [nodoActivo, setNodoActivo] = useState<string | null>(params.get("nodo"));
  const [luces, setLuces] = useState<LuzCamino[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/camino")
      .then(async (response) => {
        const data = await response.json();
        if (!cancelled && Array.isArray(data.luces)) setLuces(data.luces);
      })
      .catch(() => {
        if (!cancelled) setLuces(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const grafo = useMemo(
    () => (vista === "horizonte" ? grafoHorizonte() : grafoHoy(luces ?? undefined)),
    [vista, luces],
  );
  const lucesHoy = grafo.nodos.filter((item) => item.kind === "trabajo" && item.real).length;
  const seleccionado = grafo.nodos.some((item) => item.id === nodoActivo) ? nodoActivo : null;

  const ir = (nextVista: "hoy" | "horizonte", nodo?: string | null) => {
    const nextNodo = nodo ?? null;
    setVista(nextVista);
    setNodoActivo(nextNodo);
    window.history.replaceState(null, "", hrefCamino(nextVista, nextNodo));
  };

  return (
    <div className="w-full z-10 space-y-4">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block">
          El camino
        </span>
        <h2 className="font-serif text-3xl font-bold text-[var(--foreground)] tracking-tight">
          {vista === "hoy" ? "Hoy. Una luz real." : "Horizonte. El camino lleno de luz."}
        </h2>
        <p className="text-xs text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
          {vista === "hoy"
            ? lucesHoy > 1
              ? `Hoy hay ${lucesHoy} luces reales. La del 19/9 y cada cobro confirmado. Empresa anónima, salvo que la CUIT elija verse. Elegí un nodo.`
              : "Hoy hay una luz real: el informe del cribado, el 19/9. Empresa anónima. Elegí un nodo: se ilumina el camino."
            : "La visión. Muchas empresas, muchas apps, un campo de luces. Elegí un nodo: se ilumina lo que se conecta. Hoy la luz real es la del 19/9."}
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
            id="btn-camino-horizonte"
            onClick={() => ir("horizonte")}
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

      <div className="relative overflow-hidden rounded-3xl border border-teal-400/25 bg-[#071018] shadow-[inset_0_0_120px_rgba(94,234,212,0.07)]">
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
