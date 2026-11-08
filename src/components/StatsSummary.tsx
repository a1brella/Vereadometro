import React from "react";
import { Users, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { MacroStats } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface StatsSummaryProps {
  stats: MacroStats;
  onOpenLeadModal: () => void;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ stats, onOpenLeadModal }) => {

  return (
    <section className="relative overflow-hidden pt-8 pb-6 px-4 sm:px-6">
      {/* Luz ambiente cívica de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-emerald-500/10 blur-[100px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl">
        {/* Chamada de Impacto Popular */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-emerald-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Exercício Legislativo 2026 • 21 Gabinetes Fiscalizados
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Quanto custa cada vereador de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400">
              Juazeiro do Norte
            </span>{" "}
            ao seu bolso?
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300">
            Acompanhe salários, verbas de gabinete, centenas de assessores contratados e a produção real de projetos. Receba o extrato mensal diretamente no seu WhatsApp.
          </p>
        </div>

        {/* Grid de 4 Cards de Métricas Principais */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {/* Card 1: Custo Total Acumulado */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur shadow-sm hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Custo Total Anual</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {formatCurrency(stats.totalGastoAno)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Soma dos 21 gabinetes em 2026
            </p>
          </div>

          {/* Card 2: Custo Médio Mensal */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur shadow-sm hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Custo Médio / Mês</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {formatCurrency(stats.mediaCustoMensal)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Por vereador a cada 30 dias
            </p>
          </div>

          {/* Card 3: Total de Assessores */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur shadow-sm hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Assessores Nomeados</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {stats.totalAssessoresGeral}{" "}
              <span className="text-xs font-normal text-slate-400">cargos</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Folha mantida pelo contribuinte
            </p>
          </div>

          {/* Card 4: Maior Custo do Mês */}
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-4 backdrop-blur shadow-sm hover:border-red-700/60 transition">
            <div className="flex items-center justify-between text-red-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Gabinete + Caro</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-red-300 truncate">
              {stats.vereadorMaisCaro.nome}
            </div>
            <p className="text-[11px] text-red-400/90 font-medium mt-1">
              {formatCurrency(stats.vereadorMaisCaro.custoMes)} / mês
            </p>
          </div>
        </div>

        {/* CTA Banner de Alerta Rápido */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-lg">
              📱
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Não deixe o dinheiro da sua cidade sumir sem explicação
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Cadastre seu WhatsApp e receba alertas quando seu vereador gastar verba de gabinete ou nomear assessores.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLeadModal}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 active:scale-95 transition"
          >
            <span>Quero Receber no WhatsApp</span>
            <span>👉</span>
          </button>
        </div>
      </div>
    </section>
  );
};
