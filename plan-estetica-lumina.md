# Plan de Mejora Estética — Lumina Impact Protocol

> Basado en: auditoría de frontend, investigación de audiencia (RSE LATAM + hackathon),
> mejores prácticas de diseño para salud-impacto-fintech, y análisis del código actual.
> SÓLO estética. No toca funcionalidad, integraciones, ni lógica de negocio.

---

## 0. El Problema Central (no es técnico, es de identidad)

Lumina tiene **2 audiencias** con necesidades estéticas OPUESTAS y actualmente está
diseñado para UNA sola (la que menos paga):

| Audiencia | Lo que espera visualmente | Lo que recibe hoy |
|-----------|--------------------------|-------------------|
| **Director de RSE** (presupuestos, accountability, jefes) | Light mode, profesional, datos claros, imágenes humanas, sobrio | Dark mode genérico Web3, sin fotos, jargon técnico |
| **Jurado de hackathon** (arquitectura, innovación, código) | Dark mode, glassmorphism, diagramas técnicos, tokens | ✅ Justo lo que quiere |

**La brecha estética #1:** lumina-web se ve como un DeFi protocol más.
No comunica "salud infantil", "impacto social", "confianza corporativa".
Es visualmente genérico.

**La evidencia concreta:**
- No hay UNA foto de un niño, familia o clínico en todo el frontend
- El SVG "mapa de impacto" es irreconocible
- Tipografía de 9px en cards (ilegible)
- `alert()` breaks visual flow
- Sin imágenes OG, sin favicon propio, sin assets de marca
- Paleta índigo/púrpura/negro = clon de Uniswap

---

## 1. Diagnosis Estética por Componente

### 1.1 Paleta de Color

| Componente | Estado | Problema |
|-----------|--------|----------|
| Lumina-web (dark) | ❌ | Índigo genérico. 0 diferenciación. 0 calidez. |
| MIRA (light/dark) | ✅ | OKLCH bien usado. Azul clínico suave + teal cálido. |
| Transición entre proyectos | ❌ | No hay puente visual. Parecen de empresas distintas. |

### 1.2 Tipografía

| Componente | Estado | Problema |
|-----------|--------|----------|
| Lumina-web headings (Outfit) | ⚠️ | Buena fuente, pero Google Fonts CDN (sin `next/font`) |
| Lumina-web body (Plus Jakarta Sans) | ⚠️ | Sin fallback system, sin font-display swap |
| MIRA (Inter + Fraunces) | ✅ | `next/font/google`, bien configurado |
| Micro-tipografía (9px, 10px) | ❌ | Fallo WCAG AA en desktop y mobile |

### 1.3 Glassmorphism y Superficies

| Componente | Estado |
|-----------|--------|
| Lumina-web glass-card | ⚠️ Bien ejecutado técnicamente, pero genérico |
| MIRA shadcn/ui | ✅ Sólido, consistente |
| Gradientes | ⚠️ Lumina usa gradients lineales fríos (índigo→púrpura). MIRA casi no usa |

### 1.4 Imágenes y Assets

| Asset | Estado |
|-------|--------|
| Fotos humanas | ❌ 0 en todo el proyecto |
| SVG mapa de impacto | ❌ Abstracto irreconocible |
| OG image | ❌ Ningún proyecto tiene |
| Favicon | ❌ lumina-web no tiene. MIRA tiene placeholders |
| Iconografía | ✅ lucide-react en ambos |
| Logo Lumina | ❌ Sólo existe como texto gradient + icono Activity en navbar |

### 1.5 Animación y Micro-interacciones

| Componente | Estado |
|-----------|--------|
| MIRA (Framer Motion) | ✅ Buenas transiciones |
| Lumina-web | ❌ Sin animaciones. Sin feedback visual en interacciones |
| Loading states | ❌ Sin skeletons. Sin spinners más allá de texto "Simulando..." |
| Toasts | ❌ `alert()` nativo en sponsor/page.tsx |

### 1.6 Modo Claro / Oscuro

| Componente | Estado |
|-----------|--------|
| MIRA (next-themes) | ✅ Dual mode completo |
| Lumina-web | ❌ Dark forced. Sin soporte light |

---

## 2. La Estrategia: "Dual Identity, Single Brand"

