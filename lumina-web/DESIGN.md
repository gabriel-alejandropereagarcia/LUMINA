# Lumina Impact Protocol — Identity & Design

## 1. Brand Soul

Lumina is the trust infrastructure between corporate CSR budgets and verified on-chain social impact. We enable traditional companies to fund neurodevelopmental screenings (MIRA) and reforestation (EcoForest) with cryptographic transparency, zero administrative friction.

**Tone**: Professional · Empathetic · Technically credible  
**Audience**: CSR Directors (LATAM) + Hackathon jury (technical)

## 2. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--teal` | `#0D5E6A` | Primary — buttons, links, active states, headings |
| `--green` | `#2B9C76` | Secondary — success states, eco projects, secondary CTAs |
| `--gold` | `#D4A84B` | Accent — rewards, premium badges, highlights |
| `--background` (dark) | `#0B1926` | Main dark background |
| `--background` (light) | `#F4F7FA` | Main light background |
| `--foreground` (dark) | `#E8EDF2` | Text on dark |
| `--foreground` (light) | `#1A232E` | Text on light |
| `--muted` (dark) | `#9CA3AF` | Secondary text on dark |
| `--muted` (light) | `#5A6B7A` | Secondary text on light |

Do **not** use indigo, purple, or generic Web3 blues. Lumina is teal/green/gold — a palette that signals health, trust, and growth rather than crypto speculation.

## 3. Typography

| Role | Font | Weight | Variable |
|---|---|---|---|
| Headings | Fraunces | Variable (optical sizing) | `--font-serif` |
| Body | Inter | 400/600 | `--font-inter` |
| Financial/Mono | JetBrains Mono | 400 | `--font-mono` |

### Scale
- `h1`: 4xl (Hero headings)
- `h2`: 3xl (Section titles)
- `h3`: text-lg (Card titles)
- Body: text-sm / text-xs
- Data: text-xs font-mono

### Serif constraint
Fraunces with variable optical sizing for display headings (h1, h2, section titles). Never for body text, buttons, or data.

_Note: Font-smoothing must be `antialiased` on body. Without it, variable fonts can appear blurry on Windows._

## 4. Spacing & Layout

- Max content width: `max-w-7xl` (1280px)
- Outer padding: `px-4 sm:px-6 lg:px-8`
- Section spacing: `space-y-24` on landing, `space-y-8` within sections
- Card padding: `p-6` to `p-12` depending on hierarchy
- Border radius scale: `rounded-xl` (12px) for cards, `rounded-2xl` (16px) for feature sections, `rounded-3xl` (24px) for hero banners

## 5. Glassmorphism

The glass-card pattern is the primary surface container:

```css
.glass-card {
  background: var(--card-bg);          /* semi-transparent */
  backdrop-filter: blur(12px) saturate(120%);
  border: 1px solid var(--card-border); /* subtle teal tint */
  box-shadow: var(--card-shadow);
}
```

Hover: raise `translateY(-2px)`, deepen border to `--teal`, intensify shadow.

## 6. Light / Dark Mode

- Default: dark (`class="dark"` on `<html>`)
- CSS variables in `:root` = light mode values
- `.dark` class overrides = dark mode values  
- Variant: `@custom-variant dark (&:where(.dark, .dark *))`
- Theme switching via `next-themes`

Dark mode suits the technical/hackathon audience. Light mode serves the CSR/business audience. Both must be pixel-perfect.

## 7. Imagery Principles

- **Human-first**: Real photos of children, families, and medical professionals (Unsplash). Emphasize Latin American context.
- **Argentina-recognizable**: SVG map with province dots, not abstract blobs. Use actual geography.
- **No stock corporate**: Avoid generic handshake/meeting photos. Prioritize authentic caregiving and nature imagery.
- **Format**: External Unsplash URLs via `next/image` with `remotePatterns` in next.config.ts.

## 8. Iconography

- Library: **Lucide React** (consistent with Next.js ecosystem)
- Icon style: outline, 1.5px stroke, 16-24px
- Key icons by context:
  - Medical/health: `Baby`, `Heart`, `Activity`
  - Technical: `Cpu`, `Terminal`, `ShieldCheck`
  - Financial: `Coins`, `Landmark`, `BarChart3`
  - Environmental: `Globe`, `TreePine` (from lucide)
  - Navigation: `ArrowRight`, `ChevronLeft`, `ChevronRight`

## 9. Component Patterns

### Navbar
- Sticky top with blur backdrop
- Teal/green gradient logo square (9x9) + Sparkles icon
- Font: Inter body links
- Active link: teal background highlight
- Right side: ThemeToggle (sun/moon) + wallet connect button

### Buttons
- Primary: `bg-gradient-to-r from-teal-600 to-green-600` white text
- Secondary: `border border-[var(--border)] bg-[var(--card-bg)]` foreground text
- All: `rounded-xl`, hover `scale-105`, active `scale-95`

### Cards
- Glassmorphism surface (see Section 5)
- Flex/grid layout with consistent padding
- Border separator for internal sections (`border-t border-[var(--border)]`)

### Data Tables
- Border radius overflow on wrapper
- Header row with teal-tinted background
- Monospace for hashes, addresses, amounts
- Consistent `text-xs` with `font-mono`

## 10. Voice & Copy

**Language**: Spanish (Argentina) for all UI copy  
**Register**: Professional but warm  
**Tone guide**:
- Do: "Cada centavo de RSE, trazable criptográficamente"
- Do: "Conectá tu Freighter Wallet para gestionar tus garantías reales"
- Don't: "WAGMI", "gm", "ser", or any crypto slang
- Don't: Aggressive urgency ("COMPRA AHORA", "ÚLTIMA OPORTUNIDAD")

**Key phrases**:
- "Infraestructura de Confianza para Presupuestos de RSE"
- "Impacto social verificado on-chain"
- "Cero fricción administrativa"

## 11. Anti-Patterns (Do Not)

- ✗ Indigo/purple gradients (generic Web3)
- ✗ `alert()` for user feedback (use inline status/error states)
- ✗ Generic world maps (use Argentina specifically)
- ✗ Robot/AI abstract art for human impact sections
- ✗ English copy in Spanish pages
- ✗ Emoji in place of icons (use Lucide)
- ✗ Inline styles overriding CSS variables
