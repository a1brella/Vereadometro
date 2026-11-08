"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { VereadorWithDetails } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { Torn } from "@/components/editorial/Editorial";

/** Colunas da lista no desktop — compartilhadas com o cabeçalho ordenável. */
export const RANKING_COLS =
  "lg:grid-cols-[4rem_4.5rem_minmax(0,1.6fr)_minmax(10.5rem,1fr)_repeat(3,5rem)_1.5rem]";

interface VereadorRowProps {
  vereador: VereadorWithDetails;
  onDetails: (vereador: VereadorWithDetails) => void;
}

/**
 * Uma linha do ranking. A linha inteira abre o dossiê do gabinete,
 * onde ficam as ações (seguir no Zap, compartilhar).
 */
export const VereadorRow: React.FC<VereadorRowProps> = ({ vereador, onDetails }) => {
  const zero = vereador.totalProjetos === 0;
  const top = vereador.rankingGeral <= 3;
  const cell = "tabular hidden h-full items-center justify-center border-l border-ink/25 text-[20px] font-bold lg:flex";

  return (
    <li>
      <button
        type="button"
        onClick={() => onDetails(vereador)}
        aria-label={`Auditar gabinete de ${vereador.nomeParlamentar}`}
        className={`group grid w-full cursor-pointer grid-cols-[2.75rem_3.25rem_1fr] items-center gap-x-3 gap-y-2 border-b-2 border-dashed border-ink/25 px-1 py-4 text-left transition-colors hover:bg-sheet/70 focus-visible:bg-sheet focus-visible:outline-none lg:gap-x-4 lg:px-4 ${RANKING_COLS}`}
      >
        {/* Posição: papel vermelho rasgado */}
        <Torn
          seed={vereador.rankingGeral * 7 + 3}
          jag={4}
          className={`h-10 w-11 lg:h-12 lg:w-14 ${top ? "bg-red" : "bg-ink"}`}
          innerClassName="flex items-center justify-center font-display text-[24px] text-white lg:text-[28px]"
        >
          {vereador.rankingGeral}
        </Torn>

        {/* Retrato sobre o amarelo */}
        <span className="duo-yellow block h-[64px] w-[52px] lg:h-[76px] lg:w-[62px]">
          <img src={vereador.fotoUrl} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
        </span>

        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="truncate font-display text-[22px] leading-none text-ink group-hover:text-red lg:text-[26px]">
              {vereador.nomeParlamentar}
            </span>
            {top && (
              <span className="bg-red px-1.5 py-0.5 font-type text-[11px] font-bold uppercase leading-none text-white">
                Top Gastos
              </span>
            )}
          </span>
          <span className="mt-1 block truncate text-[14px] text-ink-2">
            <span className="font-bold text-ink">{vereador.partido}</span> · {vereador.nomeCompleto}
          </span>
        </span>

        {/* Custo */}
        <span className="col-span-3 col-start-3 lg:col-span-1 lg:col-start-auto lg:flex lg:h-full lg:flex-col lg:justify-center lg:border-l lg:border-ink/25 lg:pl-5">
          <span className="tabular inline-block self-start whitespace-nowrap bg-yellow px-1.5 text-[22px] font-extrabold leading-tight text-ink [font-stretch:110%]">
            {formatCurrency(vereador.totalGastoMes)}
            <span className="ml-1 text-[13px] font-semibold text-ink-2 [font-stretch:100%] lg:hidden">/ mês</span>
          </span>
          <span className="tabular mt-1 hidden whitespace-nowrap text-[13px] text-ink-2 lg:block">
            Acumulado no Ano: {formatCurrency(vereador.totalGastoAno)}
          </span>
        </span>

        {/* Métricas: frase curta no celular, colunas com divisórias no desktop */}
        <span className="tabular col-span-3 col-start-3 font-type text-[14px] text-ink-2 lg:hidden">
          {vereador.totalAssessores} assessores ·{" "}
          <span className={zero ? "font-bold text-red" : ""}>{vereador.totalProjetos} projetos</span> ·{" "}
          {vereador.taxaPresenca}% presença
        </span>
        <span className={cell}>{vereador.totalAssessores}</span>
        <span className={`${cell} ${zero ? "text-red" : ""}`}>{vereador.totalProjetos}</span>
        <span className={cell}>{vereador.taxaPresenca}%</span>

        <ArrowUpRight
          aria-hidden
          className="hidden size-6 text-ink transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-red lg:block"
        />

        {zero && (
          <span className="col-span-3 col-start-3 font-type text-[14px] font-bold text-red lg:col-span-6 lg:col-start-3">
            Alerta Crítico: {formatCurrency(vereador.totalGastoAno)} pagos em 2026 e 0 projetos apresentados.
          </span>
        )}
      </button>
    </li>
  );
};
