"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Moldura dos modais sobre o Dialog do shadcn (Radix): foco preso, Esc,
 * leitor de tela e rolagem travada, com a folha de papel do Vereadômetro.
 */
export function ModalShell({
  onClose,
  children,
  className = "max-w-2xl",
  label,
}: {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className={cn("w-[calc(100%-1.5rem)] p-0", className, className.split(" ").map((c) => `sm:${c}`))}
      >
        <DialogTitle className="sr-only">{label}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}

/** Imagem tingida por máscara (xilogravura / retícula recolorida). */
export function InkImage({
  src,
  color,
  className = "",
  style,
}: {
  src: string;
  color: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`ink-mask ${className}`}
      style={{
        backgroundColor: color,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        ...style,
      }}
    />
  );
}

/* ── Papel rasgado e caneta de revisão ─────────────────────────────── */

/** Gerador pseudoaleatório com semente: o mesmo desenho no servidor e no navegador. */
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * Ruído 1D suave (value noise com interpolação cosseno), para bordas que serpenteiam.
 * `freq` = quantas ondulações ao longo da borda.
 */
function smoothNoise(r: () => number, n: number, freq: number) {
  const knots = Array.from({ length: freq + 2 }, () => r());
  const out: number[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * freq;
    const k = Math.floor(x);
    const f = (1 - Math.cos((x - k) * Math.PI)) / 2;
    out.push(knots[k] * (1 - f) + knots[k + 1] * f);
  }
  return out;
}

/**
 * Polígono de papel rasgado: ondulação ampla + fibras finas.
 * `jag` = profundidade máxima do rasgo em px (igual em peças grandes e pequenas);
 * `inset` empurra a borda para dentro, em px.
 */
export function tornClip(seed: number, edges = "trbl", jag = 6, steps = 64, inset = 0) {
  const r = rng(seed);
  const edge = (on: boolean) => {
    if (!on) return Array.from({ length: steps + 1 }, () => 0);
    const wave = smoothNoise(r, steps, 4 + Math.floor(r() * 4));
    const ripple = smoothNoise(r, steps, 16 + Math.floor(r() * 10));
    return wave.map((w, i) => inset + jag * (0.6 * w + 0.28 * ripple[i] + 0.12 * r()));
  };
  const t = edge(edges.includes("t")), rt = edge(edges.includes("r"));
  const b = edge(edges.includes("b")), l = edge(edges.includes("l"));
  const p = (i: number) => ((i / steps) * 100).toFixed(2) + "%";
  const px = (n: number) => n.toFixed(1) + "px";
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) pts.push(`${p(i)} ${px(t[i])}`);
  for (let i = 1; i <= steps; i++) pts.push(`calc(100% - ${px(rt[i])}) ${p(i)}`);
  for (let i = steps - 1; i >= 0; i--) pts.push(`${p(i)} calc(100% - ${px(b[i])})`);
  for (let i = steps - 1; i >= 1; i--) pts.push(`${px(l[i])} ${p(i)}`);
  return `polygon(${pts.join(",")})`;
}

/** Filtro SVG (montado uma vez no layout) que desfia a borda em fibras. */
export function TornFilters() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="torn-fiber" x="-4%" y="-4%" width="108%" height="108%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

/**
 * Pedaço de papel rasgado. Por baixo, o miolo claro do papel aparece num filete
 * desfiado ao longo do rasgo; por cima, a face colorida (bg-*) com o conteúdo.
 * Sombra curta de contato, como papel colado.
 */
export function Torn({
  seed,
  className = "",
  innerClassName = "",
  edges = "trbl",
  jag = 6,
  rim = "#f7f1e3",
  shadow = true,
  style,
  children,
}: {
  seed: number;
  className?: string;
  innerClassName?: string;
  edges?: string;
  jag?: number;
  rim?: string;
  shadow?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  // A cor (bg-*) vai para a face; posição e tamanho ficam no invólucro.
  const tokens = className.split(/\s+/).filter(Boolean);
  const color = tokens.filter((c) => /^bg-/.test(c)).join(" ");
  const frame = tokens.filter((c) => !/^bg-/.test(c));
  if (!frame.some((c) => /^(absolute|fixed|sticky|relative)$/.test(c))) frame.push("relative");
  return (
    <div
      className={frame.join(" ")}
      style={{ filter: shadow ? "drop-shadow(0 1px 1px rgba(21,19,17,0.3)) drop-shadow(0 3px 6px rgba(21,19,17,0.12))" : undefined, ...style }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ filter: "url(#torn-fiber)" }}>
        <div className="h-full w-full" style={{ background: rim, clipPath: tornClip(seed + 977, edges, jag) }} />
      </div>
      <div className={`relative h-full w-full ${color} ${innerClassName}`} style={{ clipPath: tornClip(seed, edges, jag * 0.85, 64, jag * 0.45) }}>
        {children}
      </div>
    </div>
  );
}

type MarkProps = { className?: string; color?: string };

/** Grifo de caneta sob uma palavra. */
export function PenUnderline({ className = "", color = "var(--color-red)" }: MarkProps) {
  return (
    <svg viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden className={`pointer-events-none ${className}`}>
      <path d="M3 10C60 5 140 4 210 6c35 1 62 3 86 1" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M20 13c70-4 150-5 260-3" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity=".8" />
    </svg>
  );
}

/** Círculo de caneta em volta de um destaque. */
export function PenCircle({ className = "", color = "var(--color-red)" }: MarkProps) {
  return (
    <svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden className={`pointer-events-none absolute ${className}`}>
      <path
        d="M170 12C108 4 30 16 12 52c-15 30 22 56 92 62 76 7 172-2 188-38 14-30-34-56-110-62-50-4-112 2-150 14"
        fill="none"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Seta riscada à mão. */
export function PenArrow({ className = "", color = "var(--color-red)" }: MarkProps) {
  return (
    <svg viewBox="0 0 120 50" aria-hidden className={`pointer-events-none ${className}`}>
      <path d="M4 34C30 14 64 10 104 24M90 12l15 12-17 9" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Faíscas de ênfase (três riscos). */
export function PenSparks({ className = "", color = "var(--color-red)" }: MarkProps) {
  return (
    <svg viewBox="0 0 50 50" aria-hidden className={`pointer-events-none ${className}`}>
      <path d="M8 30L2 34M14 16L8 6M28 12l4-11" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

/** Ícone do WhatsApp (traço simples, herda a cor do texto). */
export function WhatsIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" strokeLinejoin="round" />
      <path d="M9 8.6c.2-.5.5-.6.8-.6h.5c.2 0 .4.1.5.4l.7 1.6c.1.3 0 .5-.1.7l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.2-.2.5-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3-.1.6-.6.8-.6.3-1.6.4-3-.2a8.6 8.6 0 0 1-4.3-4.3c-.6-1.4-.5-2.4-.2-3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

