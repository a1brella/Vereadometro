"use client";

import React from "react";
import { Share2, BellRing, Info, AlertOctagon, CheckCircle2, UserCheck, FileCode2 } from "lucide-react";
import { VereadorWithDetails } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface VereadorCardProps {
  vereador: VereadorWithDetails;
  onFollow: (vereador: VereadorWithDetails) => void;
  onShare: (vereador: VereadorWithDetails) => void;
  onDetails: (vereador: VereadorWithDetails) => void;
}

export const VereadorCard: React.FC<VereadorCardProps> = ({
  vereador,
  onFollow,
  onShare,
  onDetails,
}) => {
  const isTopSpender = vereador.rankingGeral <= 3;
  const hasZeroProjects = vereador.totalProjetos === 0;

  return (
    <div
      onClick={() => onDetails(vereador)}
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 hover:shadow-xl cursor-pointer hover:border-emerald-500/60 ${
        isTopSpender
          ? "border-red-900/60 bg-gradient-to-b from-slate-900 via-slate-900 to-red-950/20 shadow-red-950/20"
          : "border-slate-800 bg-slate-900/70 hover:border-slate-700 shadow-slate-950/50"
      }`}
    >
      {/* Top Banner do Card */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar & Identificação */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={vereador.fotoUrl}
                alt={vereador.nomeParlamentar}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-700 shadow-md group-hover:border-emerald-500/60 transition"
                loading="lazy"
              />
              <span className="absolute -bottom-1 -right-1 rounded-md bg-slate-950/90 px-1.5 py-0.5 text-[10px] font-black text-slate-200 border border-slate-700">
                {vereador.partido}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-black ${
                    vereador.rankingGeral === 1
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : vereador.rankingGeral <= 3
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  #{vereador.rankingGeral} no ranking
                </span>
                {isTopSpender && (
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    🔥 Top Gastos
                  </span>
                )}
              </div>
              <h3 className="mt-1 font-bold text-base sm:text-lg text-white leading-snug group-hover:text-emerald-400 transition">
                {vereador.nomeParlamentar}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[170px] sm:max-w-[210px]">
                {vereador.nomeCompleto}
              </p>
            </div>
          </div>
        </div>

        {/* Bloco de Destaque Financeiro */}
        <div className="mt-4 rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-400">Custo Total no Mês</span>
            <span className="text-lg sm:text-xl font-black text-emerald-400">
              {formatCurrency(vereador.totalGastoMes)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Acumulado no Ano:</span>
            <span className="font-semibold text-slate-200">
              {formatCurrency(vereador.totalGastoAno)}
            </span>
          </div>
        </div>

        {/* Métricas do Mandato (Assessores, Projetos, Presença) */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-800/40 border border-slate-800 p-2">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[10px] font-medium uppercase">Assessores</span>
            </div>
            <div className="text-sm font-black text-white">
              {vereador.totalAssessores}
            </div>
          </div>

          <div className="rounded-xl bg-slate-800/40 border border-slate-800 p-2">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
              <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-medium uppercase">Projetos</span>
            </div>
            <div
              className={`text-sm font-black ${
                hasZeroProjects ? "text-red-400 animate-pulse" : "text-white"
              }`}
            >
              {vereador.totalProjetos}
            </div>
          </div>

          <div className="rounded-xl bg-slate-800/40 border border-slate-800 p-2">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-medium uppercase">Presença</span>
            </div>
            <div className="text-sm font-black text-white">
              {vereador.taxaPresenca}%
            </div>
          </div>
        </div>

        {/* Alerta de Custo-Benefício / Desperdício Cívico */}
        <div className="mt-3">
          {hasZeroProjects ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-700/50 p-2.5 text-left text-xs text-red-300">
              <AlertOctagon className="w-4 h-4 shrink-0 text-red-400" />
              <span>
                <strong>Alerta Crítico:</strong> R$ {formatCurrency(vereador.totalGastoAno)} pagos em 2026 e <strong>0 projetos apresentados</strong>.
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-slate-800/30 border border-slate-800 px-3 py-2 text-xs">
              <span className="text-slate-400">Custo por Projeto:</span>
              <span className="font-bold text-slate-200">
                {formatCurrency(vereador.custoPorProjeto)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Ações Rápidas */}
      <div className="border-t border-slate-800 bg-slate-950/50 p-3 flex items-center gap-2 rounded-b-2xl">
        {/* Botão de Seguir no WhatsApp */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFollow(vereador);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 py-2 px-3 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 active:scale-95 transition"
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Seguir no Zap</span>
        </button>

        {/* Botão de Compartilhar Card */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(vereador);
          }}
          title="Compartilhar no WhatsApp / Redes"
          className="flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 py-2 px-3 text-xs font-semibold text-slate-200 active:scale-95 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* Botão de Auditoria Completa */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetails(vereador);
          }}
          title="Ver auditoria detalhada do gabinete"
          className="flex items-center gap-1.5 justify-center rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 py-2 px-3 text-xs font-bold text-slate-200 active:scale-95 transition"
        >
          <Info className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Auditar</span>
        </button>
      </div>
    </div>
  );
};
