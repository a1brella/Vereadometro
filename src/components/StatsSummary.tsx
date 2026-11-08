"use client";

import React, { useEffect, useRef } from "react";
import { MacroStats } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { InkImage, PenArrow, PenUnderline, Torn, WhatsIcon, tornClip } from "@/components/editorial/Editorial";
import { ArrowDown } from "lucide-react";

interface StatsSummaryProps {
  stats: MacroStats;
  onOpenLeadModal: () => void;
}

/** Camada da colagem que reage ao ponteiro (profundidade = intensidade). */
function Layer({
  depth,
  className = "",
  style,
  children,
}: {
  depth: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        ...style,
        translate: `calc(var(--mx, 0) * ${depth}px) calc(var(--my, 0) * ${depth}px)`,
        transition: "translate 500ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

/** Uma linha do extrato: rótulo na tira amarela, pontilhado, o valor. */
function LedgerRow({
  label,
  note,
  value,
  emphasis,
}: {
  label: string;
  note: string;
  value: React.ReactNode;
  emphasis?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-end sm:gap-5" data-reveal>
      <div className="shrink-0">
        <p className="font-display text-[20px] sm:text-[24px]">
          <span className="tag-hl">{label}</span>
        </p>
        <p className="mt-1.5 font-type text-[15px] text-ink-2">{note}</p>
      </div>
      <span aria-hidden className="mb-3 hidden flex-1 border-b-[3px] border-dotted border-blue/60 sm:block" />
      <div className="relative shrink-0">{value}{emphasis}</div>
    </div>
  );
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ stats, onOpenLeadModal }) => {
  const collageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = collageRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    const onMove = (e: PointerEvent) => {
      el.style.setProperty("--mx", (e.clientX / window.innerWidth - 0.5).toFixed(3));
      el.style.setProperty("--my", (e.clientY / window.innerHeight - 0.5).toFixed(3));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <>
      {/* ── Hero: manchete centralizada entre duas pilhas de colagem espelhadas ── */}
      <section ref={collageRef} className="stack paper-news overflow-hidden">
        <div className="page flex min-h-[calc(100svh-64px)] items-center justify-center py-20 lg:py-28">
          {/* Pilha esquerda: xilogravura, algodão impresso e flor do mandacaru */}
          <div aria-hidden className="absolute -bottom-[6%] left-[-4vw] top-[5%] hidden w-[30vw] max-w-[520px] lg:block">
            <Layer depth={-8} className="left-[6%] top-[0%] w-[78%]" style={{ rotate: "-5deg" }}>
              <div className="bg-yellow p-3 shadow-[0_6px_14px_rgba(21,19,17,0.2)]">
                <InkImage src="/collage/xilogravura-ink.webp" color="var(--color-ink)" className="aspect-square w-full opacity-80" />
              </div>
            </Layer>
            <Layer depth={14} className="right-[0%] top-[34%] w-[48%]" style={{ rotate: "6deg" }}>
              <div className="sheet p-2">
                <img src="/collage/algodao.webp" alt="" className="aspect-[3/4] w-full object-cover" />
              </div>
              <div className="tape -top-3 left-1/4 !w-14 rotate-[-4deg]" />
            </Layer>
            <Layer depth={22} className="-bottom-[2%] left-[0%] w-[66%]" style={{ rotate: "-6deg" }}>
              <img src="/collage/flor-mandacaru.webp" alt="" className="w-full drop-shadow-[0_6px_10px_rgba(21,19,17,0.25)]" data-intro="drop" style={{ ["--d" as string]: "350ms", ["--r" as string]: "8deg" }} />
            </Layer>
          </div>

          {/* Manchete e chamada */}
          <div className="relative z-10 mx-auto w-full max-w-[760px] text-center" data-intro>
            {/* No celular, uma faixa curta da colagem acima da manchete */}
            <div aria-hidden className="relative mx-auto mb-10 h-32 max-w-[320px] lg:hidden">
              <img src="/collage/cidade-ht.webp" alt="" className="absolute left-0 top-0 w-[62%] -rotate-3 border-4 border-sheet" />
              <img src="/collage/flor-mandacaru.webp" alt="" className="absolute -bottom-2 left-[34%] w-[28%] -rotate-6" />
              <img src="/collage/padre-cicero-ht.webp" alt="" className="absolute -bottom-1 right-0 w-[32%] rotate-3" />
            </div>

            <ul className="flex flex-wrap items-center justify-center gap-2">
              <li className="rounded-full border-2 border-ink px-3.5 py-1 font-type text-[13px] font-bold uppercase tracking-[0.06em] text-ink">
                Auditoria Cidadã 2026
              </li>
              <li className="rounded-full bg-ink px-3.5 py-1 font-type text-[13px] font-bold uppercase tracking-[0.06em] text-paper">
                21 gabinetes fiscalizados
              </li>
            </ul>

            <h1 className="mt-10 font-display text-[clamp(46px,6.4vw,104px)] leading-[0.98] text-ink">
              <span className="lg:block">Quanto custa </span>
              <span className="lg:block">cada vereador de </span>
              <span className="lg:block">Juazeiro do Norte </span>
              <span className="mt-3 inline-block lg:mt-5">
                <span className="tag-hl px-[0.25em] leading-[1.02]">ao seu bolso?</span>
              </span>
            </h1>

            <p className="mx-auto mt-12 max-w-[34rem] font-type text-[17px] leading-[1.75] text-ink-2 sm:text-[18px]">
              Acompanhe salários, verbas de gabinete, centenas de assessores contratados e a produção real de projetos.{" "}
              <strong className="font-bold text-ink">Receba o extrato mensal diretamente no seu WhatsApp.</strong>
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#ranking-section"
                className="inline-flex min-h-[56px] items-center gap-3 bg-ink px-7 font-display text-[20px] text-paper rounded-[12px] shadow-[inset_0_-3px_0_rgba(0,0,0,0.22),0_4px_10px_-2px_rgba(21,19,17,0.28)] transition-[background-color,color,transform,box-shadow] duration-150 hover:-translate-y-0.5 active:translate-y-px active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.22),0_1px_3px_rgba(21,19,17,0.2)] hover:bg-red"
              >
                Ver Ranking de Gastos
                <ArrowDown className="size-5" aria-hidden />
              </a>
              <button
                type="button"
                onClick={onOpenLeadModal}
                className="inline-flex min-h-[56px] cursor-pointer items-center gap-3 bg-[#128c4a] px-7 font-display text-[20px] text-white rounded-[12px] shadow-[inset_0_-3px_0_rgba(0,0,0,0.22),0_4px_10px_-2px_rgba(21,19,17,0.28)] transition-[background-color,color,transform,box-shadow] duration-150 hover:-translate-y-0.5 active:translate-y-px active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.22),0_1px_3px_rgba(21,19,17,0.2)] hover:bg-[#0d6e3a]"
              >
                <WhatsIcon className="size-6" />
                Alerta no Zap
              </button>
            </div>
          </div>

          {/* Pilha direita: a cidade impressa, papel vermelho e o Padre Cícero */}
          <div
            aria-label="Colagem: a cidade de Juazeiro do Norte e o Padre Cícero em 1924"
            role="img"
            className="absolute -bottom-[6%] right-[-4vw] top-[5%] hidden w-[30vw] max-w-[520px] lg:block"
          >
            <Layer depth={-12} className="left-[0%] top-[0%] w-[86%]" style={{ rotate: "4deg" }}>
              <div className="sheet p-2">
                <img src="/collage/cidade-ht.webp" alt="" className="aspect-[4/3] w-full object-cover" data-intro="clip" />
              </div>
              <div className="tape -top-3 left-1/3 !w-16 rotate-[3deg]" />
            </Layer>
            <Layer depth={-4} className="bottom-[6%] right-[0%] w-[58%]" style={{ rotate: "-4deg" }}>
              <div className="aspect-[4/5] w-full bg-red shadow-[0_6px_14px_rgba(21,19,17,0.2)]" />
            </Layer>
            <Layer depth={18} className="-bottom-[2%] right-[4%] w-[66%]" style={{ rotate: "3deg" }}>
              <img
                src="/collage/padre-cicero-ht.webp"
                alt=""
                className="w-full drop-shadow-[0_6px_10px_rgba(21,19,17,0.3)]"
                data-intro="drop"
                style={{ ["--d" as string]: "250ms", ["--r" as string]: "-8deg" }}
              />
            </Layer>
            <Layer depth={10} className="bottom-[46%] left-[0%]" style={{ rotate: "-4deg" }}>
              <p className="tag-paper font-hand text-[16px]">Pe. Cícero, c. 1924</p>
            </Layer>
          </div>
        </div>
      </section>

      {/* ── Extrato: folha colada sobre a colagem ─────── */}
      <section className="stack paper-yellow overflow-hidden py-16 lg:py-24">
        <Torn seed={32} jag={9} className="absolute -left-10 top-6 -z-10 hidden w-[22%] rotate-[-4deg] md:block">
          <img src="/collage/romeiro-vela-ht.webp" alt="" aria-hidden className="block w-full" />
        </Torn>
        <Torn seed={33} edges="tlb" jag={9} className="absolute -right-16 top-10 -z-10 hidden w-[24%] rotate-[3deg] md:block">
          <img src="/collage/basilica-ht.webp" alt="" aria-hidden className="block w-full" />
        </Torn>

        <div className="page">
          {/* As fitas ficam fora do recorte da folha, para não serem cortadas */}
          <div className="relative mx-auto max-w-7xl -rotate-[0.5deg] drop-shadow-[0_4px_8px_rgba(21,19,17,0.18)]">
          <div className="tape -top-3 left-[14%] z-10 rotate-[-4deg]" />
          <div className="tape -top-3 right-[14%] z-10 rotate-[3deg]" />
          <div className="bg-sheet px-5 py-3 sm:px-10" style={{ clipPath: tornClip(35, "trbl", 7, 40) }}>
            <div className="divide-y-2 divide-blue/25">
              <LedgerRow
                label="Custo Total Anual"
                note="Soma dos 21 gabinetes em 2026"
                value={<p className="tabular font-display text-[clamp(40px,5.6vw,76px)] leading-none">{formatCurrency(stats.totalGastoAno)}</p>}
                emphasis={<PenUnderline className="absolute -bottom-2 right-0 h-3 w-[70%]" color="var(--color-yellow)" />}
              />
              <LedgerRow
                label="Custo Médio / Mês"
                note="Por vereador a cada 30 dias"
                value={<p className="tabular font-display text-[clamp(40px,5.6vw,76px)] leading-none">{formatCurrency(stats.mediaCustoMensal)}</p>}
              />
              <LedgerRow
                label="Assessores Nomeados"
                note="Folha mantida pelo contribuinte"
                value={
                  <p className="flex items-end gap-3">
                    <span className="tabular font-display text-[clamp(40px,5.6vw,76px)] leading-none">{stats.totalAssessoresGeral}</span>
                    <span className="mb-1 bg-yellow px-2 py-0.5 font-type text-[18px] font-bold">cargos</span>
                  </p>
                }
              />
              <LedgerRow
                label="Gabinete + Caro"
                note={`${formatCurrency(stats.vereadorMaisCaro.custoMes)} / mês`}
                value={<p className="relative font-display text-[clamp(36px,5vw,68px)] leading-none text-red">{stats.vereadorMaisCaro.nome}</p>}
                emphasis={
                  <>
                    <PenArrow className="absolute -left-24 top-1/2 hidden h-8 w-20 -translate-y-1/2 sm:block" />
                  </>
                }
              />
            </div>
          </div>
          </div>
        </div>
      </section>

    </>
  );
};
