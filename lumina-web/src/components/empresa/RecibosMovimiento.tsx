import { txUrl } from "@/lib/explorer";
import type { ReciboPaso } from "@/lib/empresa/recibos";

export default function RecibosMovimiento({ pasos }: { pasos: ReciboPaso[] }) {
  return (
    <ul className="space-y-1.5 text-xs">
      {pasos.map((paso) => (
        <li key={paso.key} className="leading-relaxed">
          {paso.hash ? (
            <a
              href={txUrl(paso.hash)}
              target="_blank"
              rel="noreferrer"
              className="text-teal-600 underline"
            >
              {paso.label}
            </a>
          ) : (
            <span className="text-[var(--muted)]">{paso.label} · en trabajo</span>
          )}
        </li>
      ))}
    </ul>
  );
}