No se trata de elegir entre "corporate pro" y "Web3 glow". Se trata de que el
mismo producto se vea apropiado para cada audiencia en el contexto correcto.

**Principio rector:** *"Professional trust meets human impact"*

### 2.1 Nueva Paleta Lumina (aplica a ambos proyectos)

```
🌊 Deep Teal    #0D5E6A  → Confianza institucional + diferenciación
💚 Impact Green  #2B9C76  → Crecimiento, impacto, OKRs
🌅 Warm Gold    #D4A84B  → Calidez humana, premium sutil
🌑 Dark Slate   #0F172A  → Sophisticación técnica (dark mode)
📋 Clean White  #F8FAFC  → Ligero, profesional (light mode)
```

**Por qué teal y no índigo:**
- Teal está en el "trust family" (57% de sitios de salud usan azul/teal)
- Se diferencia de cualquier otro protocolo ReFi
- Combina calidez del verde con profesionalismo del azul
- Pasa a OKLCH para gradientes vívidos entre teal y warm gold

### 2.2 Nueva Tipografía

```
Headings:  Instrument Serif (warmth + authority)
           → Google Fonts, variable, 400-700
Body:      Inter (legibility, neutrality)
           → MIRA ya lo usa, consistencia cross-project
Monodata:  JetBrains Mono (tabular numbers for USDC amounts)
           → Alineación de decimales = confianza financiera
```

**Por qué Instrument Serif + Inter:**
- Serif en headings = autoridad + humanidad (TG. San Francisco usa similar)
- Inter = mismo body que MIRA, consistencia cross-project
- MIRA migra Outfit→Instrument Serif para headings (deja Fraunces)
- JetBrains Mono para montos: dígitos tabulares = confianza en fintech

### 2.3 Evolución del Glassmorphism (no revolución)

En lugar de borrar el glassmorphism existente, se **refina**:

```css
/* Antes (genérico Web3) */
.glass-card {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Después (teal tint, warmer glow) */
.glass-card {
  background: rgba(13, 94, 106, 0.08);
  backdrop-filter: blur(12px) saturate(120%);
  border: 1px solid rgba(13, 94, 106, 0.12);
}
```

---

## 3. Plan de Implementación por Fases

### Fase 1: Foundation (Brand Identity en Código)

**Archivos a modificar:** globals.css (lumina-web + MIRA), layout.tsx (ambos)

| # | Cambio | Justificación | Archivos |
|---|--------|---------------|----------|
| 1.1 | Definir `@theme` con nueva paleta OKLCH | Consistencia cross-project, Tailwind v4 nativo | `lumina-web/globals.css`, `MIRA/app/globals.css` |
| 1.2 | Migrar de Google Fonts CDN a `next/font` | Performance, sin flash de FOIT | `lumina-web/layout.tsx` |
| 1.3 | Agregar Instrument Serif + JetBrains Mono | Nueva jerarquía tipográfica | `lumina-web/layout.tsx`, `MIRA/app/layout.tsx` |
| 1.4 | Crear primeras OG images (opengraph.png) | Redes sociales, previews, credibilidad | `lumina-web/public/`, `MIRA/public/` |
| 1.5 | Favicon y apple-touch-icon Lumina | Identidad en tabs, bookmarks | `lumina-web/public/` |
| 1.6 | Refactor `.glass-card` a nueva paleta | Transición visual sin romper layout | `lumina-web/globals.css` |

---

### Fase 2: lumina-web (Aesthetic Overhaul)

**Archivos a modificar:** page.tsx, sponsor/page.tsx, invest/page.tsx,
presentation/page.tsx, Navbar.tsx, globals.css

