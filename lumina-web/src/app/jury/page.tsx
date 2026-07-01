"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, Cpu, Terminal, Compass, ExternalLink, 
  AlertTriangle, Play, HelpCircle, ArrowLeft, ArrowRight, 
  BookOpen, Heart, Activity, Target, Landmark, FileText, CheckCircle2, Clock
} from "lucide-react";


interface PitchSlide {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: string[];
}

export default function JuryPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const pitchSlides: PitchSlide[] = [
    {
      title: "El Problema: Fricción y Opacidad en RSE",
      subtitle: "CSR tradicional & Crisis en la distribución de impacto",
      icon: <Target className="h-6 w-6 text-[var(--danger)]" />,
      content: [
        "Falta de transparencia: Los patrocinadores corporativos depositan fondos de RSE pero no pueden verificar si cada dólar financió un impacto real (riesgo de impact-washing).",
        "Fricción de Pagos en Argentina: Las transferencias transfronterizas e internacionales tienen alta carga impositiva, demoras y trabas administrativas.",
        "Costo de Auditoría: Auditar manualmente el cumplimiento de metas sociales es costoso y consume tiempo administrativo valioso para las ONGs."
      ]
    },
    {
      title: "La Solución: Infraestructura Universal de Escrow ReFi",
      subtitle: "Smart Contracts en Soroban + Apps Verificadoras como Oráculos",
      icon: <ShieldCheck className="h-6 w-6 text-teal-500" />,
      content: [
        "Escrow Descentralizado: Los patrocinadores depositan USDC que quedan bloqueados en garantía. No hay desvío de capital; los fondos pertenecen al sponsor hasta concretar la meta.",
        "Oráculos de Impacto Ciegos: Cualquier App Verificadora (como MIRA AI) genera un reporte, calcula su hash SHA-256 en cliente y firma criptográficamente. Soroban valida la firma on-chain y libera los fondos de forma atómica.",
        "Caso de Estudio Real (MIRA AI): Usamos evaluaciones reales de neurodesarrollo en Stellar Testnet para demostrar la viabilidad inmediata del protocolo."
      ]
    },
    {
      title: "La Integración Carga-Pesos (Stellar Stack)",
      subtitle: "Arquitectura técnica load-bearing funcional on-chain",
      icon: <Terminal className="h-6 w-6 text-teal-500" />,
      content: [
        "Smart Contract de Soroban (Lumina Escrow): Lógica de oráculos autorizados, control reputacional Soulbound ($LUMINA) y ajuste de precios con time-locks.",
        "Simulación Real de Riel SEP-24: Integración para que empresas Web2 tradicionales transfieran pesos (ARS) locales mediante Transferencias 3.0, acreditándose USDC en blockchain.",
        "Hashing Seguro de Datos Médicos: Resguardo de confidencialidad mediante hashing ciego en cliente en MIRA AI, cumpliendo normativas de protección de datos."
      ]
    },
    {
      title: "Modelo de Negocio y Sustentabilidad Core",
      subtitle: "Riel de incentivos para desarrolladores, marketing y red",
      icon: <Landmark className="h-6 w-6 text-emerald-400" />,
      content: [
        "Tasa de Protocolo del 2.5%: Aplicada atómicamente a cada liberación de fondos del oráculo (MIRA, FitSteps u otras).",
        "Incentivos de Desarrollo (1.0%): Bounties directas para programadores de código abierto que expandan la red.",
        "Captación de Sponsors (1.0%): Presupuesto de marketing corporativo para traer más empresas Web2 al protocolo.",
        "Infraestructura (0.5%): Mantenimiento de nodos RPC de Soroban y costos operativos."
      ]
    }
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % pitchSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + pitchSlides.length) % pitchSlides.length);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-teal-600 selection:text-white pb-16">

      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12 z-10 relative mt-16">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--warn-border)] bg-[var(--warn-bg)] text-[var(--warn)] text-xs font-semibold tracking-wide uppercase">
            <AlertTriangle className="h-3.5 w-3.5 text-[var(--warn)]" /> Hackathon Evaluation Terminal
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--teal)] via-[var(--green)] to-[var(--gold)] bg-clip-text text-transparent">
            Portal de Evaluación y Auditoría Técnica
          </h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Este portal unifica el Pitch Deck, las entrevistas de Customer Discovery y los recursos técnicos on-chain para el jurado de la **Stellar PULSO Hackathon 2026** (Track PULSO Argentina).
          </p>
        </div>

        {/* Temporal Disclaimer Banner */}
        <div className="p-4 rounded-xl border border-[var(--warn-border)] bg-[var(--warn-bg)] text-[var(--warn)] text-xs leading-relaxed space-y-1">
          <span className="font-bold uppercase tracking-wider block">⚠️ AVISO DE EVALUACIÓN</span>
          <p>
            Esta sección es exclusiva para el jurado evaluador de NearX y SDF. Será eliminada de producción tras finalizar el evento de selección, dejando a Lumina operar de manera autónoma on-chain sin referencias a la hackathon.
          </p>
        </div>

        {/* INTERACTIVE PITCH DECK SLIDES */}
        <div className="glass-card p-8 rounded-2xl border border-[var(--border)] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-[var(--teal-light)] rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-[var(--muted-bg)] block">
                {pitchSlides[currentSlide].icon}
              </span>
              <div>
                <span className="text-xs font-bold text-teal-500 uppercase tracking-widest">DIAPOSITIVA {currentSlide + 1} de {pitchSlides.length}</span>
                <h3 className="text-lg font-bold text-[var(--foreground)] mt-0.5">{pitchSlides[currentSlide].title}</h3>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handlePrevSlide}
                className="p-2 rounded-lg bg-[var(--muted-bg)] border border-[var(--border)] hover:bg-[var(--teal-light)] text-[var(--muted)] transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={handleNextSlide}
                className="p-2 rounded-lg bg-[var(--muted-bg)] border border-[var(--border)] hover:bg-[var(--teal-light)] text-[var(--muted)] transition-all cursor-pointer"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 py-2 min-h-[140px]">
            <span className="text-xs font-semibold text-[var(--muted)] block italic">
              {pitchSlides[currentSlide].subtitle}
            </span>
            <ul className="space-y-3 text-xs text-[var(--muted)] leading-relaxed list-disc pl-5">
              {pitchSlides[currentSlide].content.map((point, index) => (
                <li key={index} className="pl-1">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CUSTOMER DISCOVERY VALIDATION PROGRESS */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-[var(--border)] space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-teal-500" />
              Customer Discovery (Entrevistas de Validación)
            </h2>
            <p className="text-xs text-[var(--muted)]">
              3 entrevistas completadas con stakeholders reales del ecosistema de impacto en Argentina (educación, minería/industria y acompañamiento terapéutico) + 1 entrevista pendiente de audio. Todas las transcripciones y grabaciones están en <code className="font-mono text-teal-500">/customer-discovery/</code> del repositorio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entrevista 1 */}
            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="rounded-full bg-[var(--teal-light)] px-2 py-0.5 text-xs font-bold text-teal-500 uppercase">Perfil 1 · Educación Especial</span>
                <h4 className="text-xs font-bold text-[var(--foreground)]">Gianella Gomez Pucca — Profa. Educación Especial</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Salta, Argentina. Validó la barrera económica que impide acceso a terapias externas y la importancia del resguardo criptográfico de la identidad del menor.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completada</span>
                <a href="https://github.com/gabriel-alejandropereagarcia/LUMINA/blob/master/customer-discovery/interview-1-educacion-gianella/summary.md" target="_blank" rel="noreferrer" className="text-teal-500 font-bold hover:underline inline-flex items-center gap-1">Ver transcripción <ExternalLink className="h-3 w-3" /></a>
              </div>
            </div>

            {/* Entrevista 2 */}
            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="rounded-full bg-[var(--teal-light)] px-2 py-0.5 text-xs font-bold text-teal-500 uppercase">Perfil 2 · Acompañante Terapéutico</span>
                <h4 className="text-xs font-bold text-[var(--foreground)]">Gustavo Fernandez — Acompañante Terapéutico / Docente</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Validó el impacto del financiamiento directo a "hitos de soporte" (sesiones de terapia, materiales adaptados) en la trayectoria escolar de alumnos con necesidades específicas.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completada</span>
                <a href="https://github.com/gabriel-alejandropereagarcia/LUMINA/blob/master/customer-discovery/interview-2-educacion-gustavo/summary.md" target="_blank" rel="noreferrer" className="text-teal-500 font-bold hover:underline inline-flex items-center gap-1">Ver transcripción <ExternalLink className="h-3 w-3" /></a>
              </div>
            </div>

            {/* Entrevista 3 */}
            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="rounded-full bg-[var(--green-light)] px-2 py-0.5 text-xs font-bold text-emerald-500 uppercase">Perfil 3 · Minería / RSE</span>
                <h4 className="text-xs font-bold text-[var(--foreground)]">Nadia Estefanía Martin — Resp. Administración, ARLI S.A.</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Minera de litio (Salta, casa matriz Canadá). Validó el pain point de compliance FCPA con intermediarios locales, el riesgo de malversación de fondos comunitarios y la barrera del Banco Central para operar cripto directamente.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completada</span>
                <a href="https://github.com/gabriel-alejandropereagarcia/LUMINA/blob/master/customer-discovery/interview-3-minera-nadia/summary.md" target="_blank" rel="noreferrer" className="text-teal-500 font-bold hover:underline inline-flex items-center gap-1">Ver transcripción <ExternalLink className="h-3 w-3" /></a>
              </div>
            </div>

            {/* Entrevista 4 */}
            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] space-y-3 flex flex-col justify-between opacity-80">
              <div className="space-y-2">
                <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-bold text-[var(--muted)] uppercase border border-[var(--border)]">Perfil 4 · Calidad Hospitalaria</span>
                <h4 className="text-xs font-bold text-[var(--foreground)]">Dra. Mónica Flores — Responsable de Calidad</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Hospital Materno Infantil (Salta). Comprometida a responder. El audio se encuentra demorado debido a la intensa agenda asistencial de la institución.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
                <span className="text-amber-400 font-bold flex items-center gap-1"><Clock className="h-3 w-3 animate-pulse" /> Pendiente (Demorado)</span>
                <a href="https://github.com/gabriel-alejandropereagarcia/LUMINA/blob/master/customer-discovery/interview-4-hospital-calidad/summary.md" target="_blank" rel="noreferrer" className="text-teal-500 font-bold hover:underline inline-flex items-center gap-1">Ver preguntas <ExternalLink className="h-3 w-3" /></a>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--teal-light)] bg-[var(--teal-light)] p-4 flex gap-3 items-start text-xs text-teal-500">
            <FileText className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong>Guía de Cuestionarios Activa:</strong>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                El set completo de preguntas para las entrevistas está registrado en el repositorio. Una vez completadas las sesiones de campo, los datos se compilarán en esta sección del portal de jurado.
              </p>
              <a
                href="https://github.com/gabriel-alejandropereagarcia/LUMINA/tree/master/customer-discovery"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-teal-500 font-bold hover:underline inline-flex items-center gap-1 block pt-1"
              >
                Abrir carpeta de Customer Discovery <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Deployed Smart Contracts */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-[var(--border)] space-y-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Terminal className="h-5 w-5 text-teal-500" /> Contratos y Cuentas Desplegadas en Testnet
          </h2>
          
          <div className="space-y-4 font-mono text-xs">
            {/* Lumina Contract */}
            <div className="p-4 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs text-[var(--muted)] uppercase font-bold tracking-wider block">Lumina Escrow Contract (Soroban)</span>
                <span className="text-[var(--foreground)] block mt-0.5 break-all select-all">CBLKDMO6M5GJZVNPKD2QRCAKGDFUHJCF27EG7MOFRAEHSNWMXAOOG6HA</span>
              </div>
              <a 
                href="https://stellar.expert/explorer/testnet/contract/CBLKDMO6M5GJZVNPKD2QRCAKGDFUHJCF27EG7MOFRAEHSNWMXAOOG6HA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--teal-light)] hover:bg-teal-600/20 text-teal-500 transition-colors self-start sm:self-center"
              >
                Explorer <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* USDC Contract */}
            <div className="p-4 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs text-[var(--muted)] uppercase font-bold tracking-wider block">USDC Token Address (SAC)</span>
                <span className="text-[var(--foreground)] block mt-0.5 break-all select-all">CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA</span>
              </div>
              <a 
                href="https://stellar.expert/explorer/testnet/contract/CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--teal-light)] hover:bg-teal-600/20 text-teal-500 transition-colors self-start sm:self-center"
              >
                Explorer <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* MIRA Oracle */}
            <div className="p-4 rounded-xl bg-[var(--muted-bg)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs text-[var(--muted)] uppercase font-bold tracking-wider block">MIRA Authorized Oracle</span>
                <span className="text-[var(--foreground)] block mt-0.5 break-all select-all">GDWOBCG7XPQZOMO7FAOJB73RDDJX4TV3OHP5CIBRYPI3TXMWRYMJ6FHV</span>
              </div>
              <a 
                href="https://stellar.expert/explorer/testnet/account/GDWOBCG7XPQZOMO7FAOJB73RDDJX4TV3OHP5CIBRYPI3TXMWRYMJ6FHV" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--teal-light)] hover:bg-teal-600/20 text-teal-500 transition-colors self-start sm:self-center"
              >
                Explorer <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Interactive Testing Guideliness */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-[var(--border)] space-y-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Play className="h-5 w-5 text-teal-500" /> Guía de Pruebas e Integración Local
          </h2>
          
          <div className="space-y-6 text-sm text-[var(--muted)] leading-relaxed">
            <div className="space-y-2">
              <span className="font-bold text-[var(--foreground)] block">Paso 1: Configurar Cuenta de Sponsor</span>
              <p>
                Instale la extensión de wallet **Freighter**, cámbiela a la red **Testnet** e incorpore la dirección pública del sponsor: <code className="text-teal-500 font-mono break-all select-all">GANSQVDKALMQSXVNOBUWJGXJZ5OZFST6VVDDCOOYPQ5GSIZ2C2SHHPTF</code>. Obtenga USDC de prueba reclamando en el faucet de Circle Testnet para fonear su balance.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[var(--foreground)] block">Paso 2: Bloquear Fondos de RSE</span>
              <p>
                Diríjase a la sección <Link href="/invest" className="text-teal-500 hover:underline">Portal de Garantías</Link> en este portal. Conecte su Freighter, apruebe los límites de USDC y deposite fondos (por ejemplo, 100 USDC) en el Escrow de Lumina.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[var(--foreground)] block">Paso 3: Ejecutar Cribado en App Verificadora de Referencia (MIRA)</span>
              <p>
                Abra la aplicación MIRA corriendo localmente (puerto 3001) en <code className="text-[var(--foreground)] font-mono bg-[var(--muted-bg)] px-1.5 py-0.5 rounded">http://localhost:3001</code>. Realice una sesión de prueba y genere el reporte clínico descargando el PDF.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[var(--foreground)] block">Paso 4: Notarización y Liberación Automática On-Chain</span>
              <p>
                Al descargar el PDF clínico en MIRA, el frontend calculará su hash SHA-256 de forma asíncrona. La API de MIRA tomará ese hash, firmará criptográficamente la transacción como Oráculo Autorizado y llamará a <code className="text-teal-500 font-mono">release_impact</code> en Soroban. El contrato liberará $40 USDC del depósito del sponsor a la wallet de sostenibilidad de la plataforma y acuñará 1 punto al Impact Score reputacional del sponsor.
              </p>
            </div>
          </div>
        </div>

        {/* Code Repositories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a 
            href="https://github.com/gabriel-alejandropereagarcia/LUMINA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card p-6 rounded-2xl border border-[var(--border)] hover:border-[var(--teal-light)] hover:bg-[var(--muted-bg)] transition-all flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-teal-500 uppercase tracking-wider block">Código del Ecosistema</span>
              <span className="text-sm font-bold text-[var(--foreground)] block group-hover:text-teal-500 transition-colors">Repositorio de Lumina</span>
            </div>
            <Compass className="h-5 w-5 text-[var(--muted)] group-hover:text-teal-500 transition-colors" />
          </a>

          <a 
            href="https://github.com/gabriel-alejandropereagarcia/MIRA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-card p-6 rounded-2xl border border-[var(--border)] hover:border-green-600/20 hover:bg-[var(--muted-bg)] transition-all flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-green-500 uppercase tracking-wider block">Caso de Uso Oficial</span>
              <span className="text-sm font-bold text-[var(--foreground)] block group-hover:text-green-400 transition-colors">Repositorio de MIRA AI</span>
            </div>
            <Cpu className="h-5 w-5 text-[var(--muted)] group-hover:text-green-500 transition-colors" />
          </a>
        </div>

      </div>
    </div>
  );
}
