/** Semilla pública: el único cobro que ya existe y cualquiera puede abrir. */
export const CAMINO_SEMILLA = {
  id: "e2e-19-9",
  appId: "mira",
  appName: "MIRA AI",
  unitLabel: "cribado M-CHAT-R/F",
  quantity: 1,
  at: "2026-09-19T19:40:27Z",
  companyPublic: false as const,
  paidHash: "9fdbc2e8865a0a94339884d6345eb628c2d6ee16792ab5ebfe5f0a946765812f",
  choseHash: "0f58d322ce32855649d7f8c821987cd822d4181ea7121d0ce3829dfa5f48f9c3",
  chargedHash: "a26a36263013a9d38370c4ef55bb9a7f96fa860213e11f4805873b8a2995a522",
};

export const EMPRESA_ANONIMA = "Empresa anónima";
export const LUZ_PUBLICA = "Luz pública";

export type LuzCamino = {
  id: string;
  appId: string;
  appName: string;
  unitLabel: string;
  quantity: number;
  at?: string;
  companyPublic: boolean;
  companyLabel?: string;
  paidHash?: string;
  choseHash?: string;
  chargedHash?: string;
};

export function lucesPublicas(): LuzCamino[] {
  return [
    {
      id: CAMINO_SEMILLA.id,
      appId: CAMINO_SEMILLA.appId,
      appName: CAMINO_SEMILLA.appName,
      unitLabel: CAMINO_SEMILLA.unitLabel,
      quantity: CAMINO_SEMILLA.quantity,
      at: CAMINO_SEMILLA.at,
      companyPublic: false,
      paidHash: CAMINO_SEMILLA.paidHash,
      choseHash: CAMINO_SEMILLA.choseHash,
      chargedHash: CAMINO_SEMILLA.chargedHash,
    },
  ];
}

export function etiquetaEmpresa(luz: LuzCamino): string {
  if (luz.companyPublic && luz.companyLabel) return luz.companyLabel;
  return EMPRESA_ANONIMA;
}

export type GrafoKind = "empresa" | "lumina" | "app" | "trabajo";
export type RamaImpacto = "salud" | "educacion" | "ambiental" | "deporte";

export type GrafoNodo = {
  id: string;
  kind: GrafoKind;
  x: number;
  y: number;
  r: number;
  label: string;
  publico?: boolean;
  appId?: string;
  empresaId?: string;
  unitLabel?: string;
  rama?: RamaImpacto;
  real?: boolean;
  paidHash?: string;
  choseHash?: string;
  chargedHash?: string;
};

/** Apps del horizonte: ilustración. Hoy sigue siendo MIRA + PuenteMAE. */
export const APPS_HORIZONTE: {
  id: string;
  label: string;
  corto: string;
  unitLabel: string;
  rama: RamaImpacto;
  luces: number;
}[] = [
  { id: "mira", label: "MIRA", corto: "1 cribado", unitLabel: "cribado M-CHAT-R/F", rama: "salud", luces: 36 },
  { id: "puente", label: "PuenteMAE", corto: "1 niño-mes", unitLabel: "niño-mes de apoyo", rama: "educacion", luces: 32 },
  { id: "aula", label: "Aula", corto: "1 hora", unitLabel: "hora de inclusión", rama: "educacion", luces: 28 },
  { id: "ojo", label: "Ojo", corto: "1 control", unitLabel: "control visual", rama: "salud", luces: 26 },
  { id: "voz", label: "Voz", corto: "1 sesión", unitLabel: "sesión de habla", rama: "salud", luces: 24 },
  { id: "rio", label: "Río", corto: "1 jornada", unitLabel: "jornada de agua", rama: "ambiental", luces: 30 },
  { id: "cancha", label: "Cancha", corto: "1 turno", unitLabel: "turno de deporte", rama: "deporte", luces: 28 },
  { id: "huerta", label: "Huerta", corto: "1 taller", unitLabel: "taller ambiental", rama: "ambiental", luces: 22 },
  { id: "faro", label: "Faro", corto: "1 tutoría", unitLabel: "tutoría", rama: "educacion", luces: 24 },
  { id: "paso", label: "Paso", corto: "1 visita", unitLabel: "visita de apoyo", rama: "salud", luces: 22 },
];