| # | Cambio | Justificación |
|---|--------|---------------|
| 2.1 | **Reemplazar SVG mapa de impacto** con visualización real (mapa de Argentina con dots por provincia + tooltip con datos) o eliminarlo | El SVG actual es irreconocible, daña confianza |
| 2.2 | **Agregar imágenes humanas** — banner hero con foto de familia/pediatra (light bg) o foto de screening (dark bg) | Conexión emocional: salud infantil no puede ser abstracta |
| 2.3 | **Implementar modo claro** vía next-themes | La audiencia RSE corporativa espera light mode profesional |
| 2.4 | **Reducir micro-tipografía**: migrar de `text-[9px]` a `text-xs` (12px) mínimo | WCAG AA, legibilidad en desktop |
| 2.5 | **Reemplazar `alert()`** con sistema de notificaciones (sonner o similar) | UX profesional, no rompe flujo |
| 2.6 | **Reducir densidad del dashboard sponsor**: agrupar 12 cards en tabs o acordeones | Evita sobrecarga cognitiva |
| 2.7 | **Agregar loading skeletons** para datos on-chain | Feedback visual durante carga |
| 2.8 | **Agregar micro-animaciones** en entrada de secciones (framer motion o CSS view-timeline) | Sensación de pulido profesional |
| 2.9 | **Rediseñar Navbar**: logo Lumina con icono propio (no lucide Activity genérico), links más claros, wallet connect más integrado | Primera impresión |
| 2.10 | **Refinar hero**: H1 más accesible, subtexto con impacto humano medible | El primer call-to-action debe conectar emocionalmente |

---

### Fase 3: MIRA (Refinamientos Estéticos)

| # | Cambio | Justificación |
|---|--------|---------------|
| 3.1 | **Agregar pantalla de onboarding** con ilustraciones o animación antes del intake | Padres primerizos necesitan entender QUÉ es MIRA antes de dar datos |
| 3.2 | **Agregar OG image** con identidad MIRA (logo + claim + foto clínica) | Falta en layout.tsx |
| 3.3 | **Puente visual sutil** entre MIRA y Lumina (footer o badge "Powered by Lumina Protocol") | Sin romper identidad MIRA, pero conectando el ecosistema |
| 3.4 | **Revisar heading sizes** — Fraunces es buena pero revisar que no haya sizes < 14px | Consistencia cross-project |

---

## 4. Lo que NO se toca (estrictamente estética)

- No se modifica lógica de negocio
- No se tocan integraciones on-chain
- No se refactoriza WalletContext ni MiraBridge
- No se cambian rutas ni APIs
- No se agregan funcionalidades nuevas
- No se modifica el contrato Soroban
- No se tocan tests

---

## 5. Scoring: Impacto Estimado vs Esfuerzo

| # | Cambio | Impacto estético | Esfuerzo | Prioridad |
|---|--------|-----------------|----------|-----------|
| 2.1 | Mapa de impacto | 🔥🔥🔥🔥🔥 | 2-3h | **P0** |
| 2.2 | Imágenes humanas | 🔥🔥🔥🔥🔥 | 1-2h (asset search) + 1h layout | **P0** |
| 2.5 | alert() → toasts | 🔥🔥🔥🔥 | 30min | **P0** |
| 2.4 | Micro-tipografía | 🔥🔥🔥🔥 | 1h (grep + replace) | **P0** |
| 2.3 | Modo claro (next-themes) | 🔥🔥🔥🔥 | 3-4h | **P1** |
| 1.1 | Paleta OKLCH | 🔥🔥🔥 | 1h | **P1** |
| 2.8 | Micro-animaciones | 🔥🔥🔥 | 2h | **P1** |
| 2.6 | Densidad dashboard | 🔥🔥🔥 | 2h | **P1** |
| 1.4-1.5 | OG/Favicon | 🔥🔥 | 30min | **P1** |
| 2.10 | Hero refinado | 🔥🔥🔥 | 1h | **P1** |
| 2.9 | Navbar rediseñado | 🔥🔥🔥 | 2h | **P2** |
| 3.1 | Onboarding MIRA | 🔥🔥🔥 | 2-3h | **P2** |
| 2.7 | Loading skeletons | 🔥🔥 | 1h | **P2** |
| 1.2 | next/font migration | 🔥🔥 | 1h | **P2** |
| 3.3 | Puente visual Lumina-MIRA | 🔥🔥 | 30min | **P3** |

---

## 6. Referencias Visuales (Inspiración)

- **charity: water** — Fotografía humana con dignidad, colores cálidos, CTAS claros
- **Thorn** — Ilustraciones emotivas + diseño oscuro profesional para doble audiencia
- **Monarch Money** — Editorial premium con serif headings + paleta restringida
- **Giveth** — Purple/verde, rounded UI, accesible, no intimida con crypto
- **Telecom Argentina Annual Report** — Light mode, datos GRI, fotos corporativas
- **MIRA sponsors page** (ya en el repo) — Mejor ejemplo de tono acertado en el proyecto