export type GrafoArista = { from: string; to: string };

export type GrafoCamino = { nodos: GrafoNodo[]; aristas: GrafoArista[] };

function polar(cx: number, cy: number, radius: number, angle: number) {
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function hashJitter(i: number, salt: number) {
  const n = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

export function grafoHoy(): GrafoCamino {
  const semilla = lucesPublicas()[0];
  const nodos: GrafoNodo[] = [
    {
      id: "emp-hoy",
      kind: "empresa",
      x: 150,
      y: 210,
      r: 26,
      label: EMPRESA_ANONIMA,
      empresaId: "emp-hoy",
      real: true,
    },
    { id: "lumina", kind: "lumina", x: 400, y: 210, r: 36, label: "Lumina", real: true },
    { id: "mira", kind: "app", x: 620, y: 120, r: 24, label: "MIRA", appId: "mira", rama: "salud", real: true },
    {
      id: "puente",
      kind: "app",
      x: 620,
      y: 310,
      r: 22,
      label: "PuenteMAE · en trabajo",
      appId: "puente",
      rama: "educacion",
      real: true,
    },
    {
      id: semilla.id,
      kind: "trabajo",
      x: 760,
      y: 88,
      r: 16,
      label: `1 ${semilla.unitLabel}`,
      appId: "mira",
      empresaId: "emp-hoy",
      unitLabel: semilla.unitLabel,
      rama: "salud",
      real: true,
      paidHash: semilla.paidHash,
      choseHash: semilla.choseHash,
      chargedHash: semilla.chargedHash,
    },
  ];
  const aristas: GrafoArista[] = [
    { from: "emp-hoy", to: "lumina" },
    { from: "lumina", to: "mira" },
    { from: "lumina", to: "puente" },
    { from: "mira", to: semilla.id },
    { from: "emp-hoy", to: semilla.id },
  ];
  return { nodos, aristas };
}

/** Escena ilustrativa del riel lleno. No es un cobro ocurrido. */
export function grafoHorizonte(): GrafoCamino {
  const cx = 340;
  const cy = 420;
  const empresas: GrafoNodo[] = Array.from({ length: 40 }, (_, i) => {
    const publico = i % 5 === 0;
    const ring = i < 20 ? 248 : 318;
    const start = Math.PI * 0.62;
    const span = Math.PI * 0.86;
    const t = (i % 20) / 19;
    const p = polar(cx, cy, ring, start + span * t);
    return {
      id: `emp-${i}`,
      kind: "empresa" as const,
      x: p.x + (hashJitter(i, 1) - 0.5) * 16,
      y: p.y + (hashJitter(i, 2) - 0.5) * 18,
      r: publico ? 11 : 7.5,
      label: publico ? LUZ_PUBLICA : EMPRESA_ANONIMA,
      publico,
      empresaId: `emp-${i}`,
    };
  });
  const lumina: GrafoNodo = {
    id: "lumina",
    kind: "lumina",
    x: cx,
    y: cy,
    r: 34,
    label: "Lumina",
  };
  const apps: GrafoNodo[] = APPS_HORIZONTE.map((spec, i) => {
    const t = i / (APPS_HORIZONTE.length - 1);
    const angle = -Math.PI * 0.36 + t * Math.PI * 0.72;
    const p = polar(580, cy, 300, angle);
    return {
      id: spec.id,
      kind: "app" as const,
      x: p.x,
      y: p.y,
      r: spec.id === "mira" || spec.id === "puente" ? 18 : 14,
      label: spec.label,
      appId: spec.id,
      rama: spec.rama,
    };
  });

  const trabajos: GrafoNodo[] = APPS_HORIZONTE.flatMap((spec, appIndex) => {
    const app = apps[appIndex];
    const t = appIndex / (APPS_HORIZONTE.length - 1);
    const angle = -Math.PI * 0.36 + t * Math.PI * 0.72;
    const hub = polar(app.x, app.y, 42, angle);
    return Array.from({ length: spec.luces }, (_, i) => {
      const ring = 22 + (i % 4) * 12;
      const a = (i / spec.luces) * Math.PI * 1.35 + angle - 0.65;
      const p = polar(hub.x, hub.y, ring, a);
      const emp = empresas[(i * (appIndex + 1)) % empresas.length];
      const prefix = spec.id === "mira" ? "cribado" : spec.id === "puente" ? "nino" : spec.id;
      return {
        id: `${prefix}-${i}`,
        kind: "trabajo" as const,
        x: p.x + (hashJitter(i, appIndex + 3) - 0.5) * 8,
        y: p.y + (hashJitter(i, appIndex + 7) - 0.5) * 8,
        r: 2.8 + (i % 4) * 0.55,
        label: spec.corto,
        appId: spec.id,
        empresaId: emp.id,
        unitLabel: spec.unitLabel,
        rama: spec.rama,
      };
    });
  });

  const nodos = [...empresas, lumina, ...apps, ...trabajos];
  const aristas: GrafoArista[] = [
    ...empresas.map((item) => ({ from: item.id, to: "lumina" })),
    ...apps.map((item) => ({ from: "lumina", to: item.id })),
    ...trabajos.map((item) => ({ from: item.appId as string, to: item.id })),
    ...trabajos.map((item) => ({ from: item.empresaId as string, to: item.id })),
  ];
  return { nodos, aristas };
}

export function adyacencia(aristas: GrafoArista[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const edge of aristas) {
    const left = map.get(edge.from) ?? [];
    left.push(edge.to);
    map.set(edge.from, left);
    const right = map.get(edge.to) ?? [];
    right.push(edge.from);
    map.set(edge.to, right);
  }
  return map;
}

/** Nodos que se encienden al elegir uno: el nodo, Lumina, y todo lo que los une. */
export function iluminadosDe(id: string, grafo: GrafoCamino): Set<string> {
  const lit = new Set<string>([id]);
  const nodo = grafo.nodos.find((item) => item.id === id);
  if (!nodo) return lit;
  lit.add("lumina");
  if (nodo.kind === "lumina") {
    for (const item of grafo.nodos) lit.add(item.id);
    return lit;
  }
  if (nodo.kind === "empresa") {
    for (const item of grafo.nodos) {
      if (item.empresaId === nodo.id) {
        lit.add(item.id);
        if (item.appId) lit.add(item.appId);
      }
    }
    return lit;
  }
  if (nodo.kind === "app") {
    for (const item of grafo.nodos) {
      if (item.id === nodo.id || item.appId === nodo.appId) {
        lit.add(item.id);
        if (item.empresaId) lit.add(item.empresaId);
      }
    }
    return lit;
  }
  if (nodo.empresaId) lit.add(nodo.empresaId);
  if (nodo.appId) lit.add(nodo.appId);
  return lit;
}

export function reciboDeSeleccion(id: string, grafo: GrafoCamino): GrafoNodo | null {
  const nodo = grafo.nodos.find((item) => item.id === id);
  if (!nodo) return null;
  if (nodo.kind === "trabajo") return nodo.real ? nodo : null;
  const lit = iluminadosDe(id, grafo);
  return grafo.nodos.find((item) => item.kind === "trabajo" && item.real && lit.has(item.id)) ?? null;
}

export function aristaEncendida(edge: GrafoArista, lit: Set<string>): boolean {
  return lit.has(edge.from) && lit.has(edge.to);
}

export function pasosDeNodo(nodo: GrafoNodo, grafo: GrafoCamino) {
  const app = grafo.nodos.find((item) => item.id === nodo.appId) ?? grafo.nodos.find((item) => item.kind === "app");
  const appName = app?.label.replace(/ ·.*/, "") ?? "la app";
  const empresa = grafo.nodos.find((item) => item.id === nodo.empresaId);
  return {
    empresa: empresa?.label ?? EMPRESA_ANONIMA,
    appName,
    unitLabel: nodo.unitLabel ?? nodo.label,
    paidHash: nodo.paidHash,
    choseHash: nodo.choseHash,
    chargedHash: nodo.chargedHash,
    real: Boolean(nodo.real),
  };
}
